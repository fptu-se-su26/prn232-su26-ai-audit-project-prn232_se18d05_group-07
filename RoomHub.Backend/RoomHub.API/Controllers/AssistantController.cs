using System.Security.Claims;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Application.Common.DTOs.Assistant;
using Application.Common.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace RoomHub.API.Controllers
{
    [ApiController]
    [Route("api/assistant")]
    public class AssistantController : ControllerBase
    {
        private const int MaxMessageLength = 500;

        private static readonly JsonSerializerOptions CamelCase = new()
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };

        private readonly IRoomAssistantService _assistantService;

        public AssistantController(IRoomAssistantService assistantService)
        {
            _assistantService = assistantService;
        }

        /// <summary>
        /// Trợ lý AI tìm phòng (RAG) — trả về JSON đầy đủ một lần. Cho phép ẩn danh.
        /// </summary>
        [HttpPost("search")]
        [AllowAnonymous]
        public async Task<IActionResult> Search([FromBody] AssistantRequest request)
        {
            var error = Validate(request);
            if (error != null) return BadRequest(new { message = error });

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var result = await _assistantService.SearchAsync(request, userId);
            return Ok(result);
        }

        /// <summary>
        /// Phiên bản streaming (SSE): phát meta → token → done. Cho phép ẩn danh.
        /// </summary>
        [HttpPost("stream")]
        [AllowAnonymous]
        public async Task Stream([FromBody] AssistantRequest request, CancellationToken ct)
        {
            var error = Validate(request);
            if (error != null)
            {
                Response.StatusCode = 400;
                await Response.WriteAsJsonAsync(new { message = error }, ct);
                return;
            }

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            Response.Headers.ContentType = "text/event-stream";
            Response.Headers.CacheControl = "no-cache";
            Response.Headers["X-Accel-Buffering"] = "no";

            await foreach (var ev in _assistantService.SearchStreamAsync(request, userId, ct))
            {
                if (ct.IsCancellationRequested) break;
                var json = JsonSerializer.Serialize(ev, CamelCase);
                await Response.WriteAsync($"data: {json}\n\n", ct);
                await Response.Body.FlushAsync(ct);
            }
        }

        private static string? Validate(AssistantRequest request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.Message))
                return "Vui lòng nhập nội dung cần tìm.";
            if (request.Message.Length > MaxMessageLength)
                return $"Nội dung quá dài (tối đa {MaxMessageLength} ký tự).";
            return null;
        }
    }
}
