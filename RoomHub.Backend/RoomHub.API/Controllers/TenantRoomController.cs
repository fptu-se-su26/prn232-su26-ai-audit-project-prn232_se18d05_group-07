using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Application.Common.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace RoomHub.API.Controllers
{
    [Authorize(Roles = "Tenant")]
    [ApiController]
    [Route("api/tenant/room")]
    public class TenantRoomController : ControllerBase
    {
        private readonly IContractService _contractService;

        public TenantRoomController(IContractService contractService)
        {
            _contractService = contractService;
        }

        // ==========================================
        // GET CURRENT TENANT'S ACTIVE ROOM
        // ==========================================
        [HttpGet]
        public async Task<IActionResult> GetMyRoom()
        {
            var tenantId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(tenantId))
                return Unauthorized(new { message = "Không xác định danh tính khách thuê." });

            try
            {
                var result = await _contractService.GetActiveRoomForTenantAsync(tenantId);
                if (result == null)
                    return NotFound(new { message = "Bạn chưa được gán vào phòng nào trên hệ thống." });

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // ==========================================
        // ACCEPT ROOM ASSIGNMENT INVITATION
        // ==========================================
        [HttpPost("accept")]
        public async Task<IActionResult> AcceptRoom()
        {
            var tenantId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(tenantId))
                return Unauthorized(new { message = "Không xác định danh tính khách thuê." });

            try
            {
                var success = await _contractService.AcceptContractAsync(tenantId);
                if (success)
                    return Ok(new { success = true, message = "Đã xác nhận nhận phòng thành công." });

                return BadRequest(new { message = "Không thể xác nhận nhận phòng." });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[AcceptRoom Error] Exception: {ex.Message}");
                Console.WriteLine($"[AcceptRoom Error] StackTrace: {ex.StackTrace}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"[AcceptRoom Error] InnerException: {ex.InnerException.Message}");
                }
                return BadRequest(new { message = ex.Message, detail = ex.ToString() });
            }
        }

        // ==========================================
        // REJECT ROOM ASSIGNMENT INVITATION
        // ==========================================
        [HttpPost("reject")]
        public async Task<IActionResult> RejectRoom()
        {
            var tenantId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(tenantId))
                return Unauthorized(new { message = "Không xác định danh tính khách thuê." });

            try
            {
                var success = await _contractService.RejectContractAsync(tenantId);
                if (success)
                    return Ok(new { success = true, message = "Đã từ chối nhận phòng thành công." });

                return BadRequest(new { message = "Không thể từ chối nhận phòng." });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[RejectRoom Error] Exception: {ex.Message}");
                Console.WriteLine($"[RejectRoom Error] StackTrace: {ex.StackTrace}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"[RejectRoom Error] InnerException: {ex.InnerException.Message}");
                }
                return BadRequest(new { message = ex.Message, detail = ex.ToString() });
            }
        }
    }
}
