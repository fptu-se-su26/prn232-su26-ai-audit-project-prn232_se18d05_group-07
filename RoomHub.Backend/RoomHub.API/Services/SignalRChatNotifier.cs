using System.Threading.Tasks;
using Application.Common.DTOs.Chats;
using Application.Common.Interfaces;
using Microsoft.AspNetCore.SignalR;
using RoomHub.API.Hubs;

namespace RoomHub.API.Services
{
    public class SignalRChatNotifier : IChatNotifier
    {
        private readonly IHubContext<ChatHub> _hubContext;

        public SignalRChatNotifier(IHubContext<ChatHub> hubContext)
        {
            _hubContext = hubContext;
        }

        public async Task NotifyMessageCreatedAsync(ChatMessageDto message)
        {
            await _hubContext.Clients.User(message.ReceiverId)
                .SendAsync("messageReceived", message);

            await _hubContext.Clients.Users(message.SenderId, message.ReceiverId)
                .SendAsync("conversationUpdated", message.ConversationId);
        }
    }
}
