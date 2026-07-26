using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Application.Common.DTOs.Reports;
using Application.Common.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace RoomHub.API.Controllers
{
    [Authorize(Roles = "PropertyOwner")]
    [ApiController]
    [Route("api/owner/reports")]
    public class OwnerReportsController : ControllerBase
    {
        private const string XlsxContentType =
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

        private readonly IOwnerReportService _reportService;

        public OwnerReportsController(IOwnerReportService reportService)
        {
            _reportService = reportService;
        }

        // ==========================================
        // 1. BÁO CÁO DOANH THU
        // ==========================================
        [HttpGet("revenue")]
        public async Task<IActionResult> GetRevenue(
            [FromQuery] int fromMonth, [FromQuery] int fromYear,
            [FromQuery] int toMonth, [FromQuery] int toYear,
            [FromQuery] int? buildingId)
        {
            var ownerId = GetOwnerId();
            if (ownerId == null)
                return Unauthorized(new { message = "Không xác định danh tính chủ nhà." });

            try
            {
                var filter = BuildFilter(fromMonth, fromYear, toMonth, toYear, buildingId);
                return Ok(await _reportService.GetRevenueReportAsync(ownerId, filter));
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Có lỗi xảy ra khi lập báo cáo doanh thu.", details = ex.Message });
            }
        }

        // ==========================================
        // 2. BÁO CÁO TỈ LỆ LẤP ĐẦY
        // ==========================================
        [HttpGet("occupancy")]
        public async Task<IActionResult> GetOccupancy([FromQuery] int? buildingId)
        {
            var ownerId = GetOwnerId();
            if (ownerId == null)
                return Unauthorized(new { message = "Không xác định danh tính chủ nhà." });

            try
            {
                return Ok(await _reportService.GetOccupancyReportAsync(ownerId, buildingId));
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Có lỗi xảy ra khi lập báo cáo tỉ lệ lấp đầy.", details = ex.Message });
            }
        }

        // ==========================================
        // 3. BÁO CÁO CÔNG NỢ
        // ==========================================
        [HttpGet("debt")]
        public async Task<IActionResult> GetDebt([FromQuery] int? buildingId)
        {
            var ownerId = GetOwnerId();
            if (ownerId == null)
                return Unauthorized(new { message = "Không xác định danh tính chủ nhà." });

            try
            {
                return Ok(await _reportService.GetDebtReportAsync(ownerId, buildingId));
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Có lỗi xảy ra khi lập báo cáo công nợ.", details = ex.Message });
            }
        }

        // ==========================================
        // 4. XUẤT EXCEL — 3 SHEET TRONG MỘT FILE
        // ==========================================
        [HttpGet("export")]
        public async Task<IActionResult> Export(
            [FromQuery] int fromMonth, [FromQuery] int fromYear,
            [FromQuery] int toMonth, [FromQuery] int toYear,
            [FromQuery] int? buildingId)
        {
            var ownerId = GetOwnerId();
            if (ownerId == null)
                return Unauthorized(new { message = "Không xác định danh tính chủ nhà." });

            try
            {
                var filter = BuildFilter(fromMonth, fromYear, toMonth, toYear, buildingId);
                var fileBytes = await _reportService.ExportReportsToExcelAsync(ownerId, filter);
                var fileName = $"BaoCao_RoomHub_{DateTime.Now:yyyyMMddHHmmss}.xlsx";
                return File(fileBytes, XlsxContentType, fileName);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Có lỗi xảy ra khi xuất báo cáo.", details = ex.Message });
            }
        }

        // ==========================================
        // Helpers
        // ==========================================
        private string? GetOwnerId()
        {
            var ownerId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return string.IsNullOrEmpty(ownerId) ? null : ownerId;
        }

        private static OwnerReportFilter BuildFilter(int fromMonth, int fromYear, int toMonth, int toYear, int? buildingId) =>
            new()
            {
                FromMonth = fromMonth,
                FromYear = fromYear,
                ToMonth = toMonth,
                ToYear = toYear,
                BuildingId = buildingId
            };
    }
}
