using System;
using System.Collections.Generic;

namespace Application.Common.DTOs.Reviews
{
    // Request gửi lên khi người thuê tạo một đánh giá cho phòng (và gián tiếp cho chủ trọ).
    public class CreateReviewRequest
    {
        public int RoomId { get; set; }
        public int Rating { get; set; }        // 1..5 sao
        public string? Comment { get; set; }
    }

    // Request gửi lên khi người thuê sửa lại đánh giá của chính mình.
    public class UpdateReviewRequest
    {
        public int Rating { get; set; }        // 1..5 sao
        public string? Comment { get; set; }
    }

    // Một dòng đánh giá trả về cho client.
    public class ReviewDto
    {
        public int Id { get; set; }
        public int? RoomId { get; set; }
        public string? RoomTitle { get; set; }
        public string TenantId { get; set; } = null!;
        public string TenantName { get; set; } = null!;
        public string? OwnerId { get; set; }
        public byte? Rating { get; set; }
        public string? Comment { get; set; }
        public DateTime CreatedAt { get; set; }
        public string ModerationStatus { get; set; } = "Visible";
        public string? ModerationReason { get; set; }
        public int? ContractId { get; set; }
    }

    public record ReviewEligibilityDto(bool Eligible, string Reason, int? ContractId);
    public class CreateReviewReportRequest { public string ReasonCode { get; set; } = null!; public string? Description { get; set; } }

    // Tổng hợp đánh giá của một phòng: điểm trung bình, số lượng và danh sách.
    public class RoomReviewSummaryDto
    {
        public int RoomId { get; set; }
        public double AverageRating { get; set; }
        public int TotalReviews { get; set; }
        public List<ReviewDto> Reviews { get; set; } = new();
    }
}
