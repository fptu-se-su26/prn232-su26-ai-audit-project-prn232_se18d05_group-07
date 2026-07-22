namespace Application.Common.DTOs.Dashboard;

public sealed class AdminDashboardSummaryDto
{
    public DateTime From { get; init; }
    public DateTime To { get; init; }
    public int TotalUsers { get; init; }
    public int NewUsers { get; init; }
    public IReadOnlyDictionary<string, int> UsersByRole { get; init; } = new Dictionary<string, int>();
    public int TotalBuildings { get; init; }
    public int TotalRooms { get; init; }
    public int OccupiedRooms { get; init; }
    public decimal OccupancyRate { get; init; }
    public ListingStatusSummaryDto Listings { get; init; } = new();
    public int PendingSubscriptions { get; init; }
    public int ActiveSubscriptions { get; init; }
    public decimal SubscriptionRevenue { get; init; }
    public int OpenMaintenanceTickets { get; init; }
}

public sealed class ListingStatusSummaryDto
{
    public int Pending { get; init; }
    public int Flagged { get; init; }
    public int Approved { get; init; }
    public int Rejected { get; init; }
    public int Total => Pending + Flagged + Approved + Rejected;
}

public sealed class AdminTrendPointDto
{
    public DateTime PeriodStart { get; init; }
    public DateTime PeriodEnd { get; init; }
    public int Count { get; init; }
}

public sealed class SubscriptionRevenuePointDto
{
    public DateTime PeriodStart { get; init; }
    public DateTime PeriodEnd { get; init; }
    public decimal Revenue { get; init; }
}

public sealed class AdminActivityDto
{
    public long Id { get; init; }
    public string Action { get; init; } = string.Empty;
    public string EntityType { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public string? ActorName { get; init; }
    public string? Details { get; init; }
    public DateTime CreatedAt { get; init; }
}
