using Application.Common.DTOs.AdminUsers;

namespace Application.Common.Interfaces;

public interface IAdminUserService
{
    Task<PagedResult<AdminUserListItemDto>> GetUsersAsync(AdminUserQuery query, CancellationToken cancellationToken = default);
    Task<AdminUserDetailDto?> GetUserAsync(string userId, CancellationToken cancellationToken = default);
    Task<PagedResult<AdminUserAuditLogDto>> GetAuditLogsAsync(string userId, int page, int pageSize, CancellationToken cancellationToken = default);
    Task BanAsync(string userId, BanUserRequest request, AdminUserActionContext context, CancellationToken cancellationToken = default);
    Task UnbanAsync(string userId, UnbanUserRequest request, AdminUserActionContext context, CancellationToken cancellationToken = default);
}

public sealed class AdminUserConflictException(string message) : Exception(message);
public sealed class AdminUserValidationException(string message) : Exception(message);
