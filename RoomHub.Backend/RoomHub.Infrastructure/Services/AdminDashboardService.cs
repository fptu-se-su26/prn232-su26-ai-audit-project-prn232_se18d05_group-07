using Application.Common.DTOs.Dashboard;
using Application.Common.Interfaces;
using Domain.Enums;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Services;

public sealed class AdminDashboardService : IAdminDashboardService
{
    private readonly ApplicationDbContext _db;
    public AdminDashboardService(ApplicationDbContext db) => _db = db;

    public async Task<AdminDashboardSummaryDto> GetSummaryAsync(DateTime fromUtc, DateTime toUtc)
    {
        var totalUsers = await _db.Users.AsNoTracking().CountAsync(u => !u.IsDeleted);
        var newUsers = await _db.Users.AsNoTracking().CountAsync(u => !u.IsDeleted && u.CreatedAt >= fromUtc && u.CreatedAt < toUtc);
        var roleRows = await (from user in _db.Users.AsNoTracking()
                              join userRole in _db.UserRoles.AsNoTracking() on user.Id equals userRole.UserId
                              join role in _db.Roles.AsNoTracking() on userRole.RoleId equals role.Id
                              where !user.IsDeleted
                              group user by role.Name into grouped
                              select new { Role = grouped.Key!, Count = grouped.Count() }).ToListAsync();
        var totalBuildings = await _db.Buildings.AsNoTracking().CountAsync(b => !b.IsDeleted);
        var totalRooms = await _db.Rooms.AsNoTracking().CountAsync(r => !r.IsDeleted);
        var occupiedRooms = await _db.Rooms.AsNoTracking().CountAsync(r => !r.IsDeleted && r.Status == RoomStatus.Occupied);
        var listings = await GetListingStatusesAsync(fromUtc, toUtc);
        var pendingSubscriptions = await _db.Subscriptions.AsNoTracking().CountAsync(s => s.Status == SubscriptionStatus.Pending);
        var activeSubscriptions = await _db.Subscriptions.AsNoTracking().CountAsync(s => s.Status == SubscriptionStatus.Active);
        var revenue = await _db.Subscriptions.AsNoTracking()
            .Where(s => s.Status == SubscriptionStatus.Active && s.CreatedAt >= fromUtc && s.CreatedAt < toUtc)
            .SumAsync(s => (decimal?)s.Amount) ?? 0m;
        var openTickets = await _db.MaintenanceTickets.AsNoTracking().CountAsync(t => t.Status != TicketStatus.Resolved);

        return new AdminDashboardSummaryDto
        {
            From = fromUtc, To = toUtc, TotalUsers = totalUsers, NewUsers = newUsers,
            UsersByRole = roleRows.ToDictionary(x => x.Role, x => x.Count, StringComparer.OrdinalIgnoreCase),
            TotalBuildings = totalBuildings, TotalRooms = totalRooms, OccupiedRooms = occupiedRooms,
            OccupancyRate = totalRooms == 0 ? 0 : Math.Round(occupiedRooms * 100m / totalRooms, 2),
            Listings = listings, PendingSubscriptions = pendingSubscriptions,
            ActiveSubscriptions = activeSubscriptions, SubscriptionRevenue = revenue,
            OpenMaintenanceTickets = openTickets
        };
    }

    public async Task<IReadOnlyList<AdminTrendPointDto>> GetUserGrowthAsync(DateTime fromUtc, DateTime toUtc, string granularity)
    {
        var daily = await _db.Users.AsNoTracking()
            .Where(u => !u.IsDeleted && u.CreatedAt >= fromUtc && u.CreatedAt < toUtc)
            .GroupBy(u => u.CreatedAt.Date)
            .Select(g => new { Day = g.Key, Count = g.Count() }).ToDictionaryAsync(x => x.Day, x => x.Count);
        var periods = BuildPeriods(fromUtc, toUtc, granularity);
        return periods.Select(p => new AdminTrendPointDto
        {
            PeriodStart = p.Start, PeriodEnd = p.End,
            Count = daily.Where(x => x.Key >= p.Start && x.Key < p.End).Sum(x => x.Value)
        }).ToList();
    }

    public async Task<ListingStatusSummaryDto> GetListingStatusesAsync(DateTime fromUtc, DateTime toUtc)
    {
        var rows = await _db.Rooms.AsNoTracking()
            .Where(r => !r.IsDeleted && r.HasListing && r.CreatedAt >= fromUtc && r.CreatedAt < toUtc)
            .GroupBy(r => r.ModerationStatus).Select(g => new { Status = g.Key, Count = g.Count() }).ToListAsync();
        int Count(ModerationStatus status) => rows.FirstOrDefault(x => x.Status == status)?.Count ?? 0;
        return new ListingStatusSummaryDto { Pending = Count(ModerationStatus.Pending), Flagged = Count(ModerationStatus.Flagged), Approved = Count(ModerationStatus.Approved), Rejected = Count(ModerationStatus.Rejected) };
    }

    public async Task<IReadOnlyList<SubscriptionRevenuePointDto>> GetSubscriptionRevenueAsync(DateTime fromUtc, DateTime toUtc)
    {
        var monthly = await _db.Subscriptions.AsNoTracking()
            .Where(s => s.Status == SubscriptionStatus.Active && s.CreatedAt >= fromUtc && s.CreatedAt < toUtc)
            .GroupBy(s => new { s.CreatedAt.Year, s.CreatedAt.Month })
            .Select(g => new { g.Key.Year, g.Key.Month, Revenue = g.Sum(x => x.Amount) }).ToListAsync();
        return BuildPeriods(fromUtc, toUtc, "month").Select(p => new SubscriptionRevenuePointDto
        {
            PeriodStart = p.Start, PeriodEnd = p.End,
            Revenue = monthly.FirstOrDefault(x => x.Year == p.Start.Year && x.Month == p.Start.Month)?.Revenue ?? 0m
        }).ToList();
    }

    public async Task<IReadOnlyList<AdminActivityDto>> GetRecentActivitiesAsync(int limit) =>
        await _db.AuditLogs.AsNoTracking().OrderByDescending(a => a.CreatedAt).ThenByDescending(a => a.Id).Take(limit)
            .Select(a => new AdminActivityDto
            {
                Id = a.Id, Action = a.Action ?? "Activity", EntityType = a.EntityType ?? "System",
                Description = (a.Action ?? "Activity") + " · " + (a.EntityType ?? "System"),
                ActorName = a.User != null ? a.User.FullName : null, Details = a.Details, CreatedAt = a.CreatedAt
            }).ToListAsync();

    private static List<(DateTime Start, DateTime End)> BuildPeriods(DateTime from, DateTime to, string granularity)
    {
        var periods = new List<(DateTime, DateTime)>();
        var cursor = granularity == "month" ? new DateTime(from.Year, from.Month, 1, 0, 0, 0, DateTimeKind.Utc) : from.Date;
        while (cursor < to)
        {
            var next = granularity switch { "day" => cursor.AddDays(1), "week" => cursor.AddDays(7), "month" => cursor.AddMonths(1), _ => throw new ArgumentException("Granularity must be day, week, or month.") };
            periods.Add((cursor < from ? from : cursor, next > to ? to : next));
            cursor = next;
        }
        return periods;
    }
}
