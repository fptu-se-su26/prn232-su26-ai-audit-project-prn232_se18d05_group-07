using System.Collections.Generic;
using Application.Common.Interfaces;
using Domain.Enums;

namespace Infrastructure.Services
{
    public static class ListingModerationRules
    {
        private const decimal MinMonthlyPrice = 500_000m;
        private const decimal MaxMonthlyPrice = 100_000_000m;
        private const decimal MinArea = 5m;
        private const decimal MaxArea = 500m;

        public static ModerationResult? ValidateContentData(
            string title,
            string description,
            decimal price,
            decimal area)
        {
            return ValidateCore(title, description, price, area, requireImages: false, imageUrls: null);
        }

        public static ModerationResult? ValidateListingData(
            string title,
            string description,
            decimal price,
            decimal area,
            List<string>? imageUrls)
        {
            return ValidateCore(title, description, price, area, requireImages: true, imageUrls);
        }

        private static ModerationResult? ValidateCore(
            string title,
            string description,
            decimal price,
            decimal area,
            bool requireImages,
            List<string>? imageUrls)
        {
            if (string.IsNullOrWhiteSpace(title) || title.Trim().Length < 10)
            {
                return Reject("Tiêu đề quá ngắn hoặc trống. Vui lòng mô tả rõ hơn về phòng trọ.");
            }

            if (string.IsNullOrWhiteSpace(description) || description.Trim().Length < 20)
            {
                return Reject("Mô tả quá ngắn. Cần ít nhất 20 ký tự mô tả chi tiết về phòng.");
            }

            if (price < MinMonthlyPrice)
            {
                return Reject($"Giá thuê {price:N0}đ/tháng không hợp lệ. Giá tối thiểu là {MinMonthlyPrice:N0}đ/tháng cho phòng trọ tại Việt Nam.");
            }

            if (price > MaxMonthlyPrice)
            {
                return Flag($"Giá thuê {price:N0}đ/tháng bất thường cao. Cần Admin xác minh.");
            }

            if (area < MinArea || area > MaxArea)
            {
                return Reject($"Diện tích {area}m² không hợp lệ. Phạm vi cho phép: {MinArea}–{MaxArea}m².");
            }

            if (requireImages && (imageUrls == null || imageUrls.Count == 0))
            {
                return Reject("Tin đăng bắt buộc có ít nhất 1 ảnh thực tế của phòng trọ.");
            }

            return null;
        }

        private static ModerationResult Reject(string reason) => new()
        {
            Status = ModerationStatus.Rejected,
            Reason = reason,
            QualityScore = 0
        };

        private static ModerationResult Flag(string reason) => new()
        {
            Status = ModerationStatus.Flagged,
            Reason = reason,
            QualityScore = 30
        };
    }
}
