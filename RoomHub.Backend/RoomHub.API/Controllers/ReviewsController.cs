using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Application.Common.DTOs.Reviews;
using Application.Common.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace RoomHub.API.Controllers
{
    [ApiController]
    [Route("api")]
    public class ReviewsController : ControllerBase
    {
        private readonly IReviewService _reviewService;

        public ReviewsController(IReviewService reviewService)
        {
            _reviewService = reviewService;
        }

        // ==========================================
        // PUBLIC: xem tổng hợp đánh giá của một phòng
        // ==========================================
        [HttpGet("reviews/room/{roomId:int}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetRoomReviews(int roomId)
        {
            var result = await _reviewService.GetRoomReviewsAsync(roomId);
            return Ok(result);
        }

        // ==========================================
        // TENANT: tạo đánh giá cho phòng
        // ==========================================
        [HttpPost("tenant/reviews")]
        [Authorize(Roles = "Tenant")]
        public async Task<IActionResult> CreateReview([FromBody] CreateReviewRequest request)
        {
            var tenantId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(tenantId))
                return Unauthorized(new { message = "Không xác định danh tính người thuê." });

            try
            {
                var result = await _reviewService.CreateReviewAsync(tenantId, request);
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

        // ==========================================
        // TENANT: danh sách đánh giá của chính mình
        // ==========================================
        [HttpGet("tenant/reviews/my")]
        [Authorize(Roles = "Tenant")]
        public async Task<IActionResult> GetMyReviews()
        {
            var tenantId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(tenantId))
                return Unauthorized(new { message = "Không xác định danh tính người thuê." });

            var result = await _reviewService.GetMyReviewsAsync(tenantId);
            return Ok(result);
        }

        // ==========================================
        // TENANT: xóa đánh giá của chính mình
        // ==========================================
        [HttpDelete("tenant/reviews/{id:int}")]
        [Authorize(Roles = "Tenant")]
        public async Task<IActionResult> DeleteReview(int id)
        {
            var tenantId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(tenantId))
                return Unauthorized(new { message = "Không xác định danh tính người thuê." });

            var success = await _reviewService.DeleteReviewAsync(id, tenantId);
            if (!success)
                return NotFound(new { message = "Không tìm thấy đánh giá hoặc bạn không có quyền xóa." });

            return Ok(new { success = true, message = "Đã xóa đánh giá." });
        }
    }
}
