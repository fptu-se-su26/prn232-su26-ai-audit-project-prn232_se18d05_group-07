using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Application.Common.DTOs.Contracts;
using Application.Common.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace RoomHub.API.Controllers
{
    [Authorize(Roles = "PropertyOwner")]
    [ApiController]
    [Route("api/owner/contracts")]
    public class ContractsController : ControllerBase
    {
        private readonly IContractService _contractService;

        public ContractsController(IContractService contractService)
        {
            _contractService = contractService;
        }

        // ==========================================
        // 1. SEARCH ROOMHUB TENANT ACCOUNT BY EMAIL/PHONE
        // ==========================================
        [HttpGet("search-tenant")]
        [Route("~/api/owner/tenants/search")]
        public async Task<IActionResult> SearchTenant([FromQuery] string query)
        {
            var ownerId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(ownerId))
                return Unauthorized(new { message = "Không xác định danh tính chủ nhà." });

            if (string.IsNullOrWhiteSpace(query))
                return BadRequest(new { message = "Vui lòng nhập từ khóa tìm kiếm (email/SĐT)." });

            var result = await _contractService.SearchTenantAsync(query);
            if (result == null)
                return NotFound(new { message = "Không tìm thấy tài khoản RoomHub khách thuê nào khớp với thông tin." });

            return Ok(result);
        }

        // ==========================================
        // 2. CREATE LEASE CONTRACT & LINK TENANT
        // ==========================================
        [HttpPost]
        public async Task<IActionResult> CreateContract([FromBody] CreateContractRequest request)
        {
            var ownerId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(ownerId))
                return Unauthorized(new { message = "Không xác định danh tính chủ nhà." });

            if (request == null)
                return BadRequest(new { message = "Dữ liệu hợp đồng không hợp lệ." });

            if (request.StartDate >= request.EndDate)
                return BadRequest(new { message = "Ngày kết thúc phải sau ngày bắt đầu thuê." });

            try
            {
                var success = await _contractService.CreateContractAsync(request, ownerId);
                if (success)
                {
                    return Ok(new { success = true, message = "Ký hợp đồng và thêm khách thuê vào phòng thành công." });
                }
                return BadRequest(new { message = "Không thể tạo hợp đồng." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // ==========================================
        // 3. TERMINATE LEASE CONTRACT (CHECKOUT)
        // ==========================================
        [HttpPost("terminate/{roomId}")]
        public async Task<IActionResult> TerminateContract(int roomId, [FromBody] TerminateContractRequest request)
        {
            var ownerId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(ownerId))
                return Unauthorized(new { message = "Không xác định danh tính chủ nhà." });

            if (request == null)
                return BadRequest(new { message = "Dữ liệu thanh lý không hợp lệ." });

            try
            {
                var success = await _contractService.TerminateContractAsync(roomId, request, ownerId);
                if (success)
                {
                     return Ok(new { success = true, message = "Thanh lý hợp đồng và bàn giao trả phòng thành công." });
                }
                return BadRequest(new { message = "Không thể thanh lý hợp đồng." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // ==========================================
        // 4. GET ALL OWNER TENANTS
        // ==========================================
        [HttpGet("~/api/owner/tenants")]
        public async Task<IActionResult> GetTenants()
        {
            var ownerId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(ownerId))
                return Unauthorized(new { message = "Không xác định danh tính chủ nhà." });

            var result = await _contractService.GetTenantsForOwnerAsync(ownerId);
            return Ok(result);
        }
    }
}
