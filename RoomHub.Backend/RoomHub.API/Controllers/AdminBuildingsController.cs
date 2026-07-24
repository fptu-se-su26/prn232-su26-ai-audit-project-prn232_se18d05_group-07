using System;
using System.Threading.Tasks;
using Application.Common.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace RoomHub.API.Controllers
{
    [Authorize(Roles = "Administrator")]
    [ApiController]
    [Route("api/admin/buildings")]
    public class AdminBuildingsController : ControllerBase
    {
        private readonly IAdminBuildingService _adminBuildingService;

        public AdminBuildingsController(IAdminBuildingService adminBuildingService)
        {
            _adminBuildingService = adminBuildingService;
        }

        // ==========================================
        // 1. GET ALL BUILDINGS FOR ADMIN MANAGEMENT
        // ==========================================
        [HttpGet]
        public async Task<IActionResult> GetAllBuildings()
        {
            try
            {
                var result = await _adminBuildingService.GetAllBuildingsAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Lỗi khi lấy danh sách tòa nhà", details = ex.Message });
            }
        }

        // ==========================================
        // 2. TOGGLE LOCK / UNLOCK BUILDING
        // ==========================================
        [HttpPost("{id}/toggle-lock")]
        public async Task<IActionResult> ToggleLockBuilding(int id, [FromBody] LockBuildingRequest? request)
        {
            try
            {
                var success = await _adminBuildingService.ToggleLockBuildingAsync(id, request?.Reason);
                if (!success)
                    return NotFound(new { success = false, message = "Không tìm thấy tòa nhà hoặc tòa nhà đã bị xóa." });

                return Ok(new { success = true, message = "Cập nhật trạng thái khóa tòa nhà thành công." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Lỗi khi cập nhật trạng thái khóa tòa nhà", details = ex.Message });
            }
        }
    }

    public class LockBuildingRequest
    {
        public string? Reason { get; set; }
    }
}
