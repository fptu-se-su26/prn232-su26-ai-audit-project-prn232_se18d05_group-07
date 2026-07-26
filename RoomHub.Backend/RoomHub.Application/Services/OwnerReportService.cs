using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Common.DTOs.Reports;
using Application.Common.Interfaces;
using Domain.Entities;
using Domain.Enums;

namespace Application.Services
{
    /// <summary>
    /// Tổng hợp báo cáo doanh thu / tỉ lệ lấp đầy / công nợ cho chủ trọ.
    /// Chỉ đọc: tái sử dụng các repository sẵn có, không ghi dữ liệu, không migration.
    /// </summary>
    public class OwnerReportService : IOwnerReportService
    {
        // Hóa đơn đã hủy không tính vào bất kỳ báo cáo nào.
        private static readonly InvoiceStatus[] CountableStatuses =
        {
            InvoiceStatus.Paid, InvoiceStatus.Unpaid, InvoiceStatus.Overdue, InvoiceStatus.Pending
        };

        // Công nợ = hóa đơn chưa thu được tiền.
        private static readonly InvoiceStatus[] DebtStatuses =
        {
            InvoiceStatus.Unpaid, InvoiceStatus.Overdue
        };

        private const int DefaultMonthSpan = 6;

        private readonly IBuildingRepository _buildingRepository;
        private readonly IInvoiceRepository _invoiceRepository;
        private readonly IContractRepository _contractRepository;

        public OwnerReportService(
            IBuildingRepository buildingRepository,
            IInvoiceRepository invoiceRepository,
            IContractRepository contractRepository)
        {
            _buildingRepository = buildingRepository;
            _invoiceRepository = invoiceRepository;
            _contractRepository = contractRepository;
        }

        // ==========================================
        // 1. DOANH THU
        // ==========================================
        public async Task<RevenueReportDto> GetRevenueReportAsync(string ownerId, OwnerReportFilter filter)
        {
            var range = Normalize(filter);
            var invoices = await _invoiceRepository.GetInvoicesByOwnerAsync(ownerId);

            var scoped = invoices
                .Where(i => CountableStatuses.Contains(i.Status))
                .Where(i => MatchesBuilding(i, range.BuildingId))
                .Where(i => IsWithin(i.InvoiceDate, range))
                .ToList();

            var rows = new List<RevenueReportRowDto>();
            foreach (var (month, year) in EnumerateMonths(range))
            {
                var monthly = scoped
                    .Where(i => i.InvoiceDate.Month == month && i.InvoiceDate.Year == year)
                    .ToList();

                rows.Add(new RevenueReportRowDto
                {
                    Month = month,
                    Year = year,
                    Period = $"{month:D2}/{year}",
                    InvoiceCount = monthly.Count,
                    Invoiced = monthly.Sum(i => i.TotalAmount),
                    Collected = monthly.Where(i => i.Status == InvoiceStatus.Paid).Sum(i => i.TotalAmount),
                    Outstanding = monthly.Where(i => i.Status != InvoiceStatus.Paid).Sum(i => i.TotalAmount)
                });
            }

            return new RevenueReportDto
            {
                Period = $"{range.FromMonth:D2}/{range.FromYear} - {range.ToMonth:D2}/{range.ToYear}",
                BuildingName = await ResolveBuildingNameAsync(ownerId, range.BuildingId),
                Rows = rows,
                TotalInvoiced = rows.Sum(r => r.Invoiced),
                TotalCollected = rows.Sum(r => r.Collected),
                TotalOutstanding = rows.Sum(r => r.Outstanding),
                TotalInvoiceCount = rows.Sum(r => r.InvoiceCount)
            };
        }

        // ==========================================
        // 2. TỈ LỆ LẤP ĐẦY
        // ==========================================
        public async Task<OccupancyReportDto> GetOccupancyReportAsync(string ownerId, int? buildingId)
        {
            var buildings = await _buildingRepository.GetBuildingsByOwnerAsync(ownerId);
            if (buildingId.HasValue)
                buildings = buildings.Where(b => b.Id == buildingId.Value).ToList();

            var rows = new List<OccupancyReportRowDto>();
            foreach (var building in buildings.OrderBy(b => b.Name))
            {
                var rooms = building.Floors
                    .SelectMany(f => f.Rooms)
                    .Where(r => !r.IsDeleted)
                    .ToList();

                var occupied = rooms.Count(r => r.Status == RoomStatus.Occupied);
                var deposited = rooms.Count(r => r.Status == RoomStatus.Deposited);
                var available = rooms.Count(r => r.Status == RoomStatus.Available);

                rows.Add(new OccupancyReportRowDto
                {
                    BuildingId = building.Id,
                    BuildingName = building.Name,
                    Address = $"{building.Address}, {building.Ward}, {building.District}",
                    TotalRooms = rooms.Count,
                    OccupiedRooms = occupied,
                    DepositedRooms = deposited,
                    AvailableRooms = available,
                    OtherRooms = rooms.Count - occupied - deposited - available,
                    OccupancyRate = Rate(occupied + deposited, rooms.Count)
                });
            }

            var totalRooms = rows.Sum(r => r.TotalRooms);
            var totalOccupied = rows.Sum(r => r.OccupiedRooms);
            var totalDeposited = rows.Sum(r => r.DepositedRooms);

            return new OccupancyReportDto
            {
                Rows = rows,
                TotalRooms = totalRooms,
                TotalOccupiedRooms = totalOccupied,
                TotalDepositedRooms = totalDeposited,
                TotalAvailableRooms = rows.Sum(r => r.AvailableRooms),
                OverallOccupancyRate = Rate(totalOccupied + totalDeposited, totalRooms)
            };
        }

        // ==========================================
        // 3. CÔNG NỢ
        // ==========================================
        public async Task<DebtReportDto> GetDebtReportAsync(string ownerId, int? buildingId)
        {
            var invoices = await _invoiceRepository.GetInvoicesByOwnerAsync(ownerId);
            var contracts = await _contractRepository.GetContractsByOwnerAsync(ownerId);

            // GetInvoicesByOwnerAsync không Include Contract.Tenant, còn GetContractsByOwnerAsync thì có.
            // Tra cứu qua ContractId để lấy tên/SĐT khách thuê mà không phải sửa repository.
            var tenantByContract = contracts.ToDictionary(c => c.Id, c => c);

            var today = DateTime.UtcNow.Date;
            var rows = invoices
                .Where(i => DebtStatuses.Contains(i.Status))
                .Where(i => MatchesBuilding(i, buildingId))
                .OrderByDescending(i => i.DueDate < today)
                .ThenBy(i => i.DueDate)
                .Select(i =>
                {
                    tenantByContract.TryGetValue(i.ContractId, out var contract);
                    return new DebtReportRowDto
                    {
                        InvoiceId = i.Id,
                        BuildingName = i.Contract?.Room?.Floor?.Building?.Name ?? "Chưa rõ",
                        RoomNumber = i.Contract?.Room?.RoomNumber ?? "Chưa rõ",
                        TenantName = ResolveTenantName(contract),
                        TenantPhone = contract?.TemporaryTenantPhone ?? contract?.Tenant?.PhoneNumber,
                        Amount = i.TotalAmount,
                        InvoiceDate = i.InvoiceDate,
                        DueDate = i.DueDate,
                        DaysOverdue = Math.Max(0, (today - i.DueDate.Date).Days),
                        Status = i.Status.ToString()
                    };
                })
                .ToList();

            var overdue = rows.Where(r => r.DaysOverdue > 0).ToList();

            return new DebtReportDto
            {
                Rows = rows,
                TotalDebt = rows.Sum(r => r.Amount),
                OverdueDebt = overdue.Sum(r => r.Amount),
                TotalInvoices = rows.Count,
                OverdueInvoices = overdue.Count
            };
        }

        // ==========================================
        // 4. XUẤT EXCEL
        // ==========================================
        public async Task<byte[]> ExportReportsToExcelAsync(string ownerId, OwnerReportFilter filter)
        {
            var range = Normalize(filter);
            var revenue = await GetRevenueReportAsync(ownerId, range);
            var occupancy = await GetOccupancyReportAsync(ownerId, range.BuildingId);
            var debt = await GetDebtReportAsync(ownerId, range.BuildingId);

            return OwnerReportExcelExporter.Build(revenue, occupancy, debt);
        }

        // ==========================================
        // Helpers
        // ==========================================

        /// <summary>
        /// Chuẩn hóa khoảng thời gian: giá trị thiếu/không hợp lệ sẽ lùi về 6 tháng gần nhất,
        /// và tự đảo nếu người dùng chọn ngược thứ tự. Báo cáo không nên trả lỗi vì lý do này.
        /// </summary>
        private static OwnerReportFilter Normalize(OwnerReportFilter? filter)
        {
            var now = DateTime.UtcNow;
            var fallbackFrom = new DateTime(now.Year, now.Month, 1).AddMonths(-(DefaultMonthSpan - 1));

            var from = BuildDate(filter?.FromMonth ?? 0, filter?.FromYear ?? 0) ?? fallbackFrom;
            var to = BuildDate(filter?.ToMonth ?? 0, filter?.ToYear ?? 0) ?? new DateTime(now.Year, now.Month, 1);

            if (from > to) (from, to) = (to, from);

            return new OwnerReportFilter
            {
                FromMonth = from.Month,
                FromYear = from.Year,
                ToMonth = to.Month,
                ToYear = to.Year,
                BuildingId = filter?.BuildingId
            };
        }

        private static DateTime? BuildDate(int month, int year) =>
            month is >= 1 and <= 12 && year is >= 2000 and <= 2999
                ? new DateTime(year, month, 1)
                : null;

        private static bool IsWithin(DateTime date, OwnerReportFilter range)
        {
            var value = date.Year * 12 + date.Month;
            return value >= range.FromYear * 12 + range.FromMonth
                && value <= range.ToYear * 12 + range.ToMonth;
        }

        private static IEnumerable<(int Month, int Year)> EnumerateMonths(OwnerReportFilter range)
        {
            var cursor = new DateTime(range.FromYear, range.FromMonth, 1);
            var end = new DateTime(range.ToYear, range.ToMonth, 1);
            while (cursor <= end)
            {
                yield return (cursor.Month, cursor.Year);
                cursor = cursor.AddMonths(1);
            }
        }

        private static bool MatchesBuilding(Invoice invoice, int? buildingId) =>
            !buildingId.HasValue
            || invoice.Contract?.Room?.Floor?.BuildingId == buildingId.Value;

        private static decimal Rate(int part, int total) =>
            total == 0 ? 0 : Math.Round(part * 100m / total, 1);

        private static string ResolveTenantName(Contract? contract) =>
            contract?.TemporaryTenantName
            ?? contract?.Tenant?.FullName
            ?? "Chưa rõ";

        private async Task<string?> ResolveBuildingNameAsync(string ownerId, int? buildingId)
        {
            if (!buildingId.HasValue) return null;
            var buildings = await _buildingRepository.GetBuildingsByOwnerAsync(ownerId);
            return buildings.FirstOrDefault(b => b.Id == buildingId.Value)?.Name;
        }
    }
}
