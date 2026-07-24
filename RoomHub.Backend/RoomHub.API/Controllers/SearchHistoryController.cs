using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Application.Common.DTOs.SearchHistory;
using Application.Common.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace RoomHub.API.Controllers
{
    [Authorize(Roles = "Tenant")]
    [ApiController]
    [Route("api/tenant/search-history")]
    public class SearchHistoryController : ControllerBase
    {
        private readonly ISearchHistoryService _searchHistoryService;

        public SearchHistoryController(ISearchHistoryService searchHistoryService)
        {
            _searchHistoryService = searchHistoryService;
        }

        // Ghi lại một lượt tìm kiếm của người thuê.
        [HttpPost]
        public async Task<IActionResult> Log([FromBody] LogSearchRequest request)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(new { message = "Không xác định danh tính người thuê." });

            try
            {
                var result = await _searchHistoryService.LogAsync(userId, request);
                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // Lịch sử tìm kiếm của người thuê hiện tại.
        [HttpGet]
        public async Task<IActionResult> GetMyHistory()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(new { message = "Không xác định danh tính người thuê." });

            var result = await _searchHistoryService.GetMyHistoryAsync(userId);
            return Ok(result);
        }

        // Xóa 1 mục lịch sử.
        [HttpDelete("{id:long}")]
        public async Task<IActionResult> Delete(long id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(new { message = "Không xác định danh tính người thuê." });

            var success = await _searchHistoryService.DeleteAsync(id, userId);
            if (!success)
                return NotFound(new { message = "Không tìm thấy mục lịch sử hoặc bạn không có quyền xóa." });

            return Ok(new { success = true, message = "Đã xóa mục lịch sử." });
        }

        // Xóa toàn bộ lịch sử.
        [HttpDelete]
        public async Task<IActionResult> ClearAll()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(new { message = "Không xác định danh tính người thuê." });

            await _searchHistoryService.ClearAsync(userId);
            return Ok(new { success = true, message = "Đã xóa toàn bộ lịch sử tìm kiếm." });
        }
    }
}
