using System.Threading.Tasks;
using Application.Common.DTOs.Listings;
using Application.Common.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace RoomHub.API.Controllers
{
    [ApiController]
    [Route("api/public/listings")]
    public class PublicListingsController : ControllerBase
    {
        private readonly IPublicListingService _publicListingService;

        public PublicListingsController(IPublicListingService publicListingService)
        {
            _publicListingService = publicListingService;
        }

        // ==========================================
        // 1. GET ALL PUBLIC APPROVED LISTINGS
        // ==========================================
        [HttpGet]
        public async Task<IActionResult> GetListings([FromQuery] PublicListingFilterRequest filter)
        {
            var result = await _publicListingService.SearchListingsAsync(filter);
            return Ok(result);
        }

        // ==========================================
        // 2. GET SINGLE PUBLIC LISTING BY ID
        // ==========================================
        [HttpGet("{id}")]
        public async Task<IActionResult> GetListingById(int id)
        {
            var result = await _publicListingService.GetListingDetailAsync(id);
            if (result == null)
                return NotFound(new { message = "Không tìm thấy tin cho thuê hoặc tin đã bị ẩn." });

            return Ok(result);
        }
    }
}
