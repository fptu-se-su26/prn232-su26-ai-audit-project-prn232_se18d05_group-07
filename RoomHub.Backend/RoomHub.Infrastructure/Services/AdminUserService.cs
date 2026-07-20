using System.Text.Json;
using Application.Common.DTOs.AdminUsers;
using Application.Common.Interfaces;
using Domain.Entities;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Services;

public sealed class AdminUserService(ApplicationDbContext db) : IAdminUserService
{
    private static bool IsBanActive(ApplicationUser user, DateTime now) =>
        user.IsBanned && (!user.BannedUntil.HasValue || user.BannedUntil > now);

    public async Task<PagedResult<AdminUserListItemDto>> GetUsersAsync(AdminUserQuery request, CancellationToken cancellationToken = default)
    {
        var page = Math.Max(1, request.Page);
        var pageSize = Math.Clamp(request.PageSize, 1, 100);
        var now = DateTime.UtcNow;
        var query = db.Users.AsNoTracking();
        var term = request.Query?.Trim();
        if (!string.IsNullOrEmpty(term))
            query = query.Where(u => u.FullName.Contains(term) || (u.Email != null && u.Email.Contains(term)));
        if (!string.IsNullOrWhiteSpace(request.Role))
        {
            var role = request.Role.Trim();
            query = query.Where(u => db.UserRoles.Any(ur => ur.UserId == u.Id && db.Roles.Any(r => r.Id == ur.RoleId && r.Name == role)));
        }
        query = request.Status?.Trim().ToLowerInvariant() switch
        {
            "active" => query.Where(u => !u.IsDeleted && (!u.IsBanned || (u.BannedUntil != null && u.BannedUntil <= now)) && u.EmailConfirmed),
            "banned" => query.Where(u => u.IsBanned && (u.BannedUntil == null || u.BannedUntil > now)),
            "deleted" => query.Where(u => u.IsDeleted),
            "emailunverified" => query.Where(u => !u.IsDeleted && !u.EmailConfirmed),
            _ => query
        };
        query = (request.SortBy.Trim().ToLowerInvariant(), request.SortDir.Trim().ToLowerInvariant()) switch
        {
            ("name", "asc") => query.OrderBy(u => u.FullName),
            ("name", _) => query.OrderByDescending(u => u.FullName),
            ("email", "asc") => query.OrderBy(u => u.Email),
            ("email", _) => query.OrderByDescending(u => u.Email),
            ("createdat", "asc") => query.OrderBy(u => u.CreatedAt),
            _ => query.OrderByDescending(u => u.CreatedAt)
        };
        var total = await query.CountAsync(cancellationToken);
        var rows = await query.Skip((page - 1) * pageSize).Take(pageSize)
            .Select(u => new
            {
                u.Id, u.FullName, Email = u.Email ?? string.Empty, u.EmailConfirmed, u.IsDeleted,
                u.IsBanned, u.BannedUntil, u.CreatedAt,
                Role = db.UserRoles.Where(ur => ur.UserId == u.Id)
                    .Join(db.Roles, ur => ur.RoleId, r => r.Id, (_, r) => r.Name).FirstOrDefault() ?? "Unknown"
            }).ToListAsync(cancellationToken);
        var items = rows.Select(u => new AdminUserListItemDto(u.Id, u.FullName, u.Email, u.Role,
            Status(u.IsDeleted, u.EmailConfirmed, u.IsBanned && (!u.BannedUntil.HasValue || u.BannedUntil > now)),
            u.EmailConfirmed, u.IsBanned && (!u.BannedUntil.HasValue || u.BannedUntil > now), u.CreatedAt, u.BannedUntil)).ToList();
        return new(items, page, pageSize, total);
    }

    public async Task<AdminUserDetailDto?> GetUserAsync(string userId, CancellationToken cancellationToken = default)
    {
        var user = await db.Users.AsNoTracking().SingleOrDefaultAsync(u => u.Id == userId, cancellationToken);
        if (user is null) return null;
        var role = await db.UserRoles.Where(ur => ur.UserId == user.Id)
            .Join(db.Roles, ur => ur.RoleId, r => r.Id, (_, r) => r.Name).FirstOrDefaultAsync(cancellationToken) ?? "Unknown";
        var activeBan = IsBanActive(user, DateTime.UtcNow);
        return new(user.Id, user.FullName, user.Email ?? string.Empty, user.PhoneNumber, user.Address, user.Gender,
            user.DateOfBirth, user.AvatarUrl, role, Status(user.IsDeleted, user.EmailConfirmed, activeBan),
            user.EmailConfirmed, user.IsVerified, user.IsDeleted, activeBan, user.CreatedAt, user.UpdatedAt,
            user.BannedAt, user.BannedUntil, user.BanReason, user.BannedByAdminId);
    }

    public async Task<PagedResult<AdminUserAuditLogDto>> GetAuditLogsAsync(string userId, int page, int pageSize, CancellationToken cancellationToken = default)
    {
        page = Math.Max(1, page); pageSize = Math.Clamp(pageSize, 1, 100);
        var query = db.AuditLogs.AsNoTracking().Where(a => a.TargetUserId == userId).OrderByDescending(a => a.CreatedAt);
        var total = await query.CountAsync(cancellationToken);
        var items = await query.Skip((page - 1) * pageSize).Take(pageSize)
            .Select(a => new AdminUserAuditLogDto(a.Id, a.UserId, a.Action, a.Details, a.IpAddress, a.CreatedAt))
            .ToListAsync(cancellationToken);
        return new(items, page, pageSize, total);
    }

    public async Task BanAsync(string userId, BanUserRequest request, AdminUserActionContext context, CancellationToken cancellationToken = default)
    {
        var reason = ValidateReason(request.Reason);
        if (userId == context.AdminId) throw new AdminUserConflictException("Administrators cannot ban their own account.");
        var now = DateTime.UtcNow;
        if (request.BannedUntil.HasValue && request.BannedUntil <= now)
            throw new AdminUserValidationException("BannedUntil must be in the future.");
        await using var tx = await db.Database.BeginTransactionAsync(cancellationToken);
        var user = await db.Users.SingleOrDefaultAsync(u => u.Id == userId, cancellationToken) ?? throw new KeyNotFoundException("User not found.");
        if (IsBanActive(user, now)) throw new AdminUserConflictException("User is already banned.");
        var isAdmin = await IsInRoleAsync(user.Id, "Administrator", cancellationToken);
        if (isAdmin)
        {
            var adminRoleId = await db.Roles.Where(r => r.Name == "Administrator").Select(r => r.Id).SingleAsync(cancellationToken);
            var activeAdmins = await db.UserRoles.Where(ur => ur.RoleId == adminRoleId)
                .Join(db.Users, ur => ur.UserId, u => u.Id, (_, u) => u)
                .CountAsync(u => !u.IsDeleted && (!u.IsBanned || (u.BannedUntil != null && u.BannedUntil <= now)), cancellationToken);
            if (activeAdmins <= 1) throw new AdminUserConflictException("The last active administrator cannot be banned.");
        }
        var before = Snapshot(user, now);
        user.IsBanned = true; user.BannedAt = now; user.BannedUntil = request.BannedUntil;
        user.BanReason = reason; user.BannedByAdminId = context.AdminId; user.UpdatedAt = now;
        user.SecurityStamp = Guid.NewGuid().ToString();
        db.RefreshTokens.RemoveRange(db.RefreshTokens.Where(t => t.UserId == user.Id));
        AddAuditAndNotification(user, context, "UserBanned", reason, before, Snapshot(user, now));
        await db.SaveChangesAsync(cancellationToken); await tx.CommitAsync(cancellationToken);
    }

    public async Task UnbanAsync(string userId, UnbanUserRequest request, AdminUserActionContext context, CancellationToken cancellationToken = default)
    {
        var reason = ValidateReason(request.Reason); var now = DateTime.UtcNow;
        await using var tx = await db.Database.BeginTransactionAsync(cancellationToken);
        var user = await db.Users.SingleOrDefaultAsync(u => u.Id == userId, cancellationToken) ?? throw new KeyNotFoundException("User not found.");
        if (!IsBanActive(user, now)) throw new AdminUserConflictException("User is not currently banned.");
        var before = Snapshot(user, now);
        user.IsBanned = false; user.BannedAt = null; user.BannedUntil = null; user.BanReason = null;
        user.BannedByAdminId = null; user.UpdatedAt = now; user.SecurityStamp = Guid.NewGuid().ToString();
        AddAuditAndNotification(user, context, "UserUnbanned", reason, before, Snapshot(user, now));
        await db.SaveChangesAsync(cancellationToken); await tx.CommitAsync(cancellationToken);
    }

    private async Task<bool> IsInRoleAsync(string userId, string role, CancellationToken ct) =>
        await db.UserRoles.AnyAsync(ur => ur.UserId == userId && db.Roles.Any(r => r.Id == ur.RoleId && r.Name == role), ct);
    private static string ValidateReason(string value)
    {
        var reason = value?.Trim() ?? string.Empty;
        if (reason.Length is < 10 or > 500) throw new AdminUserValidationException("Reason must contain between 10 and 500 characters.");
        return reason;
    }
    private void AddAuditAndNotification(ApplicationUser user, AdminUserActionContext context, string action, string reason, object before, object after)
    {
        db.AuditLogs.Add(new AuditLog { UserId = context.AdminId, TargetUserId = user.Id, Action = action, EntityType = "ApplicationUser", Details = JsonSerializer.Serialize(new { before, after, reason }), IpAddress = context.IpAddress });
        db.Notifications.Add(new Notification { UserId = user.Id, Type = action, Title = action == "UserBanned" ? "Account suspended" : "Account restored", Content = action == "UserBanned" ? $"Your account was suspended. Reason: {reason}" : $"Your account was restored. Reason: {reason}" });
    }
    private static object Snapshot(ApplicationUser u, DateTime now) => new { isBanned = IsBanActive(u, now), u.BannedAt, u.BannedUntil, u.BanReason, u.BannedByAdminId };
    private static string Status(bool deleted, bool confirmed, bool banned) => deleted ? "Deleted" : banned ? "Banned" : !confirmed ? "EmailUnverified" : "Active";
}
