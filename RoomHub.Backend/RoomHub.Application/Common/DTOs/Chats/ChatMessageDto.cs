using System;

namespace Application.Common.DTOs.Chats
{
    public class ChatMessageDto
    {
        public long Id { get; set; }
        public long ConversationId { get; set; }
        public string SenderId { get; set; } = string.Empty;
        public string ReceiverId { get; set; } = string.Empty;
        public string MessageText { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
        public bool IsRead { get; set; }
    }
}
