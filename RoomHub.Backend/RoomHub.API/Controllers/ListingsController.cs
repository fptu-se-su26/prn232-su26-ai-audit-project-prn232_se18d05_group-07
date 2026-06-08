using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Application.Common.DTOs.Listings;
using Application.Common.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace RoomHub.API.Controllers
{
    [Authorize(Roles = "PropertyOwner")]
    [ApiController]
    [Route("api/owner/listings")]
    public class ListingsController : ControllerBase
    {
        private readonly IListingService _listingService;

        public ListingsController(IListingService listingService)
        {
            _listingService = listingService;
        }

        [HttpGet]
        public async Task<IActionResult> GetListings()
        {
            var ownerId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(ownerId))
                return Unauthorized(new { message = "Không xác định danh tính chủ nhà." });

            var result = await _listingService.GetOwnerListingsAsync(ownerId);
            return Ok(result);
        }

        [HttpPost("validate-content")]
        public async Task<IActionResult> ValidateContent([FromBody] ValidateContentRequest request)
        {
            if (request == null)
                return BadRequest(new { message = "Dữ liệu không hợp lệ." });

            var result = await _listingService.ValidateContentAsync(request);
            return Ok(new
            {
                isValid = result.IsValid,
                message = result.Message,
                field = result.Field,
                listingScore = result.ListingScore,
                aiSkipped = result.AiSkipped
            });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateListing(int id, [FromBody] UpdateListingRequest request)
        {
            var ownerId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(ownerId))
                return Unauthorized(new { message = "Không xác định danh tính chủ nhà." });

            if (request == null)
                return BadRequest(new { message = "Dữ liệu tin đăng không hợp lệ." });

            if (string.IsNullOrWhiteSpace(request.Title))
                return BadRequest(new { message = "Tiêu đề không được để trống." });

            var result = await _listingService.UpdateListingAsync(id, request, ownerId);
            if (result == null)
                return BadRequest(new { message = "Không thể cập nhật tin đăng." });

            if (!result.Success)
                return BadRequest(new
                {
                    success = false,
                    message = result.Message,
                    moderationStatus = result.ModerationStatus,
                    moderationRemarks = result.ModerationRemarks,
                    listingScore = result.ListingScore,
                    isPublished = result.IsPublished
                });

            return Ok(new
            {
                success = true,
                message = result.Message,
                moderationStatus = result.ModerationStatus,
                moderationRemarks = result.ModerationRemarks,
                listingScore = result.ListingScore,
                isPublished = result.IsPublished
            });
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetListing(int id)
        {
            var ownerId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(ownerId))
                return Unauthorized(new { message = "Không xác định danh tính chủ nhà." });

            var result = await _listingService.GetListingByIdAsync(id, ownerId);
            if (result == null)
                return NotFound(new { message = "Không tìm thấy tin đăng." });

            return Ok(result);
        }

        [HttpPost("{id:int}/duplicate")]
        public async Task<IActionResult> DuplicateListing(int id, [FromBody] DuplicateListingRequest? request)
        {
            var ownerId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(ownerId))
                return Unauthorized(new { message = "Không xác định danh tính chủ nhà." });

            var result = await _listingService.DuplicateListingAsync(id, ownerId, request);
            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteListing(int id)
        {
            var ownerId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(ownerId))
                return Unauthorized(new { message = "Không xác định danh tính chủ nhà." });

            var deleted = await _listingService.DeleteListingAsync(id, ownerId);
            if (!deleted)
                return NotFound(new { message = "Không tìm thấy tin đăng." });

            return Ok(new { success = true, message = "Đã xóa vĩnh viễn tin đăng." });
        }

        [HttpPut("{id}/publish")]
        public async Task<IActionResult> TogglePublish(int id, [FromBody] TogglePublishRequest request)
        {
            var ownerId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(ownerId))
                return Unauthorized(new { message = "Không xác định danh tính chủ nhà." });

            if (request == null)
                return BadRequest(new { message = "Dữ liệu không hợp lệ." });

            var result = await _listingService.TogglePublishStatusAsync(id, request.IsPublished, ownerId);
            if (result == null)
                return BadRequest(new { message = "Không thể thay đổi trạng thái tin đăng." });

            if (!result.Success)
                return BadRequest(new
                {
                    success = false,
                    message = result.Message,
                    moderationStatus = result.ModerationStatus,
                    moderationRemarks = result.ModerationRemarks,
                    listingScore = result.ListingScore,
                    isPublished = result.IsPublished
                });

            return Ok(new
            {
                success = true,
                message = result.Message,
                moderationStatus = result.ModerationStatus,
                moderationRemarks = result.ModerationRemarks,
                listingScore = result.ListingScore,
                isPublished = result.IsPublished
            });
        }
    }

    public class TogglePublishRequest
    {
        public bool IsPublished { get; set; }
    }
}
