using Application.Common.Interfaces;
using Domain.Enums;

namespace Infrastructure.Services
{
    internal static class ModerationMessageCatalog
    {
        public static string ForApproved(bool willPublish) =>
            willPublish
                ? "Tin đăng đã vượt qua kiểm duyệt AI và được công bố."
                : "Tin đăng đã vượt qua kiểm duyệt AI. Lưu bản nháp thành công.";

        public static string ForRejected(string detail) =>
            string.IsNullOrWhiteSpace(detail)
                ? "Tin đăng không đạt tiêu chuẩn kiểm duyệt. Vui lòng chỉnh sửa và thử lại."
                : $"Tin đăng không đạt tiêu chuẩn: {detail}";

        public static string ForFlagged(string detail) =>
            string.IsNullOrWhiteSpace(detail)
                ? "Tin đăng cần Admin xem xét thủ công trước khi hiển thị công khai."
                : $"Tin đăng cần Admin duyệt thủ công: {detail}";

        public static string ForImageUnavailable() =>
            "Hệ thống kiểm duyệt ảnh tạm thời không khả dụng. Tin đã được lưu và chuyển Admin duyệt trong thời gian sớm nhất.";

        public static string ForImageInvalid() =>
            "Ảnh đăng tải không phù hợp. Vui lòng sử dụng ảnh chụp thật của phòng trọ (không dùng anime, meme, poster).";

        public static string BuildAuditReport(IEnumerable<ModerationCheck> checks, ModerationStatus status, int score)
        {
            var lines = checks.Select(c => $"[{c.Stage}] {(c.Passed ? "Đạt" : "Không đạt")} — {c.Summary} (điểm: {c.Score})");
            return string.Join("\n", lines) + $"\n→ Kết luận: {status} | Tổng điểm: {score}/100";
        }
    }
}
