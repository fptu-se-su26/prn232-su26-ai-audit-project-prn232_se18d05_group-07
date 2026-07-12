using System;
using System.Collections.Generic;

namespace Application.Common.DTOs.Chats
{
    public class ConversationDto
    {
        public long Id { get; set; }
        public string OwnerId { get; set; } = string.Empty;
        public string OwnerName { get; set; } = string.Empty;
        public string TenantId { get; set; } = string.Empty;
        public string TenantName { get; set; } = string.Empty;
        public string? LastMessage { get; set; }
        public DateTime UpdatedAt { get; set; }
        public int UnreadCount { get; set; }
    }
}
