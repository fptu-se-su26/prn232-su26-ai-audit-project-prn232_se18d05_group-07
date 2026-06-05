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
    }
}
