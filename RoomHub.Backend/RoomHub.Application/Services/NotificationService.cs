using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Common.DTOs.Notifications;
using Application.Common.Interfaces;
using Domain.Entities;

namespace Application.Services
{
    public class NotificationService : INotificationService
    {
        private readonly INotificationRepository _notificationRepository;
        private readonly IUnitOfWork _unitOfWork;

        public NotificationService(INotificationRepository notificationRepository, IUnitOfWork unitOfWork)
        {
            _notificationRepository = notificationRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task<List<NotificationDto>> GetNotificationsAsync(string userId)
        {
            var notifications = await _notificationRepository.GetByUserIdAsync(userId);
            return notifications.Select(n => new NotificationDto
            {
                Id = n.Id,
                UserId = n.UserId,
                Type = n.Type,
                Title = n.Title,
                Content = n.Content,
                LinkedId = n.LinkedId,
                IsRead = n.IsRead,
                CreatedAt = n.CreatedAt
            }).ToList();
        }

        public async Task<int> GetUnreadCountAsync(string userId)
        {
            return await _notificationRepository.GetUnreadCountByUserIdAsync(userId);
        }

        public async Task<bool> MarkAsReadAsync(long id, string userId)
        {
            var notification = await _notificationRepository.GetByIdAsync(id);
            if (notification == null || notification.UserId != userId)
                return false;

            if (!notification.IsRead)
            {
                notification.IsRead = true;
                await _notificationRepository.UpdateAsync(notification);
                await _unitOfWork.SaveChangesAsync();
            }
            return true;
        }

        public async Task<bool> MarkAllAsReadAsync(string userId)
        {
            await _notificationRepository.MarkAllAsReadAsync(userId);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteNotificationAsync(long id, string userId)
        {
            var notification = await _notificationRepository.GetByIdAsync(id);
            if (notification == null || notification.UserId != userId)
                return false;

            await _notificationRepository.DeleteAsync(notification);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }
    }
}
