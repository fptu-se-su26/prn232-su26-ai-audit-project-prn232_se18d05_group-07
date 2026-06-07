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
                return BadRequest(new { message = ex.Message });
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
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
