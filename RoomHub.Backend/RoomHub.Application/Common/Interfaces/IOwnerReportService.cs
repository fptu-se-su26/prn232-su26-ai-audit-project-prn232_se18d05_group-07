using System.Threading.Tasks;
using Application.Common.DTOs.Reports;

namespace Application.Common.Interfaces
{
    /// <summary>
    /// Báo cáo tổng hợp cho chủ trọ. Thuần đọc — không ghi dữ liệu.
    /// Mọi truy vấn đều bị ràng buộc theo ownerId lấy từ JWT.
    /// </summary>
    public interface IOwnerReportService
    {
        Task<RevenueReportDto> GetRevenueReportAsync(string ownerId, OwnerReportFilter filter);
        Task<OccupancyReportDto> GetOccupancyReportAsync(string ownerId, int? buildingId);
        Task<DebtReportDto> GetDebtReportAsync(string ownerId, int? buildingId);
        Task<byte[]> ExportReportsToExcelAsync(string ownerId, OwnerReportFilter filter);
    }
}
