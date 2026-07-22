using System.Security.Claims;
using Application.Common.DTOs.AdminUsers;
using Application.Common.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace RoomHub.API.Controllers;

[ApiController]
[Route("api/admin/users")]
[Authorize(Roles = "Administrator")]
public sealed class AdminUsersController(IAdminUserService service) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<PagedResult<AdminUserListItemDto>>> GetUsers([FromQuery] AdminUserQuery query, CancellationToken ct) => Ok(await service.GetUsersAsync(query, ct));

    [HttpGet("{id}")]
    public async Task<ActionResult<AdminUserDetailDto>> GetUser(string id, CancellationToken ct)
    {
        var user = await service.GetUserAsync(id, ct);
        return user is null ? NotFound(Error("User not found.")) : Ok(user);
    }

    [HttpGet("{id}/audit-logs")]
    public async Task<ActionResult<PagedResult<AdminUserAuditLogDto>>> GetAuditLogs(string id, [FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default)
    {
        if (await service.GetUserAsync(id, ct) is null) return NotFound(Error("User not found."));
        return Ok(await service.GetAuditLogsAsync(id, page, pageSize, ct));
    }

    [HttpPut("{id}/ban")]
    public Task<IActionResult> Ban(string id, BanUserRequest request, CancellationToken ct) => Execute(() => service.BanAsync(id, request, Context(), ct));

    [HttpPut("{id}/unban")]
    public Task<IActionResult> Unban(string id, UnbanUserRequest request, CancellationToken ct) => Execute(() => service.UnbanAsync(id, request, Context(), ct));

    private AdminUserActionContext Context() => new(User.FindFirstValue(ClaimTypes.NameIdentifier)!, HttpContext.Connection.RemoteIpAddress?.ToString());
    private async Task<IActionResult> Execute(Func<Task> action)
    {
        try { await action(); return Ok(new { success = true }); }
        catch (AdminUserValidationException ex) { return BadRequest(Error(ex.Message)); }
        catch (AdminUserConflictException ex) { return Conflict(Error(ex.Message)); }
        catch (KeyNotFoundException ex) { return NotFound(Error(ex.Message)); }
    }
    private static object Error(string message) => new { success = false, message, errors = new Dictionary<string, string[]>() };
}
