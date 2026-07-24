using Domain.Enums;

namespace Domain.Entities;

public class RoomViewingBooking
{
    public long Id { get; set; }
    public int RoomId { get; set; }
    public string TenantId { get; set; } = null!;
    public DateTime RequestedStartAt { get; set; }
    public DateTime RequestedEndAt { get; set; }
    public DateTime? ScheduledStartAt { get; set; }
    public DateTime? ScheduledEndAt { get; set; }
    public ViewingBookingStatus Status { get; set; } = ViewingBookingStatus.Pending;
    public string? TenantNote { get; set; }
    public string? OwnerNote { get; set; }
    public string? RejectReason { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedAt { get; set; }
    public DateTime? CancelledAt { get; set; }
    public byte[] RowVersion { get; set; } = [];

    public Room Room { get; set; } = null!;
    public ApplicationUser Tenant { get; set; } = null!;
    public ICollection<Deposit> Deposits { get; set; } = new List<Deposit>();
}
