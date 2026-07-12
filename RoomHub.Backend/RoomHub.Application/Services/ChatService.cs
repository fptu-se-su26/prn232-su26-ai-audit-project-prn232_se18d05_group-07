using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Common.DTOs.Chats;
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

        public ChatService(
            IConversationRepository conversationRepository,
            IChatMessageRepository chatMessageRepository,
            IUnitOfWork unitOfWork,
            IChatNotifier chatNotifier)
        {
            _conversationRepository = conversationRepository;
            _chatMessageRepository = chatMessageRepository;
            _unitOfWork = unitOfWork;
            _chatNotifier = chatNotifier;
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
                LastMessage = c.LastMessage,
                UpdatedAt = c.UpdatedAt,
                UnreadCount = c.Messages.Count(m => m.ReceiverId == userId && !m.IsRead)
            }).ToList();
        }

        public async Task<List<ChatMessageDto>> GetMessagesAsync(long conversationId, string userId)
        {
            var conversation = await _conversationRepository.GetByIdAsync(conversationId);
            if (conversation == null) throw new Exception("Conversation not found");
            if (conversation.OwnerId != userId && conversation.TenantId != userId)
                throw new Exception("Unauthorized access to conversation");

            var messages = await _chatMessageRepository.GetByConversationIdAsync(conversationId);

            // Mark unread as read
            await _chatMessageRepository.MarkAsReadAsync(conversationId, userId);

            return messages.Select(m => new ChatMessageDto
            {
                Id = m.Id,
                ConversationId = m.ConversationId,
                SenderId = m.SenderId,
                ReceiverId = m.ReceiverId,
                MessageText = m.MessageText,
                Timestamp = m.Timestamp,
                IsRead = m.IsRead
            }).ToList();
        }

        public async Task<ChatMessageDto> SendMessageAsync(long conversationId, string senderId, SendMessageRequestDto request)
        {
            var conversation = await _conversationRepository.GetByIdAsync(conversationId);
            if (conversation == null) throw new Exception("Conversation not found");

            if (conversation.OwnerId != senderId && conversation.TenantId != senderId)
                throw new Exception("Unauthorized access to conversation");

            string receiverId = senderId == conversation.OwnerId ? conversation.TenantId : conversation.OwnerId;

            var message = new ChatMessage
            {
                ConversationId = conversationId,
                SenderId = senderId,
                ReceiverId = receiverId,
                MessageText = request.MessageText,
                Timestamp = DateTime.UtcNow,
                IsRead = false
            };

            await _chatMessageRepository.AddAsync(message);

            conversation.LastMessage = request.MessageText;
            conversation.UpdatedAt = DateTime.UtcNow;
            await _conversationRepository.UpdateAsync(conversation);
            await _unitOfWork.SaveChangesAsync();

            var messageDto = new ChatMessageDto
            {
                Id = message.Id,
                ConversationId = message.ConversationId,
                SenderId = message.SenderId,
                ReceiverId = message.ReceiverId,
                MessageText = message.MessageText,
                Timestamp = message.Timestamp,
                IsRead = message.IsRead
            };

            await _chatNotifier.NotifyMessageCreatedAsync(messageDto);
            return messageDto;
        }

        public async Task<ConversationDto> CreateOrGetConversationAsync(string tenantId, string ownerId)
        {
            var existing = await _conversationRepository.GetByParticipantsAsync(ownerId, tenantId);
            if (existing != null)
            {
                return new ConversationDto
                {
                    Id = existing.Id,
                    OwnerId = existing.OwnerId,
                    OwnerName = existing.Owner?.FullName ?? "Unknown",
                    TenantId = existing.TenantId,
                    TenantName = existing.Tenant?.FullName ?? "Unknown",
                    LastMessage = existing.LastMessage,
                    UpdatedAt = existing.UpdatedAt
                };
            }

            var newConversation = new Conversation
            {
                OwnerId = ownerId,
                TenantId = tenantId,
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
                LastMessage = fetched.LastMessage,
                UpdatedAt = fetched.UpdatedAt
            };
        }
    }
}
