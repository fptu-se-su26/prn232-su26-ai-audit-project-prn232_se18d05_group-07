using System;
using System.IO;
using System.Security.Claims;
using System.Threading.Tasks;
using Application.Common.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;

namespace RoomHub.API.Controllers
{
    [Authorize(Roles = "Tenant")]
    [ApiController]
    [Route("api/tenant/room")]
    public class TenantRoomController : ControllerBase
    {
        private readonly IContractService _contractService;
        private readonly IFileUploadService _fileUploadService;
        private readonly IWebHostEnvironment _env;

        public TenantRoomController(
            IContractService contractService,
            IFileUploadService fileUploadService,
            IWebHostEnvironment env)
        {
            _contractService = contractService;
            _fileUploadService = fileUploadService;
            _env = env;
        }

        // ==========================================
        // GET CURRENT TENANT'S ACTIVE ROOM
        // ==========================================
        [HttpGet]
        public async Task<IActionResult> GetMyRoom()
        {
            var tenantId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(tenantId))
                return Unauthorized(new { message = "Không xác định danh tính khách thuê." });

            try
            {
                var result = await _contractService.GetActiveRoomForTenantAsync(tenantId);
                if (result == null)
                    return NotFound(new { message = "Bạn chưa được gán vào phòng nào trên hệ thống." });

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // ==========================================
        // ACCEPT ROOM ASSIGNMENT INVITATION
        // ==========================================
        [HttpPost("accept")]
        public async Task<IActionResult> AcceptRoom()
        {
            var tenantId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(tenantId))
                return Unauthorized(new { message = "Không xác định danh tính khách thuê." });

            try
            {
                var success = await _contractService.AcceptContractAsync(tenantId);
                if (success)
                    return Ok(new { success = true, message = "Đã xác nhận nhận phòng thành công." });

                return BadRequest(new { message = "Không thể xác nhận nhận phòng." });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[AcceptRoom Error] Exception: {ex.Message}");
                Console.WriteLine($"[AcceptRoom Error] StackTrace: {ex.StackTrace}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"[AcceptRoom Error] InnerException: {ex.InnerException.Message}");
                }
                // Stack traces should never reach API clients outside local debugging.
                string? detail = _env.IsDevelopment() ? ex.ToString() : null;
                return BadRequest(new { message = ex.Message, detail });
            }
        }

        // ==========================================
        // REJECT ROOM ASSIGNMENT INVITATION
        // ==========================================
        [HttpPost("reject")]
        public async Task<IActionResult> RejectRoom()
        {
            var tenantId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(tenantId))
                return Unauthorized(new { message = "Không xác định danh tính khách thuê." });

            try
            {
                var success = await _contractService.RejectContractAsync(tenantId);
                if (success)
                    return Ok(new { success = true, message = "Đã từ chối nhận phòng thành công." });

                return BadRequest(new { message = "Không thể từ chối nhận phòng." });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[RejectRoom Error] Exception: {ex.Message}");
                Console.WriteLine($"[RejectRoom Error] StackTrace: {ex.StackTrace}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"[RejectRoom Error] InnerException: {ex.InnerException.Message}");
                }
                // Stack traces should never reach API clients outside local debugging.
                string? detail = _env.IsDevelopment() ? ex.ToString() : null;
                return BadRequest(new { message = ex.Message, detail });
            }
        }

        // ==========================================
        // SIGN THE CONTRACT (mouse-drawn digital signature)
        // ==========================================
        [HttpPost("sign")]
        public async Task<IActionResult> SignContract([FromBody] SignContractRequest request)
        {
            var tenantId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(tenantId))
                return Unauthorized(new { message = "Không xác định danh tính khách thuê." });

            if (string.IsNullOrWhiteSpace(request?.SignatureImage))
                return BadRequest(new { message = "Chữ ký không được để trống." });

            // Strip the optional data-URI prefix ("data:image/png;base64,").
            var payload = request.SignatureImage;
            var commaIndex = payload.IndexOf(',');
            if (commaIndex >= 0) payload = payload.Substring(commaIndex + 1);

            byte[] bytes;
            try { bytes = Convert.FromBase64String(payload); }
            catch { return BadRequest(new { message = "Ảnh chữ ký không hợp lệ." }); }

            if (bytes.Length == 0 || bytes.Length > 2_000_000)
                return BadRequest(new { message = "Ảnh chữ ký rỗng hoặc vượt quá 2MB." });

            try
            {
                using var stream = new MemoryStream(bytes);
                var baseUrl = $"{Request.Scheme}://{Request.Host}";
                var url = await _fileUploadService.UploadImageAsync(stream, "signature.png", "roomhub_signatures", baseUrl);
                var ok = await _contractService.SignContractAsync(tenantId, url);
                if (!ok)
                    return BadRequest(new { message = "Không thể lưu chữ ký." });

                return Ok(new { success = true, signaturePath = url, message = "Đã ký hợp đồng thành công." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

    }

    public class SignContractRequest
    {
        public string SignatureImage { get; set; } = null!;
    }
}
