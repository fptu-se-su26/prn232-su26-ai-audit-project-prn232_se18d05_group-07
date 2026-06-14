using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Application.Common.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace RoomHub.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/notifications")]
    public class NotificationsController : ControllerBase
    {
        private readonly INotificationService _notificationService;

        public NotificationsController(INotificationService notificationService)
        {
            _notificationService = notificationService;
        }


        [HttpGet]
        public async Task<IActionResult> GetNotifications()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(new { message = "Không xác định danh tính người dùng." });

            var result = await _notificationService.GetNotificationsAsync(userId);
            return Ok(result);
        }

        [HttpGet("unread-count")]
        public async Task<IActionResult> GetUnreadCount()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(new { message = "Không xác định danh tính người dùng." });

            var count = await _notificationService.GetUnreadCountAsync(userId);
            return Ok(new { unreadCount = count });
        }

        [HttpPut("{id}/read")]
        public async Task<IActionResult> MarkAsRead(long id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(new { message = "Không xác định danh tính người dùng." });

            var success = await _notificationService.MarkAsReadAsync(id, userId);
            if (!success)
                return NotFound(new { message = "Không tìm thấy thông báo hoặc bạn không có quyền sở hữu." });

            return Ok(new { success = true });
        }


        [HttpPut("read-all")]
        public async Task<IActionResult> MarkAllAsRead()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(new { message = "Không xác định danh tính người dùng." });

            await _notificationService.MarkAllAsReadAsync(userId);
            return Ok(new { success = true });
        }


        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteNotification(long id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(new { message = "Không xác định danh tính người dùng." });

            var success = await _notificationService.DeleteNotificationAsync(id, userId);
            if (!success)
                return NotFound(new { message = "Không tìm thấy thông báo hoặc bạn không có quyền xóa." });

            return Ok(new { success = true, message = "Xóa thông báo thành công." });
        }
    }
}
