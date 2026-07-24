using Domain.Enums;

namespace Application.Common.DTOs.Viewings;

public record CreateViewingBookingRequest(int RoomId, DateTime RequestedStartAt, DateTime RequestedEndAt, string? Note);
public record RescheduleViewingRequest(DateTime StartAt, DateTime EndAt, string? Note);
public record ReasonRequest(string Reason);
public record DepositRequest(decimal Amount, int HoldDurationDays, string PaymentMethod, string? TransactionId, string? PaymentProofUrl);
public record ViewingBookingDto(long Id, int RoomId, string RoomTitle, string TenantId, string TenantName,
    DateTime RequestedStartAt, DateTime RequestedEndAt, DateTime? ScheduledStartAt, DateTime? ScheduledEndAt,
    ViewingBookingStatus Status, string? TenantNote, string? OwnerNote, string? RejectReason,
    DateTime CreatedAt, DateTime UpdatedAt, DateTime? CompletedAt, DateTime? CancelledAt, DepositDto? Deposit);
public record DepositDto(int Id, long? ViewingBookingId, int RoomId, string TenantId, decimal Amount,
    int HoldDurationDays, DateTime PlacedAt, DateTime ExpiresAt, DepositStatus Status, string? PaymentMethod,
    string? TransactionId, string? PaymentProofUrl, DateTime? ConfirmedAt, DateTime? ReleasedAt,
    DateTime? RefundedAt, decimal? RefundAmount, string? RefundReason, string? ForfeitReason);
public record PagedResult<T>(IReadOnlyList<T> Items, int Page, int PageSize, int TotalCount, int TotalPages);

public class WorkflowException(string message, int statusCode = 400) : Exception(message)
{
    public int StatusCode { get; } = statusCode;
}
