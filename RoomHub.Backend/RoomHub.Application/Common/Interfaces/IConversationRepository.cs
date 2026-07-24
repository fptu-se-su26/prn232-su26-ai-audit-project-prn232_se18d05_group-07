using System.Collections.Generic;
using System.Threading.Tasks;
using Domain.Entities;

namespace Application.Common.Interfaces
{
    public interface IConversationRepository
    {
        Task<Conversation?> GetByIdAsync(long id);
        Task<Conversation?> GetByParticipantsAsync(string ownerId, string tenantId);
        Task<List<Conversation>> GetAllForUserAsync(string userId);
        Task<Conversation> AddAsync(Conversation conversation);
        Task UpdateAsync(Conversation conversation);
    }
}
