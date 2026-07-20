using Application.Common.DTOs.Viewings;
using Microsoft.AspNetCore.Mvc;

namespace RoomHub.API.Controllers;

public abstract class ViewingControllerBase : ControllerBase
{
    protected string UserId => User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
        ?? throw new WorkflowException("Phiên đăng nhập không hợp lệ.", 401);
    protected async Task<IActionResult> Run(Func<Task<object>> action, int success = 200)
    {
        try { return StatusCode(success, new { success = true, data = await action() }); }
        catch (WorkflowException ex) { return StatusCode(ex.StatusCode, new { success = false, message = ex.Message, errors = new { } }); }
        catch (Microsoft.EntityFrameworkCore.DbUpdateConcurrencyException) { return Conflict(new { success = false, message = "Dữ liệu đã được cập nhật bởi yêu cầu khác.", errors = new { } }); }
    }
}
