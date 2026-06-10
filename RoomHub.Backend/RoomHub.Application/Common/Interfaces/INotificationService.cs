using System.Collections.Generic;
using System.Threading.Tasks;
using Application.Common.DTOs.Notifications;

namespace Application.Common.Interfaces
{
    public interface INotificationService
    {
        Task<List<NotificationDto>> GetNotificationsAsync(string userId);
        Task<int> GetUnreadCountAsync(string userId);
        Task<bool> MarkAsReadAsync(long id, string userId);
        Task<bool> MarkAllAsReadAsync(string userId);
        Task<bool> DeleteNotificationAsync(long id, string userId);
    }
}
