using System;
using System.Threading.Tasks;
using Application.Common.DTOs.Services;
using Application.Common.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace RoomHub.API.Controllers
{
    [ApiController]
    [Route("api")]
    public class ServicesController : ControllerBase
    {
        private readonly IServiceCatalogService _catalogService;

        public ServicesController(IServiceCatalogService catalogService)
        {
            _catalogService = catalogService;
        }

        // Danh mục dịch vụ — mọi người dùng đã đăng nhập đều xem được.
        [HttpGet("services")]
        [Authorize]
        public async Task<IActionResult> GetAll()
        {
            var result = await _catalogService.GetAllAsync();
            return Ok(result);
        }

        // ----- Quản lý danh mục (Admin) -----

        [HttpPost("admin/services")]
        [Authorize(Roles = "Administrator")]
        public async Task<IActionResult> Create([FromBody] CreateServiceRequest request)
        {
            try
            {
                var result = await _catalogService.CreateAsync(request);
                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("admin/services/{id:int}")]
        [Authorize(Roles = "Administrator")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateServiceRequest request)
        {
            try
            {
                var result = await _catalogService.UpdateAsync(id, request);
                if (result == null)
                    return NotFound(new { message = "Không tìm thấy dịch vụ." });
                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("admin/services/{id:int}")]
        [Authorize(Roles = "Administrator")]
        public async Task<IActionResult> Delete(int id)
        {
            var success = await _catalogService.DeleteAsync(id);
            if (!success)
                return NotFound(new { message = "Không tìm thấy dịch vụ." });
            return Ok(new { success = true, message = "Đã xóa dịch vụ." });
        }
    }
}
