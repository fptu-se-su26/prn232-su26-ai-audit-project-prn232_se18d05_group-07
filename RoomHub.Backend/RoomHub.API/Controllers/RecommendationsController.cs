using System;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using Application.Common.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace RoomHub.API.Controllers
{
    [ApiController]
    [Route("api/recommendations")]
    public class RecommendationsController : ControllerBase
    {
        private const int DefaultTake = 6;

        private readonly IRecommendationService _recommendationService;

        public RecommendationsController(IRecommendationService recommendationService)
        {
            _recommendationService = recommendationService;
        }

        /// <summary>
        /// Gợi ý theo khẩu vị người dùng. Cho phép ẩn danh — khách vãng lai nhận tin nổi bật.
        /// </summary>
        [HttpGet("for-you")]
        [AllowAnonymous]
        public async Task<IActionResult> GetForYou([FromQuery] int take = DefaultTake, CancellationToken ct = default)
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                return Ok(await _recommendationService.GetForYouAsync(userId, take, ct));
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Có lỗi xảy ra khi lấy gợi ý.", details = ex.Message });
            }
        }

        /// <summary>
        /// Phòng tương tự một phòng cụ thể. Cho phép ẩn danh.
        /// </summary>
        [HttpGet("similar/{roomId:int}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetSimilar(int roomId, [FromQuery] int take = DefaultTake, CancellationToken ct = default)
        {
            try
            {
                return Ok(await _recommendationService.GetSimilarAsync(roomId, take, ct));
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Có lỗi xảy ra khi tìm phòng tương tự.", details = ex.Message });
            }
        }
    }
}
