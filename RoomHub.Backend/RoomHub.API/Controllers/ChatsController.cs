using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Application.Common.DTOs.Chats;
using Application.Common.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Hosting;
using System.IO;
using System.Collections.Generic;

namespace RoomHub.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ChatsController : ControllerBase
    {
        private readonly IChatService _chatService;
        private readonly IConversationRepository _conversationRepository;
        private readonly IWebHostEnvironment _environment;

        public ChatsController(IChatService chatService, IConversationRepository conversationRepository, IWebHostEnvironment environment)
        {
            _chatService = chatService;
            _conversationRepository = conversationRepository;
            _environment = environment;
        }

        [HttpPost("conversations/{id}/attachments")]
        // Leave room for multipart headers while keeping the actual file limit at 25 MB.
        [RequestSizeLimit(26 * 1024 * 1024)]
        public async Task<IActionResult> UploadAttachment(long id, IFormFile file)
        {
            var userId = GetUserId();
            var conversation = await _conversationRepository.GetByIdAsync(id);
            if (conversation == null) return NotFound();
            if (conversation.OwnerId != userId && conversation.TenantId != userId)
                return Forbid();
            if (file == null || file.Length == 0)
                throw new ArgumentException("Vui lòng chọn một tệp.");
            if (file.Length > 25 * 1024 * 1024)
                throw new ArgumentException("Tệp không được vượt quá 25 MB.");

            var allowed = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
            {
                ".jpg", ".jpeg", ".png", ".gif", ".webp", ".pdf",
                ".doc", ".docx", ".xls", ".xlsx", ".txt", ".zip"
            };
            var extension = Path.GetExtension(file.FileName);
            if (!allowed.Contains(extension))
                throw new ArgumentException("Định dạng tệp chưa được hỗ trợ.");

            var webRoot = _environment.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            var folder = Path.Combine(webRoot, "uploads", "chat", id.ToString());
            Directory.CreateDirectory(folder);
            var storedName = $"{Guid.NewGuid():N}{extension.ToLowerInvariant()}";
            await using (var stream = System.IO.File.Create(Path.Combine(folder, storedName)))
                await file.CopyToAsync(stream);

            var baseUrl = $"{Request.Scheme}://{Request.Host}";
            return Ok(new
            {
                url = $"{baseUrl}/uploads/chat/{id}/{storedName}",
                name = Path.GetFileName(file.FileName),
                contentType = file.ContentType,
                size = file.Length
            });
        }

        private string GetUserId()
        {
            return User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? throw new UnauthorizedAccessException("Không tìm thấy định danh người dùng trong access token.");
        }

        [HttpGet("conversations")]
        public async Task<IActionResult> GetConversations()
        {
            var userId = GetUserId();
            var conversations = await _chatService.GetConversationsAsync(userId);
            return Ok(conversations);
        }

        [HttpGet("conversations/{id}/messages")]
        public async Task<IActionResult> GetMessages(long id)
        {
            var userId = GetUserId();
            var messages = await _chatService.GetMessagesAsync(id, userId);
            return Ok(messages);
        }

        [HttpPost("conversations/{id}/messages")]
        public async Task<IActionResult> SendMessage(long id, [FromBody] SendMessageRequestDto request)
        {
            var userId = GetUserId();
            var message = await _chatService.SendMessageAsync(id, userId, request);
            return Ok(message);
        }

        [HttpPost("conversations")]
        [Authorize(Roles = "Tenant")]
        public async Task<IActionResult> CreateConversation([FromBody] CreateConversationRequestDto request)
        {
            if (request == null)
                throw new ArgumentException("Thông tin cuộc trò chuyện là bắt buộc.");

            var conversation = await _chatService.CreateOrGetConversationAsync(
                GetUserId(), request.OwnerId, request.RoomId);
            return Ok(conversation);
        }
    }
}
