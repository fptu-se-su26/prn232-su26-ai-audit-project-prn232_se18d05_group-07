using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Application.Common.DTOs.Services;
using Application.Common.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace RoomHub.API.Controllers
{
    [Authorize(Roles = "Tenant")]
    [ApiController]
    [Route("api/tenant/service-requests")]
    public class TenantServiceRequestsController : ControllerBase
    {
        private readonly IServiceRequestService _service;

        public TenantServiceRequestsController(IServiceRequestService service)
        {
            _service = service;
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateServiceRequestRequest request)
        {
            var tenantId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(tenantId))
                return Unauthorized(new { message = "Không xác định danh tính người thuê." });

            try
            {
                var result = await _service.CreateAsync(tenantId, request);
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

        [HttpGet]
        public async Task<IActionResult> GetMy()
        {
            var tenantId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(tenantId))
                return Unauthorized(new { message = "Không xác định danh tính người thuê." });

            var result = await _service.GetMyAsync(tenantId);
            return Ok(result);
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Cancel(int id)
        {
            var tenantId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(tenantId))
                return Unauthorized(new { message = "Không xác định danh tính người thuê." });

            var success = await _service.CancelAsync(id, tenantId);
            if (!success)
                return BadRequest(new { message = "Không thể hủy: yêu cầu không tồn tại, không thuộc về bạn, hoặc đã được xử lý." });

            return Ok(new { success = true, message = "Đã hủy yêu cầu dịch vụ." });
        }
    }
}
