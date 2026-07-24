using Application.Common;
using Application.Common.DTOs.Dashboard;
using Microsoft.AspNetCore.Authorization;
using RoomHub.API.Controllers;
using Xunit;

namespace RoomHub.Application.Tests;

public sealed class AdminDashboardTests
{
    [Fact]
    public void Controller_IsRestrictedToAdministratorRole()
    {
        var attribute = Assert.Single(typeof(AdminDashboardController)
            .GetCustomAttributes(typeof(AuthorizeAttribute), true).Cast<AuthorizeAttribute>());
        Assert.Equal("Administrator", attribute.Roles);
    }

    [Fact]
    public void DateRange_ConvertsClientOffsetsToUtcAndUsesExclusiveEnd()
    {
        var from = DateTimeOffset.Parse("2026-07-01T00:00:00+07:00");
        var to = DateTimeOffset.Parse("2026-08-01T00:00:00+07:00");
        var range = DashboardDateRange.Resolve(from, to, DateTime.UtcNow);
        Assert.Equal(DateTime.Parse("2026-06-30T17:00:00Z").ToUniversalTime(), range.From);
        Assert.Equal(DateTime.Parse("2026-07-31T17:00:00Z").ToUniversalTime(), range.To);
        Assert.Equal(DateTimeKind.Utc, range.From.Kind);
    }

    [Fact]
    public void DateRange_RejectsInvalidOrExcessiveRanges()
    {
        var now = new DateTime(2026, 7, 22, 0, 0, 0, DateTimeKind.Utc);
        Assert.Throws<ArgumentException>(() => DashboardDateRange.Resolve(now, now, now));
        Assert.Throws<ArgumentException>(() => DashboardDateRange.Resolve(now.AddDays(-731), now, now));
    }

    [Fact]
    public void EmptySummary_UsesZeroValuesInsteadOfInvalidNumbers()
    {
        var summary = new AdminDashboardSummaryDto();
        Assert.Equal(0, summary.OccupancyRate);
        Assert.Equal(0, summary.Listings.Total);
        Assert.Empty(summary.UsersByRole);
    }
}
