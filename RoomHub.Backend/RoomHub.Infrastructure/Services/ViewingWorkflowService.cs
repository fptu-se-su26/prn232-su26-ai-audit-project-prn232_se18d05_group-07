using System.Text.Json;
using Application.Common.DTOs.Viewings;
using Application.Common.Interfaces;
using Domain.Entities;
using Domain.Enums;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Services;

public class ViewingWorkflowService(ApplicationDbContext db) : IViewingWorkflowService
{
    private static readonly ViewingBookingStatus[] Blocking = [ViewingBookingStatus.Pending, ViewingBookingStatus.Approved, ViewingBookingStatus.Rescheduled];
    private static DateTime Utc(DateTime value) => value.Kind == DateTimeKind.Utc ? value : value.ToUniversalTime();

    public async Task<ViewingBookingDto> CreateAsync(string tenantId, CreateViewingBookingRequest request, CancellationToken ct)
    {
        var start = Utc(request.RequestedStartAt); var end = Utc(request.RequestedEndAt);
        if (start < DateTime.UtcNow.AddHours(2) || end <= start) throw new WorkflowException("Lịch xem phải bắt đầu sau ít nhất 2 giờ và thời gian kết thúc phải sau thời gian bắt đầu.");
        var room = await db.Rooms.SingleOrDefaultAsync(x => x.Id == request.RoomId, ct);
        if (room is null) throw new WorkflowException("Không tìm thấy phòng.", 404);
        if (room.IsDeleted || room.HiddenByOwner || !room.HasListing || !room.IsPublished || room.Status != RoomStatus.Available)
            throw new WorkflowException("Phòng không còn khả dụng để đặt lịch.", 409);
        if (await db.Contracts.AnyAsync(x => x.RoomId == room.Id && x.TenantId == tenantId && x.Status == ContractStatus.Active, ct))
            throw new WorkflowException("Bạn đang thuê phòng này.", 409);
        if (await HasOverlap(room.Id, start, end, null, ct)) throw new WorkflowException("Khung giờ này đã có lịch xem khác.", 409);
        var booking = new RoomViewingBooking { RoomId = room.Id, TenantId = tenantId, RequestedStartAt = start, RequestedEndAt = end, ScheduledStartAt = start, ScheduledEndAt = end, TenantNote = request.Note?.Trim() };
        db.RoomViewingBookings.Add(booking);
        AddAudit(tenantId, "CreateBooking", "RoomViewingBooking", null, new { room.Id, start, end });
        AddNotification(room.LandlordId, "BookingRequested", "Có yêu cầu xem phòng mới", $"Khách thuê yêu cầu xem {room.Title}.", null);
        await db.SaveChangesAsync(ct);
        return await GetBooking(booking.Id, ct);
    }

    public Task<PagedResult<ViewingBookingDto>> TenantListAsync(string tenantId, int page, int pageSize, ViewingBookingStatus? status, CancellationToken ct) => List(db.RoomViewingBookings.Where(x => x.TenantId == tenantId), page, pageSize, status, ct);
    public async Task<ViewingBookingDto> TenantGetAsync(string tenantId, long id, CancellationToken ct) { var x = await OwnedTenant(tenantId, id, ct); return await GetBooking(x.Id, ct); }
    public async Task<ViewingBookingDto> TenantAcceptRescheduleAsync(string tenantId, long id, CancellationToken ct)
    {
        var x = await OwnedTenant(tenantId, id, ct);
        if (x.Status != ViewingBookingStatus.Rescheduled) throw Invalid();
        if (await HasOverlap(x.RoomId, x.ScheduledStartAt!.Value, x.ScheduledEndAt!.Value, x.Id, ct)) throw new WorkflowException("Khung giờ mới đã bị trùng.", 409);
        x.Status = ViewingBookingStatus.Approved; x.UpdatedAt = DateTime.UtcNow;
        AddAudit(tenantId, "ApproveBooking", "RoomViewingBooking", (int)x.Id, new { acceptedReschedule = true });
        AddNotification(x.Room.LandlordId, "BookingApproved", "Khách thuê đã chấp nhận lịch mới", x.Room.Title, (int)x.Id);
        await db.SaveChangesAsync(ct); return await GetBooking(x.Id, ct);
    }
    public async Task<ViewingBookingDto> TenantCancelAsync(string tenantId, long id, string reason, CancellationToken ct)
    {
        var x = await OwnedTenant(tenantId, id, ct);
        if (x.Status is not (ViewingBookingStatus.Pending or ViewingBookingStatus.Rescheduled or ViewingBookingStatus.Approved)) throw Invalid();
        x.Status = ViewingBookingStatus.Cancelled; x.CancelledAt = x.UpdatedAt = DateTime.UtcNow; x.TenantNote = Append(x.TenantNote, reason);
        AddAudit(tenantId, "CancelBooking", "RoomViewingBooking", (int)x.Id, new { reason });
        AddNotification(x.Room.LandlordId, "BookingCancelled", "Lịch xem phòng đã bị hủy", x.Room.Title, (int)x.Id);
        await db.SaveChangesAsync(ct); return await GetBooking(x.Id, ct);
    }

    public async Task<DepositDto> PlaceDepositAsync(string tenantId, long bookingId, DepositRequest request, CancellationToken ct)
    {
        var b = await OwnedTenant(tenantId, bookingId, ct);
        if (b.Status is not (ViewingBookingStatus.Approved or ViewingBookingStatus.Completed)) throw new WorkflowException("Chỉ có thể đặt cọc cho lịch đã duyệt hoặc đã hoàn tất.", 409);
        if (request.HoldDurationDays is < 1 or > 30 || string.IsNullOrWhiteSpace(request.PaymentMethod)) throw new WorkflowException("Thời gian giữ phòng phải từ 1 đến 30 ngày và phương thức thanh toán là bắt buộc.");
        var expected = b.Room.BasePrice;
        if (request.Amount != expected) throw new WorkflowException($"Số tiền cọc phải bằng {expected}.", 409);
        await using var tx = await db.Database.BeginTransactionAsync(ct);
        if (b.Room.Status != RoomStatus.Available || await db.Deposits.AnyAsync(x => x.RoomId == b.RoomId && (x.Status == DepositStatus.Holding || x.Status == DepositStatus.Active), ct)) throw new WorkflowException("Phòng đã được người khác giữ hoặc đặt cọc.", 409);
        if (!string.IsNullOrWhiteSpace(request.TransactionId)) {
            var existing = await db.Deposits.AsNoTracking().SingleOrDefaultAsync(x => x.TransactionId == request.TransactionId, ct);
            if (existing != null) { if (existing.TenantId != tenantId || existing.ViewingBookingId != bookingId) throw new WorkflowException("Mã giao dịch đã được sử dụng.", 409); return Map(existing); }
        }
        var now = DateTime.UtcNow;
        var d = new Deposit { RoomId = b.RoomId, TenantId = tenantId, ViewingBookingId = bookingId, Amount = expected, HoldDurationDays = request.HoldDurationDays, PlacedAt = now, ExpiresAt = now.AddDays(request.HoldDurationDays), Status = DepositStatus.Holding, PaymentMethod = request.PaymentMethod.Trim(), TransactionId = request.TransactionId?.Trim(), PaymentProofUrl = request.PaymentProofUrl?.Trim() };
        db.Deposits.Add(d); AddAudit(tenantId, "PlaceDeposit", "Deposit", null, new { bookingId, expected, d.ExpiresAt });
        AddNotification(b.Room.LandlordId, "DepositPlaced", "Có khoản cọc chờ xác nhận", b.Room.Title, null);
        await db.SaveChangesAsync(ct); await tx.CommitAsync(ct); return Map(d);
    }
    public async Task<DepositDto> TenantDepositAsync(string tenantId, int id, CancellationToken ct) => Map(await db.Deposits.AsNoTracking().SingleOrDefaultAsync(x => x.Id == id && x.TenantId == tenantId, ct) ?? throw new WorkflowException("Không tìm thấy khoản cọc.", 404));
    public Task<PagedResult<ViewingBookingDto>> OwnerListAsync(string ownerId, int page, int pageSize, ViewingBookingStatus? status, CancellationToken ct) => List(db.RoomViewingBookings.Where(x => x.Room.LandlordId == ownerId), page, pageSize, status, ct);

    public async Task<ViewingBookingDto> OwnerTransitionAsync(string ownerId, long id, string action, RescheduleViewingRequest? reschedule, string? reason, CancellationToken ct)
    {
        var x = await db.RoomViewingBookings.Include(y => y.Room).SingleOrDefaultAsync(y => y.Id == id && y.Room.LandlordId == ownerId, ct) ?? throw new WorkflowException("Không tìm thấy lịch xem.", 404);
        var now = DateTime.UtcNow; string audit; string type;
        switch (action) {
            case "approve" when x.Status is ViewingBookingStatus.Pending or ViewingBookingStatus.Rescheduled:
                if (await HasOverlap(x.RoomId, x.ScheduledStartAt!.Value, x.ScheduledEndAt!.Value, x.Id, ct)) throw new WorkflowException("Khung giờ này đã có lịch được duyệt.", 409);
                x.Status = ViewingBookingStatus.Approved; audit = "ApproveBooking"; type = "BookingApproved"; break;
            case "reschedule" when x.Status == ViewingBookingStatus.Pending:
                if (reschedule is null || Utc(reschedule.StartAt) < now.AddHours(2) || Utc(reschedule.EndAt) <= Utc(reschedule.StartAt)) throw new WorkflowException("Thời gian đề xuất không hợp lệ.");
                x.ScheduledStartAt = Utc(reschedule.StartAt); x.ScheduledEndAt = Utc(reschedule.EndAt); x.OwnerNote = reschedule.Note?.Trim(); x.Status = ViewingBookingStatus.Rescheduled; audit = "RescheduleBooking"; type = "BookingRescheduled"; break;
            case "reject" when x.Status is ViewingBookingStatus.Pending or ViewingBookingStatus.Rescheduled:
                RequireReason(reason); x.Status = ViewingBookingStatus.Rejected; x.RejectReason = reason!.Trim(); audit = "RejectBooking"; type = "BookingRejected"; break;
            case "complete" when x.Status == ViewingBookingStatus.Approved:
                x.Status = ViewingBookingStatus.Completed; x.CompletedAt = now; audit = "CompleteBooking"; type = "BookingCompleted"; break;
            case "no-show" when x.Status == ViewingBookingStatus.Approved:
                x.Status = ViewingBookingStatus.NoShow; x.CompletedAt = now; audit = "NoShowBooking"; type = "BookingNoShow"; break;
            default: throw Invalid();
        }
        x.UpdatedAt = now; AddAudit(ownerId, audit, "RoomViewingBooking", (int)x.Id, new { reason }); AddNotification(x.TenantId, type, "Cập nhật lịch xem phòng", x.Room.Title, (int)x.Id);
        await db.SaveChangesAsync(ct); return await GetBooking(x.Id, ct);
    }

    public async Task<DepositDto> OwnerDepositTransitionAsync(string ownerId, int id, string action, string? reason, CancellationToken ct)
    {
        var d = await db.Deposits.Include(x => x.Room).SingleOrDefaultAsync(x => x.Id == id && x.Room.LandlordId == ownerId, ct) ?? throw new WorkflowException("Không tìm thấy khoản cọc.", 404);
        var now = DateTime.UtcNow; string audit; string type;
        switch (action) {
            case "confirm" when d.Status == DepositStatus.Holding:
                if (d.ExpiresAt <= now || d.Room.Status != RoomStatus.Available) throw new WorkflowException("Khoản cọc đã hết hạn hoặc phòng không còn khả dụng.", 409);
                d.Status = DepositStatus.Active; d.ConfirmedAt = now; d.Room.Status = RoomStatus.Deposited; audit = "ConfirmDeposit"; type = "DepositConfirmed"; break;
            case "refund" when d.Status is DepositStatus.Holding or DepositStatus.Active:
                d.Status = DepositStatus.Refunded; d.RefundedAt = now; d.RefundAmount = d.Amount; d.RefundReason = reason?.Trim(); ReleaseRoom(d); audit = "RefundDeposit"; type = "DepositRefunded"; break;
            case "forfeit" when d.Status == DepositStatus.Active:
                RequireReason(reason); d.Status = DepositStatus.Forfeited; d.ForfeitReason = reason!.Trim(); ReleaseRoom(d); audit = "ForfeitDeposit"; type = "DepositForfeited"; break;
            default: throw Invalid();
        }
        AddAudit(ownerId, audit, "Deposit", d.Id, new { reason }); AddNotification(d.TenantId, type, "Cập nhật khoản cọc", d.Room.Title, d.Id);
        await db.SaveChangesAsync(ct); return Map(d);
    }

    public async Task<int> ExpireDepositsAsync(CancellationToken ct)
    {
        var now = DateTime.UtcNow; var items = await db.Deposits.Include(x => x.Room).Where(x => (x.Status == DepositStatus.Holding || x.Status == DepositStatus.Active) && x.ExpiresAt <= now).ToListAsync(ct);
        foreach (var d in items) { d.Status = DepositStatus.Released; d.ReleasedAt = now; var hasContract = await db.Contracts.AnyAsync(x => x.RoomId == d.RoomId && (x.Status == ContractStatus.Active || x.Status == ContractStatus.Pending), ct); if (!hasContract) ReleaseRoom(d); AddAudit(null, "ExpireDeposit", "Deposit", d.Id, new { d.ExpiresAt }); AddNotification(d.TenantId, "DepositExpired", "Khoản giữ phòng đã hết hạn", d.Room.Title, d.Id); }
        if (items.Count > 0) await db.SaveChangesAsync(ct); return items.Count;
    }

    private async Task<PagedResult<ViewingBookingDto>> List(IQueryable<RoomViewingBooking> query, int page, int size, ViewingBookingStatus? status, CancellationToken ct) { page = Math.Max(1, page); size = Math.Clamp(size, 1, 100); if (status.HasValue) query = query.Where(x => x.Status == status); var count = await query.CountAsync(ct); var ids = await query.OrderByDescending(x => x.CreatedAt).Skip((page - 1) * size).Take(size).Select(x => x.Id).ToListAsync(ct); var list = new List<ViewingBookingDto>(); foreach (var id in ids) list.Add(await GetBooking(id, ct)); return new(list, page, size, count, (int)Math.Ceiling(count / (double)size)); }
    private async Task<RoomViewingBooking> OwnedTenant(string tenant, long id, CancellationToken ct) => await db.RoomViewingBookings.Include(x => x.Room).SingleOrDefaultAsync(x => x.Id == id && x.TenantId == tenant, ct) ?? throw new WorkflowException("Không tìm thấy lịch xem.", 404);
    private async Task<bool> HasOverlap(int room, DateTime start, DateTime end, long? except, CancellationToken ct) => await db.RoomViewingBookings.AnyAsync(x => x.RoomId == room && (!except.HasValue || x.Id != except) && Blocking.Contains(x.Status) && x.ScheduledStartAt < end && x.ScheduledEndAt > start, ct);
    private async Task<ViewingBookingDto> GetBooking(long id, CancellationToken ct) { var x = await db.RoomViewingBookings.AsNoTracking().Include(y => y.Room).Include(y => y.Tenant).Include(y => y.Deposits).SingleAsync(y => y.Id == id, ct); var d = x.Deposits.OrderByDescending(y => y.PlacedAt).FirstOrDefault(); return new(x.Id, x.RoomId, x.Room.Title, x.TenantId, x.Tenant.FullName ?? x.Tenant.Email ?? "Tenant", x.RequestedStartAt, x.RequestedEndAt, x.ScheduledStartAt, x.ScheduledEndAt, x.Status, x.TenantNote, x.OwnerNote, x.RejectReason, x.CreatedAt, x.UpdatedAt, x.CompletedAt, x.CancelledAt, d is null ? null : Map(d)); }
    private static DepositDto Map(Deposit d) => new(d.Id, d.ViewingBookingId, d.RoomId, d.TenantId, d.Amount, d.HoldDurationDays, d.PlacedAt, d.ExpiresAt, d.Status, d.PaymentMethod, d.TransactionId, d.PaymentProofUrl, d.ConfirmedAt, d.ReleasedAt, d.RefundedAt, d.RefundAmount, d.RefundReason, d.ForfeitReason);
    private void AddAudit(string? user, string action, string entity, int? id, object details) => db.AuditLogs.Add(new AuditLog { UserId = user, Action = action, EntityType = entity, EntityId = id, Details = JsonSerializer.Serialize(details) });
    private void AddNotification(string user, string type, string title, string content, int? id) => db.Notifications.Add(new Notification { UserId = user, Type = type, Title = title, Content = content, LinkedId = id });
    private static WorkflowException Invalid() => new("Chuyển trạng thái không hợp lệ.", 409);
    private static void RequireReason(string? reason) { if (string.IsNullOrWhiteSpace(reason)) throw new WorkflowException("Lý do là bắt buộc."); }
    private static string Append(string? value, string reason) => string.IsNullOrWhiteSpace(value) ? reason.Trim() : $"{value}\nLý do hủy: {reason.Trim()}";
    private static void ReleaseRoom(Deposit d) { if (d.Room.Status == RoomStatus.Deposited) d.Room.Status = RoomStatus.Available; }
}
