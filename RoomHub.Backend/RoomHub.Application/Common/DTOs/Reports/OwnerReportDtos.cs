using System;
using System.Collections.Generic;

namespace Application.Common.DTOs.Reports
{
    /// <summary>
    /// Khoảng thời gian báo cáo, tính theo tháng. Tùy chọn lọc theo một tòa nhà.
    /// </summary>
    public class OwnerReportFilter
    {
        public int FromMonth { get; set; }
        public int FromYear { get; set; }
        public int ToMonth { get; set; }
        public int ToYear { get; set; }
        public int? BuildingId { get; set; }
    }

    // ==========================================
    // 1. DOANH THU
    // ==========================================
    public class RevenueReportRowDto
    {
        public int Month { get; set; }
        public int Year { get; set; }
        public string Period { get; set; } = null!;   // "07/2026"
        public int InvoiceCount { get; set; }
        public decimal Invoiced { get; set; }         // tổng đã xuất hóa đơn
        public decimal Collected { get; set; }        // đã thu (hóa đơn Paid)
        public decimal Outstanding { get; set; }      // còn phải thu (Unpaid + Overdue)
    }

    public class RevenueReportDto
    {
        public string Period { get; set; } = null!;   // "01/2026 - 07/2026"
        public string? BuildingName { get; set; }     // null = tất cả tòa nhà
        public List<RevenueReportRowDto> Rows { get; set; } = new();
        public decimal TotalInvoiced { get; set; }
        public decimal TotalCollected { get; set; }
        public decimal TotalOutstanding { get; set; }
        public int TotalInvoiceCount { get; set; }
    }

    // ==========================================
    // 2. TỈ LỆ LẤP ĐẦY
    // ==========================================
    public class OccupancyReportRowDto
    {
        public int BuildingId { get; set; }
        public string BuildingName { get; set; } = null!;
        public string Address { get; set; } = null!;
        public int TotalRooms { get; set; }
        public int OccupiedRooms { get; set; }
        public int DepositedRooms { get; set; }
        public int AvailableRooms { get; set; }
        public int OtherRooms { get; set; }           // bảo trì, đã ẩn...
        public decimal OccupancyRate { get; set; }    // % — (đang ở + đã cọc) / tổng
    }

    public class OccupancyReportDto
    {
        public List<OccupancyReportRowDto> Rows { get; set; } = new();
        public int TotalRooms { get; set; }
        public int TotalOccupiedRooms { get; set; }
        public int TotalDepositedRooms { get; set; }
        public int TotalAvailableRooms { get; set; }
        public decimal OverallOccupancyRate { get; set; }
    }

    // ==========================================
    // 3. CÔNG NỢ
    // ==========================================
    public class DebtReportRowDto
    {
        public int InvoiceId { get; set; }
        public string BuildingName { get; set; } = null!;
        public string RoomNumber { get; set; } = null!;
        public string TenantName { get; set; } = null!;
        public string? TenantPhone { get; set; }
        public decimal Amount { get; set; }
        public DateTime InvoiceDate { get; set; }
        public DateTime DueDate { get; set; }
        public int DaysOverdue { get; set; }          // 0 nếu chưa tới hạn
        public string Status { get; set; } = null!;
    }

    public class DebtReportDto
    {
        public List<DebtReportRowDto> Rows { get; set; } = new();
        public decimal TotalDebt { get; set; }
        public decimal OverdueDebt { get; set; }      // phần đã quá hạn
        public int TotalInvoices { get; set; }
        public int OverdueInvoices { get; set; }
    }
}
