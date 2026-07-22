using System.Security.Claims;
using Application.Common.DTOs.Reviews;
using Application.Common.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace RoomHub.API.Controllers;
[ApiController, Route("api/admin"), Authorize(Roles = "Administrator")]
public sealed class AdminReviewsController(IReviewModerationService service) : ControllerBase
{
    [HttpGet("reviews/reports")]
    public async Task<IActionResult> Reports(int page = 1, int pageSize = 20, string? status = null) => Ok(await service.GetReportsAsync(page, pageSize, status));
    [HttpGet("reviews/{id:int}")]
    public async Task<IActionResult> Detail(int id) => (await service.GetReviewAsync(id)) is { } dto ? Ok(dto) : NotFound(Error("Không tìm thấy đánh giá."));
    [HttpPut("reviews/{id:int}/hide")] public Task<IActionResult> Hide(int id, ModerationReasonRequest request) => Act(id, "hide", request.Reason);
    [HttpPut("reviews/{id:int}/remove")] public Task<IActionResult> Remove(int id, ModerationReasonRequest request) => Act(id, "remove", request.Reason);
    [HttpPut("reviews/{id:int}/restore")] public Task<IActionResult> Restore(int id, ModerationReasonRequest request) => Act(id, "restore", request.Reason);
    [HttpPut("review-reports/{id:int}/dismiss")]
    public async Task<IActionResult> Dismiss(int id, DismissReportRequest request) { try { await service.DismissAsync(id, AdminId(), request.Note, Ip()); return Ok(new { success = true }); } catch (KeyNotFoundException) { return NotFound(Error("Không tìm thấy báo cáo.")); } catch (InvalidOperationException e) { return Conflict(Error(e.Message)); } }
    private async Task<IActionResult> Act(int id, string action, string? reason) { try { await service.ModerateAsync(id, AdminId(), action, reason, Ip()); return Ok(new { success = true }); } catch (KeyNotFoundException) { return NotFound(Error("Không tìm thấy đánh giá.")); } catch (ArgumentException e) { return BadRequest(Error(e.Message)); } }
    private string AdminId() => User.FindFirstValue(ClaimTypes.NameIdentifier)!;
    private string? Ip() => HttpContext.Connection.RemoteIpAddress?.ToString();
    private static object Error(string message) => new { success = false, message, errors = new { } };
}
