using System.Collections.Generic;
using System.Threading.Tasks;
using Domain.Entities;

namespace Application.Common.Interfaces
{
    public interface INotificationRepository
    {
        Task<Notification?> GetByIdAsync(long id);
        Task<List<Notification>> GetByUserIdAsync(string userId);
        Task<int> GetUnreadCountByUserIdAsync(string userId);
        Task<Notification?> GetInvitationNotificationAsync(string tenantId, int contractId);
        Task AddAsync(Notification notification);
        Task UpdateAsync(Notification notification);
        Task DeleteAsync(Notification notification);
        Task MarkAllAsReadAsync(string userId);
    }
}
