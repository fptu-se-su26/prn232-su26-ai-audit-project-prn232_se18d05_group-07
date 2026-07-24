using System.Threading.Tasks;
using Application.Common.DTOs.Chats;

namespace Application.Common.Interfaces
{
    public interface IChatNotifier
    {
        Task NotifyMessageCreatedAsync(ChatMessageDto message);
    }
}
