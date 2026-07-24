using System;
using System.Collections.Generic;

namespace Domain.Entities
{
    public class Conversation
    {
        public long Id { get; set; }
        public string OwnerId { get; set; } = null!;
        public string TenantId { get; set; } = null!;
        public string? LastMessage { get; set; }
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public virtual ApplicationUser Owner { get; set; } = null!;
        public virtual ApplicationUser Tenant { get; set; } = null!;
        public virtual ICollection<ChatMessage> Messages { get; set; } = new List<ChatMessage>();
    }
}
