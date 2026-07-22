using System.Text.Json;
using Application.Common.DTOs.Reviews;
using Application.Common.Interfaces;
using Domain.Entities;
using Domain.Enums;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Services;
public sealed class ReviewModerationService(ApplicationDbContext db) : IReviewModerationService
{
    public async Task<PagedReviewReportsDto> GetReportsAsync(int page, int pageSize, string? status)
    {
        page = Math.Max(1, page); pageSize = Math.Clamp(pageSize, 1, 100); var q = db.ReviewViolations.AsNoTracking();
        if (Enum.TryParse<ReviewReportStatus>(status, true, out var parsed)) q = q.Where(x => x.Status == parsed);
        var count = await q.CountAsync(); var rows = await q.OrderByDescending(x => x.CreatedAt).Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
        return new(page, pageSize, count, rows.Select(MapReport).ToList());
    }
    public async Task<AdminReviewDto?> GetReviewAsync(int id)
    {
        var r = await db.Reviews.AsNoTracking().Include(x => x.Room).Include(x => x.Tenant).Include(x => x.Contract).Include(x => x.Reports).FirstOrDefaultAsync(x => x.Id == id);
        return r == null ? null : new(r.Id, r.RoomId, r.Room?.Title, r.Tenant.FullName, r.ContractId, r.Contract?.Status.ToString(), r.Rating, r.Comment, r.ModerationStatus.ToString(), r.ModerationReason, r.Reports.Select(MapReport).ToList());
    }
    public async Task ModerateAsync(int id, string adminId, string action, string? reason, string? ip)
    {
        var r = await db.Reviews.Include(x => x.Reports).FirstOrDefaultAsync(x => x.Id == id) ?? throw new KeyNotFoundException();
        var before = r.ModerationStatus; var target = action.ToLowerInvariant() switch { "hide" => ReviewModerationStatus.Hidden, "remove" => ReviewModerationStatus.Removed, "restore" => ReviewModerationStatus.Visible, _ => throw new ArgumentException("Hành động không hợp lệ.") };
        if (before == target) return; if (target == ReviewModerationStatus.Removed && string.IsNullOrWhiteSpace(reason)) throw new ArgumentException("Lý do gỡ đánh giá là bắt buộc.");
        r.ModerationStatus = target; r.IsDeleted = false; r.ModeratedByAdminId = adminId; r.ModeratedAt = DateTime.UtcNow; r.ModerationReason = reason?.Trim(); r.IsModerated = true;
        foreach (var report in r.Reports.Where(x => x.Status == ReviewReportStatus.Pending)) { report.Status = ReviewReportStatus.Actioned; report.ReviewedAt = DateTime.UtcNow; report.ReviewedByAdminId = adminId; }
        db.Notifications.Add(new Notification { UserId = r.TenantId, Type = $"Review{target}", Title = "Cập nhật kiểm duyệt đánh giá", Content = reason, LinkedId = r.Id });
        db.AuditLogs.Add(new AuditLog { UserId = adminId, Action = $"Review{target}", EntityType = "Review", EntityId = r.Id, IpAddress = ip, Details = JsonSerializer.Serialize(new { before, after = target, reason }) });
        await db.SaveChangesAsync();
    }
    public async Task DismissAsync(int reportId, string adminId, string? note, string? ip)
    {
        var report = await db.ReviewViolations.FirstOrDefaultAsync(x => x.Id == reportId) ?? throw new KeyNotFoundException(); if (report.Status == ReviewReportStatus.Dismissed) return;
        if (report.Status != ReviewReportStatus.Pending) throw new InvalidOperationException("Báo cáo đã được xử lý."); report.Status = ReviewReportStatus.Dismissed; report.AdminNote = note?.Trim(); report.ReviewedAt = DateTime.UtcNow; report.ReviewedByAdminId = adminId;
        db.Notifications.Add(new Notification { UserId = report.ReporterId, Type = "ReportResolved", Title = "Báo cáo đánh giá đã được xử lý", Content = note, LinkedId = report.ReviewId });
        db.AuditLogs.Add(new AuditLog { UserId = adminId, Action = "DismissReviewReport", EntityType = "ReviewViolation", EntityId = report.Id, IpAddress = ip, Details = JsonSerializer.Serialize(new { note }) }); await db.SaveChangesAsync();
    }
    private static ReviewReportDto MapReport(ReviewViolation x) => new(x.Id, x.ReviewId, x.ReasonCode, x.Description, x.Status.ToString(), x.ReporterId, x.CreatedAt);
}
