using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace RoomHub.API.Hubs
{
    [Authorize]
    public class ChatHub : Hub
    {
    }
}
