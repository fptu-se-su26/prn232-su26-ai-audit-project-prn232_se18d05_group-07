using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Application.Common.DTOs.BookingHistory;
using Application.Common.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace RoomHub.API.Controllers
{
    [Authorize(Roles = "Tenant")]
    [ApiController]
    [Route("api/tenant/booking-history")]
    public class BookingHistoryController : ControllerBase
    {
        private readonly IBookingHistoryService _bookingHistoryService;

        public BookingHistoryController(IBookingHistoryService bookingHistoryService)
        {
            _bookingHistoryService = bookingHistoryService;
        }

        // Ghi lại việc người thuê xem một phòng.
        [HttpPost]
        public async Task<IActionResult> Log([FromBody] LogRoomViewRequest request)
        {
            var tenantId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(tenantId))
                return Unauthorized(new { message = "Không xác định danh tính người thuê." });

            try
            {
                var result = await _bookingHistoryService.LogViewAsync(tenantId, request);
                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // Lịch sử xem phòng của người thuê hiện tại.
        [HttpGet]
        public async Task<IActionResult> GetMyHistory()
        {
            var tenantId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(tenantId))
                return Unauthorized(new { message = "Không xác định danh tính người thuê." });

            var result = await _bookingHistoryService.GetMyHistoryAsync(tenantId);
            return Ok(result);
        }

        // Xóa 1 mục lịch sử.
        [HttpDelete("{id:long}")]
        public async Task<IActionResult> Delete(long id)
        {
            var tenantId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(tenantId))
                return Unauthorized(new { message = "Không xác định danh tính người thuê." });

            var success = await _bookingHistoryService.DeleteAsync(id, tenantId);
            if (!success)
                return NotFound(new { message = "Không tìm thấy mục lịch sử hoặc bạn không có quyền xóa." });

            return Ok(new { success = true, message = "Đã xóa mục lịch sử." });
        }

        // Xóa toàn bộ lịch sử.
        [HttpDelete]
        public async Task<IActionResult> ClearAll()
        {
            var tenantId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(tenantId))
                return Unauthorized(new { message = "Không xác định danh tính người thuê." });

            await _bookingHistoryService.ClearAsync(tenantId);
            return Ok(new { success = true, message = "Đã xóa toàn bộ lịch sử xem phòng." });
        }
    }
}
