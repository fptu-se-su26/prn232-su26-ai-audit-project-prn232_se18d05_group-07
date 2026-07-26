using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Application.Common.Interfaces;
using System.Security.Claims;
using System.Threading.Tasks;

namespace RoomHub.API.Hubs
{
    [Authorize]
    public class ChatHub : Hub
    {
        private readonly IConversationRepository _conversations;

        public ChatHub(IConversationRepository conversations) => _conversations = conversations;

        public async Task SendCallSignal(long conversationId, string type, object? payload)
        {
            var callerId = Context.User?.FindFirstValue(ClaimTypes.NameIdentifier);
            var conversation = await _conversations.GetByIdAsync(conversationId);
            if (callerId == null || conversation == null ||
                (conversation.OwnerId != callerId && conversation.TenantId != callerId))
                throw new HubException("Bạn không có quyền thực hiện cuộc gọi này.");

            var targetId = callerId == conversation.OwnerId ? conversation.TenantId : conversation.OwnerId;
            await Clients.User(targetId).SendAsync("callSignal", new
            {
                conversationId,
                fromUserId = callerId,
                type,
                payload
            });
        }
    }
}
