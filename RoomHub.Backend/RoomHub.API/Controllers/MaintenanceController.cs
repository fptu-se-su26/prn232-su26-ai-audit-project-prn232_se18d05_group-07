using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Application.Common.DTOs.Maintenance;
using Application.Common.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace RoomHub.API.Controllers
{
    [Authorize(Roles = "Tenant")]
    [ApiController]
    [Route("api/tenant/maintenance")]
    public class MaintenanceController : ControllerBase
    {
        private readonly IMaintenanceTicketService _maintenanceService;

        public MaintenanceController(IMaintenanceTicketService maintenanceService)
        {
            _maintenanceService = maintenanceService;
        }

        // Tạo yêu cầu bảo trì cho phòng đang thuê.
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateMaintenanceTicketRequest request)
        {
            var tenantId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(tenantId))
                return Unauthorized(new { message = "Không xác định danh tính người thuê." });

            try
            {
                var result = await _maintenanceService.CreateTicketAsync(tenantId, request);
                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
        }

        // Danh sách yêu cầu bảo trì của người thuê hiện tại.
        [HttpGet]
        public async Task<IActionResult> GetMyTickets()
        {
            var tenantId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(tenantId))
                return Unauthorized(new { message = "Không xác định danh tính người thuê." });

            var result = await _maintenanceService.GetMyTicketsAsync(tenantId);
            return Ok(result);
        }

        // Hủy yêu cầu bảo trì của chính mình (khi chưa được xử lý).
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Cancel(int id)
        {
            var tenantId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(tenantId))
                return Unauthorized(new { message = "Không xác định danh tính người thuê." });

            var success = await _maintenanceService.CancelTicketAsync(id, tenantId);
            if (!success)
                return BadRequest(new { message = "Không thể hủy: yêu cầu không tồn tại, không thuộc về bạn, hoặc đã được xử lý." });

            return Ok(new { success = true, message = "Đã hủy yêu cầu bảo trì." });
        }
    }
}
