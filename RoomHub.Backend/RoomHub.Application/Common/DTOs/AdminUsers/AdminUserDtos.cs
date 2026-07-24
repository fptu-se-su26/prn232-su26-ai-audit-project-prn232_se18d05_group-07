using System.ComponentModel.DataAnnotations;

namespace Application.Common.DTOs.AdminUsers;

public sealed record AdminUserQuery(
    int Page = 1,
    int PageSize = 20,
    string? Query = null,
    string? Role = null,
    string? Status = null,
    string SortBy = "createdAt",
    string SortDir = "desc");

public sealed record AdminUserListItemDto(
    string Id, string FullName, string Email, string Role, string Status,
    bool EmailConfirmed, bool IsBanned, DateTime CreatedAt, DateTime? BannedUntil);

public sealed record AdminUserDetailDto(
    string Id, string FullName, string Email, string? PhoneNumber, string? Address,
    string? Gender, DateTime? DateOfBirth, string? AvatarUrl, string Role, string Status,
    bool EmailConfirmed, bool IsVerified, bool IsDeleted, bool IsBanned,
    DateTime CreatedAt, DateTime? UpdatedAt, DateTime? BannedAt, DateTime? BannedUntil,
    string? BanReason, string? BannedByAdminId);

public sealed record AdminUserAuditLogDto(
    long Id, string? ActorAdminId, string? Action, string? Details, string? IpAddress, DateTime CreatedAt);

public sealed record PagedResult<T>(IReadOnlyList<T> Items, int Page, int PageSize, int TotalCount)
{
    public int TotalPages => TotalCount == 0 ? 0 : (int)Math.Ceiling(TotalCount / (double)PageSize);
}

public sealed class BanUserRequest
{
    [Required, StringLength(500, MinimumLength = 10)]
    public string Reason { get; set; } = string.Empty;
    public DateTime? BannedUntil { get; set; }
}

public sealed class UnbanUserRequest
{
    [Required, StringLength(500, MinimumLength = 10)]
    public string Reason { get; set; } = string.Empty;
}

public sealed record AdminUserActionContext(string AdminId, string? IpAddress);
