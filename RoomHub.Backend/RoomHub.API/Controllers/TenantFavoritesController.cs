using System.Security.Claims;
using Application.Common.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace RoomHub.API.Controllers;

[ApiController]
[Authorize(Roles = "Tenant")]
[Route("api/tenant/favorites")]
public sealed class TenantFavoritesController(IFavoriteRoomService service) : ControllerBase
{
    private string? UserId => User.FindFirstValue(ClaimTypes.NameIdentifier);

    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] int page = 1, [FromQuery] int pageSize = 12, CancellationToken cancellationToken = default)
    {
        if (UserId is not { } userId) return Unauthorized(Error("Không xác định được người dùng."));
        return Ok(await service.GetAsync(userId, page, pageSize, cancellationToken));
    }

    [HttpGet("ids")]
    public async Task<IActionResult> GetIds(CancellationToken cancellationToken)
    {
        if (UserId is not { } userId) return Unauthorized(Error("Không xác định được người dùng."));
        return Ok(await service.GetIdsAsync(userId, cancellationToken));
    }

    [HttpGet("{roomId:int}/status")]
    public async Task<IActionResult> GetStatus(int roomId, CancellationToken cancellationToken)
    {
        if (UserId is not { } userId) return Unauthorized(Error("Không xác định được người dùng."));
        return Ok(await service.GetStatusAsync(userId, roomId, cancellationToken));
    }

    [HttpPut("{roomId:int}")]
    public async Task<IActionResult> Add(int roomId, CancellationToken cancellationToken)
    {
        if (UserId is not { } userId) return Unauthorized(Error("Không xác định được người dùng."));
        try
        {
            await service.AddAsync(userId, roomId, cancellationToken);
            return Ok(new { success = true, message = "Đã lưu phòng yêu thích." });
        }
        catch (KeyNotFoundException ex) { return NotFound(Error(ex.Message)); }
    }

    [HttpDelete("{roomId:int}")]
    public async Task<IActionResult> Remove(int roomId, CancellationToken cancellationToken)
    {
        if (UserId is not { } userId) return Unauthorized(Error("Không xác định được người dùng."));
        await service.RemoveAsync(userId, roomId, cancellationToken);
        return Ok(new { success = true, message = "Đã bỏ lưu phòng yêu thích." });
    }

    private static object Error(string message) => new { success = false, message, errors = new { } };
}
