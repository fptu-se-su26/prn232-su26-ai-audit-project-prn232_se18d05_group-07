using System.Security.Claims;
using System.Threading.Tasks;
using Application.Common.DTOs.Listings;
using Application.Common.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace RoomHub.API.Controllers
{
    [Authorize(Roles = "Administrator")]
    [ApiController]
    [Route("api/admin/moderation")]
    public class AdminModerationController : ControllerBase
    {
        private readonly IAdminModerationService _moderationService;

        public AdminModerationController(IAdminModerationService moderationService)
        {
            _moderationService = moderationService;
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            var stats = await _moderationService.GetStatsAsync();
            return Ok(stats);
        }

        [HttpGet("listings/flagged")]
        public async Task<IActionResult> GetFlaggedListings()
        {
            var listings = await _moderationService.GetFlaggedListingsAsync();
            return Ok(listings);
        }

        [HttpGet("listings")]
        public async Task<IActionResult> GetAllListings([FromQuery] string? status = "all")
        {
            var listings = await _moderationService.GetAllListingsAsync(status);
            return Ok(listings);
        }

        [HttpPut("listings/{id}/approve")]
        public async Task<IActionResult> ApproveListing(int id, [FromBody] AdminModerationActionRequest request)
        {
            var adminId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(adminId))
                return Unauthorized(new { message = "Không xác định danh tính Admin." });

            request ??= new AdminModerationActionRequest();
            var result = await _moderationService.ApproveListingAsync(id, adminId, request);
            if (result == null)
                return NotFound(new { message = "Không tìm thấy tin đăng." });

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        [HttpPut("listings/{id}/reject")]
        public async Task<IActionResult> RejectListing(int id, [FromBody] AdminModerationActionRequest request)
        {
            var adminId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(adminId))
                return Unauthorized(new { message = "Không xác định danh tính Admin." });

            request ??= new AdminModerationActionRequest();
            var result = await _moderationService.RejectListingAsync(id, adminId, request);
            if (result == null)
                return NotFound(new { message = "Không tìm thấy tin đăng." });

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }
    }
}
