using System.Threading.Tasks;
using Application.Common.DTOs.Chats;

namespace Application.Common.Interfaces
{
    public interface IChatNotifier
    {
        Task NotifyMessageCreatedAsync(ChatMessageDto message);
        Task NotifyMessagesReadAsync(
            long conversationId,
            string readerId,
            string ownerId,
            string tenantId,
            IReadOnlyCollection<long> messageIds,
            DateTime readAt);
    }
}
