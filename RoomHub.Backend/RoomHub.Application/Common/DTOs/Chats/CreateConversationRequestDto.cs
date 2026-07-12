namespace Application.Common.DTOs.Chats
{
    public class CreateConversationRequestDto
    {
        public string TenantId { get; set; } = string.Empty;
        public string OwnerId { get; set; } = string.Empty;
    }
}
