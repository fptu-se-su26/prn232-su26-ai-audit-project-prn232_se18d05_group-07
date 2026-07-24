using Application.Common.DTOs.Dashboard;

namespace Application.Common.Interfaces;

public interface IAdminDashboardService
{
    Task<AdminDashboardSummaryDto> GetSummaryAsync(DateTime fromUtc, DateTime toUtc);
    Task<IReadOnlyList<AdminTrendPointDto>> GetUserGrowthAsync(DateTime fromUtc, DateTime toUtc, string granularity);
    Task<ListingStatusSummaryDto> GetListingStatusesAsync(DateTime fromUtc, DateTime toUtc);
    Task<IReadOnlyList<SubscriptionRevenuePointDto>> GetSubscriptionRevenueAsync(DateTime fromUtc, DateTime toUtc);
    Task<IReadOnlyList<AdminActivityDto>> GetRecentActivitiesAsync(int limit);
}
