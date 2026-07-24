using Application.Common.DTOs.Reviews;
using Application.Common.Interfaces;
using Domain.Entities;
using Domain.Enums;

namespace Application.Services;

public sealed class ReviewService : IReviewService
{
    private readonly IReviewRepository repository;
    private readonly IUnitOfWork unitOfWork;
    public ReviewService(IReviewRepository repository, IUnitOfWork unitOfWork) { this.repository = repository; this.unitOfWork = unitOfWork; }

    public async Task<ReviewDto> CreateReviewAsync(string tenantId, CreateReviewRequest request)
    {
        Validate(request.Rating, request.Comment);
        var room = await repository.GetRoomAsync(request.RoomId) ?? throw new ArgumentException("Không tìm thấy phòng.");
        var user = await repository.GetUserAsync(tenantId);
        if (user?.ReviewBlockedUntil > DateTime.UtcNow) throw new InvalidOperationException("Tài khoản đang bị khóa quyền đánh giá.");
        if (await repository.HasTenantReviewedRoomAsync(tenantId, request.RoomId)) throw new InvalidOperationException("Bạn đã đánh giá phòng này.");
        var contract = await repository.GetEligibleContractAsync(tenantId, request.RoomId, DateTime.UtcNow);
        if (contract == null) throw new InvalidOperationException("Bạn chỉ có thể đánh giá phòng đã thuê bằng hợp đồng hợp lệ, trong thời hạn cho phép.");
        var review = new Review { TenantId = tenantId, RoomId = room.Id, OwnerId = room.LandlordId, Rating = (byte)request.Rating,
            Comment = Clean(request.Comment), ContractId = contract.Id, ModerationStatus = ReviewModerationStatus.Visible, CreatedAt = DateTime.UtcNow };
        await repository.AddAsync(review); await unitOfWork.SaveChangesAsync();
        return Map((await repository.GetByIdAsync(review.Id))!);
    }

    public async Task<RoomReviewSummaryDto> GetRoomReviewsAsync(int roomId)
    {
        var rows = await repository.GetByRoomIdAsync(roomId); var rated = rows.Where(x => x.Rating.HasValue).ToList();
        return new() { RoomId = roomId, TotalReviews = rows.Count, AverageRating = rated.Count == 0 ? 0 : Math.Round(rated.Average(x => x.Rating!.Value), 1), Reviews = rows.Select(Map).ToList() };
    }
    public async Task<List<ReviewDto>> GetMyReviewsAsync(string tenantId) => (await repository.GetByTenantIdAsync(tenantId)).Select(Map).ToList();
    public async Task<ReviewDto?> UpdateReviewAsync(int id, string tenantId, UpdateReviewRequest request)
    {
        Validate(request.Rating, request.Comment); var user = await repository.GetUserAsync(tenantId);
        if (user?.ReviewBlockedUntil > DateTime.UtcNow) throw new InvalidOperationException("Tài khoản đang bị khóa quyền đánh giá.");
        var row = await repository.GetByIdAsync(id); if (row == null || row.TenantId != tenantId || row.IsDeleted) return null;
        row.Rating = (byte)request.Rating; row.Comment = Clean(request.Comment); row.UpdatedAt = DateTime.UtcNow;
        row.ModerationStatus = ReviewModerationStatus.Visible; row.ModerationReason = null;
        await repository.UpdateAsync(row); await unitOfWork.SaveChangesAsync(); return Map(row);
    }
    public async Task<bool> DeleteReviewAsync(int id, string tenantId)
    {
        var row = await repository.GetByIdAsync(id); if (row == null || row.TenantId != tenantId || row.IsDeleted) return false;
        row.IsDeleted = true; row.UpdatedAt = DateTime.UtcNow; await repository.UpdateAsync(row); await unitOfWork.SaveChangesAsync(); return true;
    }
    public async Task<ReviewEligibilityDto> GetEligibilityAsync(string tenantId, int roomId)
    {
        if (await repository.HasTenantReviewedRoomAsync(tenantId, roomId)) return new(false, "Bạn đã đánh giá phòng này.", null);
        var user = await repository.GetUserAsync(tenantId); if (user?.ReviewBlockedUntil > DateTime.UtcNow) return new(false, "Tài khoản đang bị khóa quyền đánh giá.", null);
        var contract = await repository.GetEligibleContractAsync(tenantId, roomId, DateTime.UtcNow);
        return contract == null ? new(false, "Không có hợp đồng thuê hợp lệ hoặc đã quá thời hạn đánh giá.", null) : new(true, "Đủ điều kiện đánh giá.", contract.Id);
    }
    public async Task ReportAsync(int reviewId, string reporterId, CreateReviewReportRequest request)
    {
        var row = await repository.GetByIdAsync(reviewId) ?? throw new ArgumentException("Không tìm thấy đánh giá.");
        if (row.IsDeleted || row.ModerationStatus == ReviewModerationStatus.Removed) throw new ArgumentException("Đánh giá không còn tồn tại.");
        if (row.TenantId == reporterId) throw new InvalidOperationException("Bạn không thể báo cáo đánh giá của chính mình.");
        var code = request.ReasonCode?.Trim(); if (string.IsNullOrWhiteSpace(code) || code.Length > 50) throw new ArgumentException("Mã lý do không hợp lệ.");
        if ((request.Description?.Trim().Length ?? 0) > 1000) throw new ArgumentException("Mô tả tối đa 1000 ký tự.");
        if (await repository.HasPendingReportAsync(reviewId, reporterId)) throw new InvalidOperationException("Bạn đã có báo cáo đang chờ xử lý.");
        await repository.AddReportAsync(new() { ReviewId = reviewId, ReporterId = reporterId, UserId = reporterId, ReasonCode = code,
            Description = Clean(request.Description), Content = Clean(request.Description) ?? code, CreatedAt = DateTime.UtcNow });
        await unitOfWork.SaveChangesAsync();
    }
    private static string? Clean(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    private static void Validate(int rating, string? comment) { if (rating is < 1 or > 5) throw new ArgumentException("Số sao phải từ 1 đến 5."); if ((comment?.Trim().Length ?? 0) > 1000) throw new ArgumentException("Nhận xét tối đa 1000 ký tự."); }
    private static ReviewDto Map(Review r) => new() { Id = r.Id, RoomId = r.RoomId, RoomTitle = r.Room?.Title, TenantName = r.Tenant?.FullName ?? "Người thuê",
        TenantId = r.TenantId, OwnerId = r.OwnerId, Rating = r.Rating, Comment = r.Comment, CreatedAt = r.CreatedAt, ModerationStatus = r.ModerationStatus.ToString(), ModerationReason = r.ModerationReason, ContractId = r.ContractId };
}
