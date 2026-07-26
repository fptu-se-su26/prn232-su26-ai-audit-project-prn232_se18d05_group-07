namespace Application.Common.DTOs.Chats
{
    public class SendMessageRequestDto
    {
        public string MessageText { get; set; } = string.Empty;
        public string ClientMessageId { get; set; } = string.Empty;
        public string? AttachmentUrl { get; set; }
        public string? AttachmentName { get; set; }
        public string? AttachmentContentType { get; set; }
        public long? AttachmentSize { get; set; }
    }
}
