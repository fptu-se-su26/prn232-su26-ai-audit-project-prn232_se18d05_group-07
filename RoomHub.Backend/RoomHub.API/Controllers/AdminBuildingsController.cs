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
    }
}
