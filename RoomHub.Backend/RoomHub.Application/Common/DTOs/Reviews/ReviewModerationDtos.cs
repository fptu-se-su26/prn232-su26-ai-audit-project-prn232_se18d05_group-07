namespace Application.Common.DTOs.Reviews;
public record ReviewReportDto(int Id, int? ReviewId, string ReasonCode, string? Description, string Status, string ReporterId, DateTime CreatedAt);
public record AdminReviewDto(int Id, int? RoomId, string? RoomTitle, string TenantName, int? ContractId, string? ContractStatus, byte? Rating, string? Comment, string ModerationStatus, string? ModerationReason, IReadOnlyList<ReviewReportDto> Reports);
public record PagedReviewReportsDto(int Page, int PageSize, int TotalCount, IReadOnlyList<ReviewReportDto> Items);
public class ModerationReasonRequest { public string Reason { get; set; } = null!; }
public class DismissReportRequest { public string? Note { get; set; } }
