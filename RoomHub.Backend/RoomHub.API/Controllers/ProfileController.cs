using System.Security.Claims;
using System.Threading.Tasks;
using Application.Common.DTOs.Profile;
using Application.Common.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace RoomHub.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class ProfileController : ControllerBase
    {
        private readonly IProfileService _profileService;

        public ProfileController(IProfileService profileService)
        {
            _profileService = profileService;
        }

        // GET api/profile/me
        [HttpGet("me")]
        public async Task<IActionResult> GetMyProfile()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(new { message = "Không xác định được danh tính người dùng." });

            var profile = await _profileService.GetProfileAsync(userId);
            if (profile == null)
                return NotFound(new { message = "Không tìm thấy hồ sơ người dùng." });

            return Ok(profile);
        }

        // PUT api/profile
        [HttpPut]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(new { message = "Không xác định được danh tính người dùng." });

            var result = await _profileService.UpdateProfileAsync(userId, dto);
            if (!result.Succeeded)
                return BadRequest(new { message = result.Message });

            return Ok(new { message = result.Message });
        }

        // POST api/profile/change-password
        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(new { message = "Không xác định được danh tính người dùng." });

            var result = await _profileService.ChangePasswordAsync(userId, dto);
            if (!result.Succeeded)
                return BadRequest(new { message = result.Message });

            return Ok(new { message = result.Message });
        }
    }
}
