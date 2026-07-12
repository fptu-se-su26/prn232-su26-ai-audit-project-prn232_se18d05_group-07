using System.Collections.Generic;
using System.Threading.Tasks;
using Domain.Entities;

namespace Application.Common.Interfaces
{
    public interface IChatMessageRepository
    {
        Task<List<ChatMessage>> GetByConversationIdAsync(long conversationId);
        Task<ChatMessage> AddAsync(ChatMessage message);
        Task MarkAsReadAsync(long conversationId, string receiverId);
    }
}
