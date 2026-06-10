using System;

namespace Application.Common.DTOs.Notifications
{
    public class NotificationDto
    {
        public long Id { get; set; }
        public string UserId { get; set; } = null!;
        public string? Type { get; set; }
        public string? Title { get; set; }
        public string? Content { get; set; }
        public int? LinkedId { get; set; }
        public bool IsRead { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
