using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Application.Common.DTOs.Subscriptions;
using Application.Common.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace RoomHub.API.Controllers
{
    [ApiController]
    [Route("api")]
    public class SubscriptionController : ControllerBase
    {
        private readonly ISubscriptionService _subscriptionService;

        public SubscriptionController(ISubscriptionService subscriptionService)
        {
            _subscriptionService = subscriptionService;
        }

        // ==========================================
        // 1. GET CURRENT OWNER SUBSCRIPTION STATUS
        // ==========================================
        [Authorize(Roles = "PropertyOwner")]
        [HttpGet("owner/subscription/status")]
        public async Task<IActionResult> GetStatus()
        {
            var ownerId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(ownerId))
                return Unauthorized(new { message = "Không xác định danh tính chủ nhà." });

            try
            {
                var result = await _subscriptionService.GetSubscriptionStatusAsync(ownerId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // ==========================================
        // 2. REQUEST UPGRADE GÓI CƯỚC (VietQR / Chuyển khoản)
        // ==========================================
        [Authorize(Roles = "PropertyOwner")]
        [HttpPost("owner/subscription/subscribe")]
        public async Task<IActionResult> Subscribe([FromBody] UpgradeRequestDto request)
        {
            var ownerId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(ownerId))
                return Unauthorized(new { message = "Không xác định danh tính chủ nhà." });

            if (request == null || string.IsNullOrWhiteSpace(request.PlanType))
                return BadRequest(new { message = "Thông tin đăng ký gói cước không hợp lệ." });

            try
            {
                var result = await _subscriptionService.RequestUpgradeAsync(ownerId, request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // ==========================================
        // 3. SIMULATED PAYMENT WEBHOOK (For sandbox testing)
        // ==========================================
        [Authorize(Roles = "PropertyOwner")]
        [HttpPost("subscription/simulate-webhook")]
        public async Task<IActionResult> SimulateWebhook([FromBody] SimulateWebhookRequest request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.Memo))
                return BadRequest(new { message = "Nội dung giao dịch mô phỏng trống." });

            var ownerId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(ownerId))
                return Unauthorized(new { message = "Không xác định danh tính chủ nhà." });

            var success = await _subscriptionService.HandlePayOSWebhookAsync(request.Memo, ownerId);
            if (success)
            {
                return Ok(new { success = true, message = "Thanh toán giả lập thành công. Gói cước đã được kích hoạt!" });
            }

            return BadRequest(new { message = "Giao dịch giả lập không hợp lệ hoặc đã được xử lý." });
        }

        // ==========================================
        // 4. ADMIN: GET ALL PENDING SUBSCRIPTIONS
        // ==========================================
        [Authorize(Roles = "Administrator")]
        [HttpGet("admin/subscriptions")]
        public async Task<IActionResult> GetPendingSubscriptions()
        {
            try
            {
                var result = await _subscriptionService.GetPendingSubscriptionsAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // ==========================================
        // 5. ADMIN: APPROVE SUBSCRIPTION
        // ==========================================
        [Authorize(Roles = "Administrator")]
        [HttpPost("admin/subscriptions/{id}/approve")]
        public async Task<IActionResult> Approve(int id)
        {
            var adminId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(adminId))
                return Unauthorized(new { message = "Không xác định danh tính Admin." });

            var success = await _subscriptionService.ApproveSubscriptionAsync(id, adminId);
            if (success)
            {
                return Ok(new { success = true, message = "Phê duyệt giao dịch nạp tiền thành công. Gói cước đã được kích hoạt." });
            }

            return BadRequest(new { message = "Không thể phê duyệt giao dịch này. Vui lòng kiểm tra lại." });
        }

        // ==========================================
        // 6. ADMIN: REJECT SUBSCRIPTION
        // ==========================================
        [Authorize(Roles = "Administrator")]
        [HttpPost("admin/subscriptions/{id}/reject")]
        public async Task<IActionResult> Reject(int id, [FromBody] RejectRequest request)
        {
            var adminId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(adminId))
                return Unauthorized(new { message = "Không xác định danh tính Admin." });

            var reason = request?.Reason ?? "Ảnh hóa đơn không hợp lệ hoặc không nhận được tiền.";
            var success = await _subscriptionService.RejectSubscriptionAsync(id, reason, adminId);
            if (success)
            {
                return Ok(new { success = true, message = "Đã từ chối giao dịch nạp tiền." });
            }

            return BadRequest(new { message = "Không thể xử lý từ chối giao dịch này." });
        }
    }

    public class SimulateWebhookRequest
    {
        public string Memo { get; set; } = null!;
    }

    public class RejectRequest
    {
        public string Reason { get; set; } = null!;
    }
}
