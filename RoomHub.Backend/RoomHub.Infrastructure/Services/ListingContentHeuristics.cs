using System.Text.RegularExpressions;
using Application.Common.Interfaces;
using Domain.Enums;

namespace Infrastructure.Services
{
    public static class ListingContentHeuristics
    {
        private static readonly Regex PhonePattern = new(
            @"(?:0|\+84)[\s.\-]?[3-9]\d[\s.\-]?\d{3}[\s.\-]?\d{3,4}",
            RegexOptions.Compiled | RegexOptions.IgnoreCase);

        private static readonly Regex EmailPattern = new(
            @"[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}",
            RegexOptions.Compiled);

        private static readonly Regex UrlPattern = new(
            @"https?://|www\.|zalo\.me|facebook\.com|fb\.com|tiktok\.com|instagram\.com|t\.me/",
            RegexOptions.Compiled | RegexOptions.IgnoreCase);

        public static ModerationResult? Validate(string title, string description)
        {
            var combined = $"{title} {description}";

            if (PhonePattern.IsMatch(combined))
            {
                return Reject(
                    "Không được để số điện thoại trong tiêu đề hoặc mô tả. Người thuê sẽ liên hệ qua hệ thống.",
                    "description");
            }

            if (EmailPattern.IsMatch(combined))
            {
                return Reject(
                    "Không được để email liên hệ trong nội dung tin đăng.",
                    "description");
            }

            if (UrlPattern.IsMatch(combined))
            {
                return Reject(
                    "Không được để link mạng xã hội hoặc website trong nội dung tin đăng.",
                    "description");
            }

            return null;
        }

        private static ModerationResult Reject(string reason, string field) => new()
        {
            Status = ModerationStatus.Rejected,
            Reason = reason,
            UserMessage = reason,
            QualityScore = 10
        };
    }
}
