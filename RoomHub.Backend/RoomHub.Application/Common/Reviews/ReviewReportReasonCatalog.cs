using Application.Common.DTOs.Reviews;

namespace Application.Common.Reviews;

public static class ReviewReportReasonCatalog
{
    private static readonly IReadOnlyDictionary<string, string> Reasons =
        new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            ["Spam"] = "Nội dung spam hoặc quảng cáo",
            ["Abuse"] = "Ngôn từ xúc phạm hoặc quấy rối",
            ["FalseInformation"] = "Thông tin sai lệch",
            ["PersonalInformation"] = "Tiết lộ thông tin cá nhân",
            ["Other"] = "Lý do khác"
        };

    public static IReadOnlyList<ReviewReportReasonDto> All { get; } =
        Reasons.Select(x => new ReviewReportReasonDto(x.Key, x.Value)).ToList();

    public static string Normalize(string? reasonCode)
    {
        var code = reasonCode?.Trim();
        if (string.IsNullOrWhiteSpace(code))
            throw new ArgumentException("Vui lòng chọn lý do báo cáo.");

        var match = Reasons.Keys.FirstOrDefault(x => string.Equals(x, code, StringComparison.OrdinalIgnoreCase));
        return match ?? throw new ArgumentException("Mã lý do báo cáo không hợp lệ.");
    }
}
