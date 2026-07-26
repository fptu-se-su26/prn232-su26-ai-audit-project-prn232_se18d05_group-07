using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Application.Common.DTOs.Chats;
using Application.Common.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace RoomHub.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ChatsController : ControllerBase
    {
        private readonly IChatService _chatService;

        public ChatsController(IChatService chatService)
        {
            _chatService = chatService;
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
