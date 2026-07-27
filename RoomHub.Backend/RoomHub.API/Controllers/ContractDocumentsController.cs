using System;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using Application.Common.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace RoomHub.API.Controllers
{
    /// <summary>
    /// Tải hợp đồng dưới dạng PDF. Mở cho cả chủ trọ và người thuê — quyền truy cập
    /// từng hợp đồng do tầng service kiểm tra dựa trên OwnerId / TenantId.
    /// </summary>
    [ApiController]
    [Authorize]
    [Route("api/contracts")]
    public class ContractDocumentsController : ControllerBase
    {
        private const string PdfContentType = "application/pdf";

        private readonly IContractPdfService _contractPdfService;

        public ContractDocumentsController(IContractPdfService contractPdfService)
        {
            _contractPdfService = contractPdfService;
        }

        /// <summary>Tải PDF theo mã hợp đồng.</summary>
        [HttpGet("{id:int}/pdf")]
        public Task<IActionResult> DownloadPdf(int id, CancellationToken ct) =>
            Produce(userId => _contractPdfService.GenerateAsync(id, userId, ct));

        /// <summary>Người thuê tải hợp đồng đang hiệu lực của mình, không cần biết mã hợp đồng.</summary>
        [HttpGet("my-active/pdf")]
        [Authorize(Roles = "Tenant")]
        public Task<IActionResult> DownloadMyActivePdf(CancellationToken ct) =>
            Produce(userId => _contractPdfService.GenerateForTenantAsync(userId, ct));

        /// <summary>Chủ trọ tải hợp đồng đang hiệu lực của một phòng.</summary>
        [HttpGet("by-room/{roomId:int}/pdf")]
        [Authorize(Roles = "PropertyOwner")]
        public Task<IActionResult> DownloadByRoomPdf(int roomId, CancellationToken ct) =>
            Produce(userId => _contractPdfService.GenerateForRoomAsync(roomId, userId, ct));

        // ==========================================
        // Helper
        // ==========================================
        private async Task<IActionResult> Produce(Func<string, Task<(byte[] Content, string FileName)>> generate)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(new { message = "Không xác định được danh tính người dùng." });

            try
            {
                var (content, fileName) = await generate(userId);
                return File(content, PdfContentType, fileName);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Có lỗi xảy ra khi xuất hợp đồng.", details = ex.Message });
            }
        }
    }
}
