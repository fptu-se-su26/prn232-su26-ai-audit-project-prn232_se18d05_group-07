using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Application.Common.DTOs.Services;
using Application.Common.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace RoomHub.API.Controllers
{
    [Authorize(Roles = "PropertyOwner")]
    [ApiController]
    [Route("api/owner/service-requests")]
    public class OwnerServiceRequestsController : ControllerBase
    {
        private readonly IServiceRequestService _service;

        public OwnerServiceRequestsController(IServiceRequestService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetForOwner()
        {
            var ownerId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(ownerId))
                return Unauthorized(new { message = "Không xác định danh tính chủ trọ." });

            var result = await _service.GetForOwnerAsync(ownerId);
            return Ok(result);
        }

        [HttpPut("{id:int}/status")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateServiceRequestStatusRequest request)
        {
            var ownerId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(ownerId))
                return Unauthorized(new { message = "Không xác định danh tính chủ trọ." });

            try
            {
                var result = await _service.UpdateStatusAsync(id, ownerId, request);
                if (result == null)
                    return NotFound(new { message = "Không tìm thấy yêu cầu hoặc không thuộc quyền quản lý của bạn." });
                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
