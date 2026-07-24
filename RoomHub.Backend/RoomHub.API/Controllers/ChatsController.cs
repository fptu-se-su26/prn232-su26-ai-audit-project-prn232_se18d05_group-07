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
            return User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? throw new Exception("User ID not found in token");
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
            try
            {
                var messages = await _chatService.GetMessagesAsync(id, userId);
                return Ok(messages);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpPost("conversations/{id}/messages")]
        public async Task<IActionResult> SendMessage(long id, [FromBody] SendMessageRequestDto request)
        {
            var userId = GetUserId();
            try
            {
                var message = await _chatService.SendMessageAsync(id, userId, request);
                return Ok(message);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpPost("conversations")]
        [Authorize(Roles = "Tenant")]
        public async Task<IActionResult> CreateConversation([FromBody] CreateConversationRequestDto request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.OwnerId))
                return BadRequest(new { Message = "Missing owner information." });

            try
            {
                // The tenant comes from the token, not the request body.
                var conversation = await _chatService.CreateOrGetConversationAsync(GetUserId(), request.OwnerId);
                return Ok(conversation);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }
    }
}
