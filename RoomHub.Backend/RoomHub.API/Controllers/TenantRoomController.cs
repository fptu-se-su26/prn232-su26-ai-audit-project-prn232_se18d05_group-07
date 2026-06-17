using System;
using System.IO;
using System.Security.Claims;
using System.Threading.Tasks;
using Application.Common.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;

namespace RoomHub.API.Controllers
{
    [Authorize(Roles = "Tenant")]
    [ApiController]
    [Route("api/tenant/room")]
    public class TenantRoomController : ControllerBase
    {
        private readonly IContractService _contractService;
        private readonly IConfiguration _configuration;
        private readonly IWebHostEnvironment _env;

        public TenantRoomController(
            IContractService contractService,
            IConfiguration configuration,
            IWebHostEnvironment env)
        {
            _contractService = contractService;
            _configuration = configuration;
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
                return BadRequest(new { message = ex.Message, detail = ex.ToString() });
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
                return BadRequest(new { message = ex.Message, detail = ex.ToString() });
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
                var url = await SaveSignatureImageAsync(bytes);
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

        // Uploads the signature PNG to Cloudinary when configured; otherwise falls
        // back to a local file under wwwroot/uploads/signatures. Returns an absolute URL.
        private async Task<string> SaveSignatureImageAsync(byte[] bytes)
        {
            var cloudName = _configuration["CloudinarySettings:CloudName"];
            var apiKey = _configuration["CloudinarySettings:ApiKey"];
            var apiSecret = _configuration["CloudinarySettings:ApiSecret"];

            bool cloudinaryConfigured =
                !string.IsNullOrWhiteSpace(cloudName) && !cloudName.Contains("YOUR_CLOUDINARY") &&
                !string.IsNullOrWhiteSpace(apiKey) && !apiKey.Contains("YOUR_CLOUDINARY") &&
                !string.IsNullOrWhiteSpace(apiSecret) && !apiSecret.Contains("YOUR_CLOUDINARY");

            if (cloudinaryConfigured)
            {
                var account = new CloudinaryDotNet.Account(cloudName, apiKey, apiSecret);
                var cloudinary = new CloudinaryDotNet.Cloudinary(account);
                using var stream = new MemoryStream(bytes);
                var uploadParams = new CloudinaryDotNet.Actions.ImageUploadParams
                {
                    File = new CloudinaryDotNet.FileDescription($"signature_{Guid.NewGuid():N}.png", stream),
                    Folder = "roomhub_signatures"
                };
                var result = await cloudinary.UploadAsync(uploadParams);
                if (result.StatusCode == System.Net.HttpStatusCode.OK)
                    return result.SecureUrl.ToString();
                throw new Exception("Tải chữ ký lên Cloudinary thất bại.");
            }

            // Local fallback (served by Program.cs at /uploads)
            var webRoot = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            var folder = Path.Combine(webRoot, "uploads", "signatures");
            Directory.CreateDirectory(folder);
            var fileName = $"signature_{Guid.NewGuid():N}.png";
            await System.IO.File.WriteAllBytesAsync(Path.Combine(folder, fileName), bytes);
            return $"{Request.Scheme}://{Request.Host}/uploads/signatures/{fileName}";
        }
    }

    public class SignContractRequest
    {
        public string SignatureImage { get; set; } = null!;
    }
}
