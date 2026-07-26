using System.Collections.Generic;
using System.Threading.Tasks;
using Domain.Entities;

namespace Application.Common.Interfaces
{
    public interface IChatMessageRepository
    {
        Task<List<ChatMessage>> GetByConversationIdAsync(long conversationId);
        Task<ChatMessage?> GetByClientMessageIdAsync(string senderId, string clientMessageId);
        Task<(ChatMessage Message, bool Created)> AddIdempotentAsync(ChatMessage message);
        Task<List<long>> MarkAsReadAsync(long conversationId, string receiverId);
    }
}
