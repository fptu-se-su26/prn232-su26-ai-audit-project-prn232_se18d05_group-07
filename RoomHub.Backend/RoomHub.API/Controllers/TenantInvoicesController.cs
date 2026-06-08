using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Application.Common.DTOs.Invoices;
using Application.Common.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace RoomHub.API.Controllers
{
    [Authorize(Roles = "Tenant")]
    [ApiController]
    [Route("api/tenant/invoices")]
    public class TenantInvoicesController : ControllerBase
    {
        private readonly IInvoiceService _invoiceService;

        public TenantInvoicesController(IInvoiceService invoiceService)
        {
            _invoiceService = invoiceService;
        }

        // ==========================================
        // 1. GET ALL TENANT INVOICES
        // ==========================================
        [HttpGet]
        public async Task<IActionResult> GetInvoices()
        {
            var tenantId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(tenantId))
                return Unauthorized(new { message = "Không xác định danh tính khách thuê." });

            try
            {
                var result = await _invoiceService.GetTenantInvoicesAsync(tenantId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // ==========================================
        // 2. GET SINGLE INVOICE DETAIL
        // ==========================================
        [HttpGet("{id}")]
        public async Task<IActionResult> GetInvoiceDetail(int id)
        {
            var tenantId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(tenantId))
                return Unauthorized(new { message = "Không xác định danh tính khách thuê." });

            try
            {
                var result = await _invoiceService.GetTenantInvoiceDetailAsync(id, tenantId);
                if (result == null)
                    return NotFound(new { message = "Không tìm thấy hóa đơn này hoặc bạn không có quyền truy cập." });

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // ==========================================
        // 3. MOCK ONLINE PAYMENT FOR INVOICE
        // ==========================================
        [HttpPost("{id}/pay")]
        public async Task<IActionResult> PayInvoice(int id, [FromBody] RecordPaymentRequest request)
        {
            var tenantId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(tenantId))
                return Unauthorized(new { message = "Không xác định danh tính khách thuê." });

            if (request == null || request.Amount <= 0)
                return BadRequest(new { message = "Số tiền thanh toán phải lớn hơn 0." });

            try
            {
                var success = await _invoiceService.TenantPayInvoiceAsync(id, request, tenantId);
                if (success)
                    return Ok(new { success = true, message = "Thanh toán hóa đơn trực tuyến (mô phỏng) thành công." });

                return BadRequest(new { message = "Không thể thực hiện thanh toán hóa đơn." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // ==========================================
        // 4. EXPORT TENANT INVOICE TO EXCEL FILE (.xlsx)
        // ==========================================
        [HttpGet("{id}/export")]
        public async Task<IActionResult> ExportInvoice(int id)
        {
            var tenantId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(tenantId))
                return Unauthorized(new { message = "Không xác định danh tính khách thuê." });

            try
            {
                var fileBytes = await _invoiceService.ExportTenantInvoiceToExcelAsync(id, tenantId);
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
