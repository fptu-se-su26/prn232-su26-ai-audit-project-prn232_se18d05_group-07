namespace Application.Common.DTOs.Chats
{
    public class SendMessageRequestDto
    {
        public string MessageText { get; set; } = string.Empty;
        public string ClientMessageId { get; set; } = string.Empty;
    }
}
