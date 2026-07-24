using System.Collections.Generic;
using System.Threading.Tasks;
using Application.Common.DTOs.Chats;

namespace Application.Common.Interfaces
{
    public interface IChatService
    {
        Task<List<ConversationDto>> GetConversationsAsync(string userId);
        Task<List<ChatMessageDto>> GetMessagesAsync(long conversationId, string userId);
        Task<ChatMessageDto> SendMessageAsync(long conversationId, string senderId, SendMessageRequestDto request);
        Task<ConversationDto> CreateOrGetConversationAsync(string tenantId, string ownerId);
    }
}
