namespace Application.Common.DTOs.Chats
{
    public class CreateConversationRequestDto
    {
        public string OwnerId { get; set; } = string.Empty;
        public int RoomId { get; set; }
    }
}
