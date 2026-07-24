using Application.Common;
using Application.Common.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace RoomHub.API.Controllers;

[Authorize(Roles = "Administrator")]
[ApiController]
[Route("api/admin/dashboard")]
public sealed class AdminDashboardController : ControllerBase
{
    private readonly IAdminDashboardService _service;
    public AdminDashboardController(IAdminDashboardService service) => _service = service;

    [HttpGet("summary")]
    public async Task<IActionResult> Summary([FromQuery] DateTimeOffset? from, [FromQuery] DateTimeOffset? to) =>
        await WithRange(from, to, (start, end) => _service.GetSummaryAsync(start, end));

    [HttpGet("user-growth")]
    public async Task<IActionResult> UserGrowth([FromQuery] DateTimeOffset? from, [FromQuery] DateTimeOffset? to, [FromQuery] string granularity = "day")
    {
        granularity = granularity.Trim().ToLowerInvariant();
        if (granularity is not ("day" or "week" or "month")) return BadRequest(Error("granularity must be day, week, or month."));
        return await WithRange(from, to, (start, end) => _service.GetUserGrowthAsync(start, end, granularity));
    }

    [HttpGet("listing-statuses")]
    public async Task<IActionResult> ListingStatuses([FromQuery] DateTimeOffset? from, [FromQuery] DateTimeOffset? to) =>
        await WithRange(from, to, (start, end) => _service.GetListingStatusesAsync(start, end));

    [HttpGet("subscription-revenue")]
    public async Task<IActionResult> SubscriptionRevenue([FromQuery] DateTimeOffset? from, [FromQuery] DateTimeOffset? to, [FromQuery] string granularity = "month")
    {
        if (!string.Equals(granularity, "month", StringComparison.OrdinalIgnoreCase)) return BadRequest(Error("subscription revenue currently supports month granularity."));
        return await WithRange(from, to, (start, end) => _service.GetSubscriptionRevenueAsync(start, end));
    }

    [HttpGet("recent-activities")]
    public async Task<IActionResult> RecentActivities([FromQuery] int limit = 10)
    {
        if (limit is < 1 or > 50) return BadRequest(Error("limit must be between 1 and 50."));
        return Ok(await _service.GetRecentActivitiesAsync(limit));
    }

    private async Task<IActionResult> WithRange<T>(DateTimeOffset? from, DateTimeOffset? to, Func<DateTime, DateTime, Task<T>> query)
    {
        try { var range = DashboardDateRange.Resolve(from, to, DateTime.UtcNow); return Ok(await query(range.From, range.To)); }
        catch (ArgumentException ex) { return BadRequest(Error(ex.Message)); }
    }

    private static object Error(string message) => new { success = false, message, errors = new Dictionary<string, string[]>() };
}
