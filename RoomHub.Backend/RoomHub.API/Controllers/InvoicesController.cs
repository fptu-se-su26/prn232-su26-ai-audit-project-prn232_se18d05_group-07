using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Application.Common.DTOs.Invoices;
using Application.Common.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace RoomHub.API.Controllers
{
    [Authorize(Roles = "PropertyOwner")]
    [ApiController]
    [Route("api/owner/invoices")]
    public class InvoicesController : ControllerBase
    {
        private readonly IInvoiceService _invoiceService;

        public InvoicesController(IInvoiceService invoiceService)
        {
            _invoiceService = invoiceService;
        }

        // ==========================================
        // 1. GET ALL OWNER INVOICES
        // ==========================================
        [HttpGet]
        public async Task<IActionResult> GetInvoices()
        {
            var ownerId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(ownerId))
                return Unauthorized(new { message = "Không xác định danh tính chủ nhà." });

            var result = await _invoiceService.GetOwnerInvoicesAsync(ownerId);
            return Ok(result);
        }

        // ==========================================
        // 2. GET SINGLE INVOICE DETAIL
        // ==========================================
        [HttpGet("{id}")]
        public async Task<IActionResult> GetInvoiceDetail(int id)
        {
            var ownerId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(ownerId))
                return Unauthorized(new { message = "Không xác định danh tính chủ nhà." });

            var result = await _invoiceService.GetInvoiceDetailAsync(id, ownerId);
            if (result == null)
                return NotFound(new { message = "Không tìm thấy hóa đơn này hoặc bạn không có quyền truy cập." });

            return Ok(result);
        }

        // ==========================================
        // 3. CREATE BATCH MONTHLY INVOICES
        // ==========================================
        [HttpPost("batch")]
        public async Task<IActionResult> CreateBatchInvoices([FromBody] BatchInvoiceRequest request)
        {
            var ownerId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(ownerId))
                return Unauthorized(new { message = "Không xác định danh tính chủ nhà." });

            if (request == null)
                return BadRequest(new { message = "Dữ liệu hóa đơn không hợp lệ." });

            if (request.RoomReadings == null || request.RoomReadings.Count == 0)
                return BadRequest(new { message = "Không nhận được danh sách chỉ số phòng trọ." });

            try
            {
                var success = await _invoiceService.CreateBatchInvoicesAsync(request, ownerId);
                if (success)
                {
                    return Ok(new { success = true, message = "Chốt tiền phòng và tạo hóa đơn hàng loạt thành công." });
                }
                return BadRequest(new { message = "Có lỗi xảy ra khi tạo hóa đơn." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // ==========================================
        // 4. RECORD OFFLINE/MANUAL PAYMENT
        // ==========================================
        [HttpPost("{id}/payment")]
        public async Task<IActionResult> RecordPayment(int id, [FromBody] RecordPaymentRequest request)
        {
            var ownerId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(ownerId))
                return Unauthorized(new { message = "Không xác định danh tính chủ nhà." });

            if (request == null || request.Amount <= 0)
                return BadRequest(new { message = "Số tiền thanh toán phải lớn hơn 0." });

            try
            {
                var success = await _invoiceService.RecordPaymentAsync(id, request, ownerId);
                if (success)
                {
                    return Ok(new { success = true, message = "Ghi nhận thanh toán hóa đơn thành công." });
                }
                return BadRequest(new { message = "Không thể ghi nhận thanh toán." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // ==========================================
        // 5. CANCEL INVOICE
        // ==========================================
        [HttpPut("{id}/cancel")]
        public async Task<IActionResult> CancelInvoice(int id)
        {
            var ownerId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(ownerId))
                return Unauthorized(new { message = "Không xác định danh tính chủ nhà." });

            var success = await _invoiceService.CancelInvoiceAsync(id, ownerId);
            if (success)
            {
                return Ok(new { success = true, message = "Hủy hóa đơn thành công." });
            }
            return BadRequest(new { message = "Không thể hủy hóa đơn." });
        }

        // ==========================================
        // 6. EXPORT INVOICE TO EXCEL FILE (.xlsx)
        // ==========================================
        [HttpGet("{id}/export")]
        public async Task<IActionResult> ExportInvoice(int id)
        {
            var ownerId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(ownerId))
                return Unauthorized(new { message = "Không xác định danh tính chủ nhà." });

            try
            {
                var fileBytes = await _invoiceService.ExportInvoiceToExcelAsync(id, ownerId);
                var fileName = $"HoaDon_Phong_{id}_{DateTime.Now:yyyyMMddHHmmss}.xlsx";
                return File(fileBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
