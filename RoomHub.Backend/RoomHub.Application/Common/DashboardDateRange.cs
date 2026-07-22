namespace Application.Common;

public static class DashboardDateRange
{
    public static (DateTime From, DateTime To) Resolve(DateTimeOffset? from, DateTimeOffset? to, DateTime utcNow)
    {
        var end = (to ?? new DateTimeOffset(utcNow, TimeSpan.Zero)).UtcDateTime;
        var start = (from ?? new DateTimeOffset(end.AddDays(-30), TimeSpan.Zero)).UtcDateTime;
        if (start >= end)
            throw new ArgumentException("'from' must be earlier than 'to'.");
        if (end - start > TimeSpan.FromDays(730))
            throw new ArgumentException("The dashboard date range cannot exceed 730 days.");
        return (DateTime.SpecifyKind(start, DateTimeKind.Utc), DateTime.SpecifyKind(end, DateTimeKind.Utc));
    }
}
