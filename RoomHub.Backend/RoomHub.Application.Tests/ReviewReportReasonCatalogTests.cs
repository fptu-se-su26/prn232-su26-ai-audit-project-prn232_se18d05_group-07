using Application.Common.Reviews;
using Xunit;

namespace RoomHub.Application.Tests;

public sealed class ReviewReportReasonCatalogTests
{
    [Fact]
    public void All_ContainsStableUniqueReasonCodes()
    {
        Assert.Equal(5, ReviewReportReasonCatalog.All.Count);
        Assert.Equal(
            ReviewReportReasonCatalog.All.Count,
            ReviewReportReasonCatalog.All.Select(x => x.Code).Distinct(StringComparer.OrdinalIgnoreCase).Count());
        Assert.Contains(ReviewReportReasonCatalog.All, x => x.Code == "Other");
    }

    [Theory]
    [InlineData("Spam", "Spam")]
    [InlineData(" spam ", "Spam")]
    [InlineData("FALSEINFORMATION", "FalseInformation")]
    public void Normalize_KnownCode_ReturnsCanonicalCode(string input, string expected)
    {
        Assert.Equal(expected, ReviewReportReasonCatalog.Normalize(input));
    }

    [Theory]
    [InlineData("")]
    [InlineData("UnknownReason")]
    [InlineData("Spam<script>")]
    public void Normalize_UnknownCode_ThrowsValidationError(string input)
    {
        Assert.Throws<ArgumentException>(() => ReviewReportReasonCatalog.Normalize(input));
    }
}
