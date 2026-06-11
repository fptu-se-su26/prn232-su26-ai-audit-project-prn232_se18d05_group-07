using System.Collections.Generic;
using System.Threading.Tasks;
using Application.Common.DTOs.Subscriptions;

namespace Application.Common.Interfaces
{
    public interface ISubscriptionService
    {
        Task<SubscriptionStatusDto> GetSubscriptionStatusAsync(string ownerId);
        Task<UpgradeResponseDto> RequestUpgradeAsync(string ownerId, UpgradeRequestDto request);
        Task<bool> HandlePayOSWebhookAsync(string webhookData);
        Task<List<AdminSubscriptionDto>> GetPendingSubscriptionsAsync();
        Task<bool> ApproveSubscriptionAsync(int subscriptionId, string adminId);
        Task<bool> RejectSubscriptionAsync(int subscriptionId, string rejectReason, string adminId);
    }
}
