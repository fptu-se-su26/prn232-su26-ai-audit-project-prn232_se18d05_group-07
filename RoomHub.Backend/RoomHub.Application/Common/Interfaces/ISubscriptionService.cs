using System.Collections.Generic;
using System.Threading.Tasks;
using Application.Common.DTOs.Subscriptions;

namespace Application.Common.Interfaces
{
    public interface ISubscriptionService
    {
        Task<SubscriptionStatusDto> GetSubscriptionStatusAsync(string ownerId);
        Task<UpgradeResponseDto> RequestUpgradeAsync(string ownerId, UpgradeRequestDto request);
        Task<bool> HandlePayOSWebhookAsync(string webhookData, string ownerId);
        Task<List<AdminSubscriptionDto>> GetPendingSubscriptionsAsync();
        Task<List<AdminSubscriptionDto>> GetAllSubscriptionsAsync(string? status = "all");
        Task<bool> ApproveSubscriptionAsync(int subscriptionId, string adminId);
        Task<bool> RejectSubscriptionAsync(int subscriptionId, string rejectReason, string adminId);
        Task<bool> RevokeSubscriptionAsync(int subscriptionId, string reason, string adminId);
    }
}
