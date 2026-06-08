using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Application.Common.Interfaces;
using Application.Common.DTOs.Properties;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace RoomHub.API.Controllers
{
    [Authorize(Roles = "PropertyOwner")]
    [ApiController]
    [Route("api/owner/units")]
    public class UnitsController : ControllerBase
    {
        private readonly IPropertyService _propertyService;

        public UnitsController(IPropertyService propertyService)
        {
            _propertyService = propertyService;
        }

        // ==========================================
        // 1. GET DETAILED ROOM/UNIT
        // ==========================================
        [HttpGet("{id}")]
        public async Task<IActionResult> GetUnitDetail(int id)
        {
            var ownerId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(ownerId))
                return Unauthorized(new { message = "Không xác định danh tính chủ nhà." });

            var result = await _propertyService.GetUnitDetailAsync(id, ownerId);
            if (result == null)
                return NotFound(new { message = "Không tìm thấy phòng này hoặc bạn không có quyền truy cập." });

            return Ok(result);
        }

        // ==========================================
        // 2. UPDATE ROOM OPERATIONAL STATUS
        // ==========================================
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateUnitStatus(int id, [FromBody] UpdateStatusRequest request)
        {
            var ownerId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(ownerId))
                return Unauthorized(new { message = "Không xác định danh tính chủ nhà." });

            if (request == null || string.IsNullOrWhiteSpace(request.Status))
                return BadRequest(new { message = "Trạng thái không hợp lệ." });

            var success = await _propertyService.UpdateUnitStatusAsync(id, request.Status, ownerId);
            if (!success)
                return BadRequest(new { message = "Không thể cập nhật trạng thái phòng. Vui lòng kiểm tra lại." });

            return Ok(new { success = true, message = "Cập nhật trạng thái phòng thành công." });
        }

        // ==========================================
        // 3. UPDATE INTERNAL NOTES
        // ==========================================
        [HttpPost("{id}/notes")]
        public async Task<IActionResult> UpdateUnitNotes(int id, [FromBody] UpdateNotesRequest request)
        {
            var ownerId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(ownerId))
                return Unauthorized(new { message = "Không xác định danh tính chủ nhà." });

            if (request == null)
                return BadRequest(new { message = "Nội dung ghi chú không hợp lệ." });

            var success = await _propertyService.UpdateUnitNotesAsync(id, request.Notes ?? "", ownerId);
            if (!success)
                return BadRequest(new { message = "Không thể cập nhật ghi chú phòng. Vui lòng kiểm tra lại." });

            return Ok(new { success = true, message = "Cập nhật ghi chú nội bộ thành công." });
        }

        // ==========================================
        // 4. UPDATE ROOM DETAILS
        // ==========================================
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUnitDetails(int id, [FromBody] UpdateUnitDetailsRequest request)
        {
            var ownerId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(ownerId))
                return Unauthorized(new { message = "Không xác định danh tính chủ nhà." });

            if (request == null)
                return BadRequest(new { message = "Dữ liệu cập nhật không hợp lệ." });

            var success = await _propertyService.UpdateUnitDetailsAsync(id, request, ownerId);
            if (!success)
                return BadRequest(new { message = "Không thể cập nhật thông tin phòng. Vui lòng kiểm tra lại." });

            return Ok(new { success = true, message = "Cập nhật thông tin phòng thành công." });
        }
    }

    public class UpdateStatusRequest
    {
        public string Status { get; set; } = null!;
    }

    public class UpdateNotesRequest
    {
        public string? Notes { get; set; }
    }
}
