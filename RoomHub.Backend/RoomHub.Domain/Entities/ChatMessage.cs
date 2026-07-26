using System;

namespace Domain.Entities
{
    public class ChatMessage
    {
        public long Id { get; set; }
        public long ConversationId { get; set; }
        public string SenderId { get; set; } = null!;
        public string ReceiverId { get; set; } = null!;
        public string MessageText { get; set; } = null!;
        public string? AttachmentUrl { get; set; }
        public string? AttachmentName { get; set; }
        public string? AttachmentContentType { get; set; }
        public long? AttachmentSize { get; set; }
        public string? ClientMessageId { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        public bool IsRead { get; set; }

        // Navigation properties
        public virtual Conversation Conversation { get; set; } = null!;
        public virtual ApplicationUser Sender { get; set; } = null!;
        public virtual ApplicationUser Receiver { get; set; } = null!;
    }
}
