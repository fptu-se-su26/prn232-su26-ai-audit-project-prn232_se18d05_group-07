using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Common.DTOs.Chats;
using Application.Common.Exceptions;
using Application.Common.Interfaces;
using Domain.Entities;

namespace Application.Services
{
    public class ChatService : IChatService
    {
        private readonly IConversationRepository _conversationRepository;
        private readonly IChatMessageRepository _chatMessageRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IChatNotifier _chatNotifier;
        private readonly IChatAccessRepository _chatAccessRepository;

        public ChatService(
            IConversationRepository conversationRepository,
            IChatMessageRepository chatMessageRepository,
            IUnitOfWork unitOfWork,
            IChatNotifier chatNotifier,
            IChatAccessRepository chatAccessRepository)
        {
            _conversationRepository = conversationRepository;
            _chatMessageRepository = chatMessageRepository;
            _unitOfWork = unitOfWork;
            _chatNotifier = chatNotifier;
            _chatAccessRepository = chatAccessRepository;
        }

        public async Task<List<ConversationDto>> GetConversationsAsync(string userId)
        {
            var conversations = await _conversationRepository.GetAllForUserAsync(userId);
            return conversations.Select(c => new ConversationDto
            {
                Id = c.Id,
                OwnerId = c.OwnerId,
                OwnerName = c.Owner?.FullName ?? "Unknown",
                TenantId = c.TenantId,
                TenantName = c.Tenant?.FullName ?? "Unknown",
                RoomId = c.RoomId,
                LastMessage = c.LastMessage,
                UpdatedAt = c.UpdatedAt,
                UnreadCount = c.Messages.Count(m => m.ReceiverId == userId && !m.IsRead)
            }).ToList();
        }

        public async Task<List<ChatMessageDto>> GetMessagesAsync(long conversationId, string userId)
        {
            var conversation = await _conversationRepository.GetByIdAsync(conversationId);
            if (conversation == null) throw new NotFoundException("Không tìm thấy cuộc trò chuyện.");
            if (conversation.OwnerId != userId && conversation.TenantId != userId)
                throw new ForbiddenException("Bạn không phải thành viên của cuộc trò chuyện này.");

            var readIds = await _chatMessageRepository.MarkAsReadAsync(conversationId, userId);
            var messages = await _chatMessageRepository.GetByConversationIdAsync(conversationId);
            if (readIds.Count > 0)
                await _chatNotifier.NotifyMessagesReadAsync(
                    conversationId, userId, conversation.OwnerId, conversation.TenantId, readIds, DateTime.UtcNow);

            return messages.Select(m => new ChatMessageDto
            {
                Id = m.Id,
                ConversationId = m.ConversationId,
                SenderId = m.SenderId,
                ReceiverId = m.ReceiverId,
                MessageText = m.MessageText,
                AttachmentUrl = m.AttachmentUrl,
                AttachmentName = m.AttachmentName,
                AttachmentContentType = m.AttachmentContentType,
                AttachmentSize = m.AttachmentSize,
                Timestamp = m.Timestamp,
                IsRead = m.IsRead
            }).ToList();
        }

        public async Task<ChatMessageDto> SendMessageAsync(long conversationId, string senderId, SendMessageRequestDto request)
        {
            var conversation = await _conversationRepository.GetByIdAsync(conversationId);
            if (conversation == null) throw new NotFoundException("Không tìm thấy cuộc trò chuyện.");

            if (conversation.OwnerId != senderId && conversation.TenantId != senderId)
                throw new ForbiddenException("Bạn không phải thành viên của cuộc trò chuyện này.");

            var messageText = NormalizeMessage(request.MessageText, request.AttachmentUrl);
            var clientMessageId = NormalizeClientMessageId(request.ClientMessageId);
            var existing = await _chatMessageRepository.GetByClientMessageIdAsync(senderId, clientMessageId);
            if (existing is not null)
            {
                if (existing.ConversationId != conversationId || existing.MessageText != messageText)
                    throw new ArgumentException("Client message ID đã được dùng cho một nội dung hoặc cuộc trò chuyện khác.");
                return MapMessage(existing);
            }

            string receiverId = senderId == conversation.OwnerId ? conversation.TenantId : conversation.OwnerId;

            var message = new ChatMessage
            {
                ConversationId = conversationId,
                SenderId = senderId,
                ReceiverId = receiverId,
                MessageText = messageText,
                AttachmentUrl = NormalizeOptional(request.AttachmentUrl, 1000),
                AttachmentName = NormalizeOptional(request.AttachmentName, 255),
                AttachmentContentType = NormalizeOptional(request.AttachmentContentType, 100),
                AttachmentSize = request.AttachmentSize,
                ClientMessageId = clientMessageId,
                Timestamp = DateTime.UtcNow,
                IsRead = false
            };

            var result = await _chatMessageRepository.AddIdempotentAsync(message);
            if (!result.Created)
            {
                if (result.Message.ConversationId != conversationId || result.Message.MessageText != messageText)
                    throw new ArgumentException("Client message ID đã được dùng cho một nội dung hoặc cuộc trò chuyện khác.");
                return MapMessage(result.Message);
            }

            conversation.LastMessage = messageText;
            conversation.UpdatedAt = DateTime.UtcNow;
            await _conversationRepository.UpdateAsync(conversation);
            await _unitOfWork.SaveChangesAsync();

            var messageDto = MapMessage(message);

            await _chatNotifier.NotifyMessageCreatedAsync(messageDto);
            return messageDto;
        }

        public async Task<ConversationDto> CreateOrGetConversationAsync(string tenantId, string ownerId, int roomId)
        {
            ownerId = ownerId?.Trim() ?? string.Empty;
            if (string.IsNullOrWhiteSpace(ownerId) || roomId <= 0)
                throw new ArgumentException("Thông tin chủ phòng và phòng là bắt buộc.");
            if (ownerId == tenantId)
                throw new ArgumentException("Không thể tự tạo cuộc trò chuyện với chính mình.");
            if (!await _chatAccessRepository.CanTenantContactOwnerAsync(tenantId, ownerId, roomId))
                throw new ForbiddenException("Chủ phòng không hợp lệ hoặc tenant không có quyền liên hệ qua phòng này.");

            var existing = await _conversationRepository.GetByParticipantsAsync(ownerId, tenantId);
            if (existing != null)
            {
                if (existing.RoomId != roomId)
                {
                    existing.RoomId = roomId;
                    await _conversationRepository.UpdateAsync(existing);
                    await _unitOfWork.SaveChangesAsync();
                }
                return new ConversationDto
                {
                    Id = existing.Id,
                    OwnerId = existing.OwnerId,
                    OwnerName = existing.Owner?.FullName ?? "Unknown",
                    TenantId = existing.TenantId,
                    TenantName = existing.Tenant?.FullName ?? "Unknown",
                    RoomId = existing.RoomId ?? roomId,
                    LastMessage = existing.LastMessage,
                    UpdatedAt = existing.UpdatedAt
                };
            }

            var newConversation = new Conversation
            {
                OwnerId = ownerId,
                TenantId = tenantId,
                RoomId = roomId,
                UpdatedAt = DateTime.UtcNow
            };

            var created = await _conversationRepository.AddAsync(newConversation);
            await _unitOfWork.SaveChangesAsync();

            // Re-fetch to get user details
            var fetched = await _conversationRepository.GetByIdAsync(created.Id);

            return new ConversationDto
            {
                Id = fetched!.Id,
                OwnerId = fetched.OwnerId,
                OwnerName = fetched.Owner?.FullName ?? "Unknown",
                TenantId = fetched.TenantId,
                TenantName = fetched.Tenant?.FullName ?? "Unknown",
                RoomId = fetched.RoomId,
                LastMessage = fetched.LastMessage,
                UpdatedAt = fetched.UpdatedAt
            };
        }

        private static string NormalizeMessage(string? value, string? attachmentUrl)
        {
            var normalized = string.Join(' ', (value ?? string.Empty)
                .Split((char[]?)null, StringSplitOptions.RemoveEmptyEntries));
            if (normalized.Length == 0 && string.IsNullOrWhiteSpace(attachmentUrl))
                throw new ArgumentException("Nội dung tin nhắn là bắt buộc.");
            if (normalized.Length > 2000)
                throw new ArgumentException("Nội dung tin nhắn không được vượt quá 2000 ký tự.");
            return normalized;
        }

        private static string? NormalizeOptional(string? value, int maxLength)
        {
            var normalized = value?.Trim();
            if (string.IsNullOrEmpty(normalized)) return null;
            if (normalized.Length > maxLength)
                throw new ArgumentException("Thông tin tệp đính kèm không hợp lệ.");
            return normalized;
        }

        private static string NormalizeClientMessageId(string? value)
        {
            if (!Guid.TryParse(value?.Trim(), out var id))
                throw new ArgumentException("Client message ID không hợp lệ.");
            return id.ToString("D");
        }

        private static ChatMessageDto MapMessage(ChatMessage message) => new()
        {
            Id = message.Id,
            ConversationId = message.ConversationId,
            SenderId = message.SenderId,
            ReceiverId = message.ReceiverId,
            MessageText = message.MessageText,
            AttachmentUrl = message.AttachmentUrl,
            AttachmentName = message.AttachmentName,
            AttachmentContentType = message.AttachmentContentType,
            AttachmentSize = message.AttachmentSize,
            Timestamp = message.Timestamp,
            IsRead = message.IsRead
        };
    }
}
