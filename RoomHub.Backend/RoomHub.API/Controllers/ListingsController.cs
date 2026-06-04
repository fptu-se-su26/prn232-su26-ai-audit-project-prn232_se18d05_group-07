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

        // ==========================================
        // 1. GET ALL OWNER LISTINGS
        // ==========================================
        [HttpGet]
        public async Task<IActionResult> GetListings()
        {
            var ownerId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(ownerId))
                return Unauthorized(new { message = "Không xác định danh tính chủ nhà." });

            var result = await _listingService.GetOwnerListingsAsync(ownerId);
            return Ok(result);
        }

        // ==========================================
        // 2. UPDATE LISTING INFORMATION
        // ==========================================
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

            var success = await _listingService.UpdateListingAsync(id, request, ownerId);
            if (!success)
                return BadRequest(new { message = "Không thể cập nhật tin đăng." });

            return Ok(new { success = true, message = "Cập nhật tin đăng thành công." });
        }

        // ==========================================
        // 3. TOGGLE PUBLISH STATUS
        // ==========================================
        [HttpPut("{id}/publish")]
        public async Task<IActionResult> TogglePublish(int id, [FromBody] TogglePublishRequest request)
        {
            var ownerId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(ownerId))
                return Unauthorized(new { message = "Không xác định danh tính chủ nhà." });

            if (request == null)
                return BadRequest(new { message = "Dữ liệu không hợp lệ." });

            var success = await _listingService.TogglePublishStatusAsync(id, request.IsPublished, ownerId);
            if (!success)
                return BadRequest(new { message = "Không thể thay đổi trạng thái tin đăng." });

            return Ok(new { success = true, message = request.IsPublished ? "Đăng tin thành công." : "Ẩn tin thành công." });
        }
    }

    public class TogglePublishRequest
    {
        public bool IsPublished { get; set; }
    }
}
