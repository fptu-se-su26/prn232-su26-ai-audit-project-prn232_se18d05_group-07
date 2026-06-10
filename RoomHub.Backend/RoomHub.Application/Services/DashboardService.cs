using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Common.DTOs.Dashboard;
using Application.Common.Interfaces;
using Domain.Enums;

namespace Application.Services
{
    public class DashboardService : IDashboardService
    {
        private readonly IBuildingRepository _buildingRepository;
        private readonly IInvoiceRepository _invoiceRepository;
        private readonly IContractRepository _contractRepository;

        public DashboardService(
            IBuildingRepository buildingRepository,
            IInvoiceRepository invoiceRepository,
            IContractRepository contractRepository)
        {
            _buildingRepository = buildingRepository;
            _invoiceRepository = invoiceRepository;
            _contractRepository = contractRepository;
        }

        public async Task<DashboardDto> GetOwnerDashboardDataAsync(string ownerId)
        {
            var buildings = await _buildingRepository.GetBuildingsByOwnerAsync(ownerId);
            var invoices = await _invoiceRepository.GetInvoicesByOwnerAsync(ownerId);
            var contracts = await _contractRepository.GetContractsByOwnerAsync(ownerId);

            var allRooms = buildings.SelectMany(b => b.Floors).SelectMany(f => f.Rooms).Where(r => !r.IsDeleted).ToList();
            var totalProperties = buildings.Count;
            var totalRooms = allRooms.Count;
            var vacantRooms = allRooms.Count(r => r.Status == RoomStatus.Available);
            var occupiedRooms = allRooms.Count(r => r.Status == RoomStatus.Occupied);
            var activeListings = allRooms.Count(r => r.IsPublished);

            var unpaidInvoices = invoices.Where(i => i.Status == InvoiceStatus.Unpaid || i.Status == InvoiceStatus.Overdue).ToList();
            var unpaidInvoicesCount = unpaidInvoices.Count;

            var currentMonth = DateTime.UtcNow.Month;
            var currentYear = DateTime.UtcNow.Year;

            // Calculate revenue this month (sum of total amount of paid invoices in current month)
            var revenueThisMonth = invoices
                .Where(i => i.Status == InvoiceStatus.Paid && i.InvoiceDate.Month == currentMonth && i.InvoiceDate.Year == currentYear)
                .Sum(i => i.TotalAmount);

            var dto = new DashboardDto
            {
                TotalProperties = totalProperties,
                TotalRooms = totalRooms,
                VacantRooms = vacantRooms,
                OccupiedRooms = occupiedRooms,
                ActiveListings = activeListings,
                UnpaidInvoicesCount = unpaidInvoicesCount,
                RevenueThisMonth = revenueThisMonth
            };

            // 1. Dynamic Tasks
            if (unpaidInvoices.Any(i => i.Status == InvoiceStatus.Overdue))
            {
                var overdueCount = unpaidInvoices.Count(i => i.Status == InvoiceStatus.Overdue);
                dto.Tasks.Add(new DashboardTaskDto
                {
                    Title = $"{overdueCount:D2} Hoá đơn đã quá hạn",
                    Description = "Một số phòng trọ chưa đóng tiền phòng đúng hạn quy định.",
                    ActionType = "invoices"
                });
            }

            // Check if any occupied room has no invoice created for the current month
            var occupiedWithNoInvoice = allRooms
                .Where(r => r.Status == RoomStatus.Occupied)
                .Where(r => !invoices.Any(i => i.Contract.RoomId == r.Id && i.InvoiceDate.Month == currentMonth && i.InvoiceDate.Year == currentYear))
                .ToList();

            if (occupiedWithNoInvoice.Any())
            {
                dto.Tasks.Add(new DashboardTaskDto
                {
                    Title = "Chưa chốt chỉ số điện nước",
                    Description = $"Có {occupiedWithNoInvoice.Count} phòng đang thuê chưa chốt chỉ số cuối tháng này.",
                    ActionType = "invoices"
                });
            }

            if (vacantRooms > 0 && activeListings == 0)
            {
                dto.Tasks.Add(new DashboardTaskDto
                {
                    Title = "Có phòng trống chưa đăng tin",
                    Description = $"Hệ thống ghi nhận có {vacantRooms} phòng đang trống chưa được đăng bài tìm khách thuê.",
                    ActionType = "listings"
                });
            }

            // Fallback default tasks if list is short
            if (dto.Tasks.Count == 0)
            {
                dto.Tasks.Add(new DashboardTaskDto
                {
                    Title = "Hệ thống vận hành ổn định",
                    Description = "Hiện tại không có việc cần xử lý gấp. Tất cả phòng và chỉ số đã được cập nhật.",
                    ActionType = "dashboard"
                });
            }

            // 2. Recent Activities
            // We can retrieve from contracts and invoices to build real activities
            var activeContractsSorted = contracts.OrderByDescending(c => c.CreatedAt).Take(3).ToList();
            foreach (var contract in activeContractsSorted)
            {
                dto.RecentActivities.Add(new DashboardActivityDto
                {
                    Text = $"Đã thêm người thuê \"{contract.TemporaryTenantName}\"",
                    Time = contract.CreatedAt.ToString("dd/MM/yyyy HH:mm"),
                    Type = "person_add"
                });
            }

            var recentInvoices = invoices.OrderByDescending(i => i.CreatedAt).Take(2).ToList();
            foreach (var invoice in recentInvoices)
            {
                dto.RecentActivities.Add(new DashboardActivityDto
                {
                    Text = $"Đã tạo hóa đơn phòng {invoice.Contract.Room.RoomNumber} - Tháng {invoice.InvoiceDate:MM/yyyy}",
                    Time = invoice.CreatedAt.ToString("dd/MM/yyyy HH:mm"),
                    Type = "receipt_long"
                });
            }

            // Default activity fallback if empty
            if (dto.RecentActivities.Count == 0)
            {
                dto.RecentActivities.Add(new DashboardActivityDto
                {
                    Text = "Khởi tạo tài khoản quản lý và chốt phòng.",
                    Time = DateTime.UtcNow.AddDays(-2).ToString("dd/MM/yyyy HH:mm"),
                    Type = "info"
                });
            }
            else
            {
                dto.RecentActivities = dto.RecentActivities.OrderByDescending(a => DateTime.ParseExact(a.Time, "dd/MM/yyyy HH:mm", null)).ToList();
            }

            // 3. Revenue Chart Data (Last 6 Months)
            var tempChartData = new List<RevenueChartDataDto>();
            bool hasRealData = false;

            for (int i = 5; i >= 0; i--)
            {
                var targetMonthDate = DateTime.UtcNow.AddMonths(-i);
                var m = targetMonthDate.Month;
                var y = targetMonthDate.Year;

                var monthPaidRevenue = invoices
                    .Where(inv => inv.Status == InvoiceStatus.Paid && inv.InvoiceDate.Month == m && inv.InvoiceDate.Year == y)
                    .Sum(inv => inv.TotalAmount);

                var monthUnpaidRevenue = invoices
                    .Where(inv => (inv.Status == InvoiceStatus.Unpaid || inv.Status == InvoiceStatus.Overdue) && inv.InvoiceDate.Month == m && inv.InvoiceDate.Year == y)
                    .Sum(inv => inv.TotalAmount);

                if (monthPaidRevenue > 0 || monthUnpaidRevenue > 0)
                {
                    hasRealData = true;
                }

                tempChartData.Add(new RevenueChartDataDto
                {
                    Month = $"Th{m}/{y.ToString().Substring(2)}",
                    Revenue = monthPaidRevenue,
                    Unpaid = monthUnpaidRevenue
                });
            }

            if (!hasRealData)
            {
                // Nếu hoàn toàn chưa có dữ liệu thật trong hệ thống, tự động điền dữ liệu mô phỏng để biểu đồ sinh động
                dto.IsMockData = true;
                for (int i = 5; i >= 0; i--)
                {
                    var targetMonthDate = DateTime.UtcNow.AddMonths(-i);
                    var m = targetMonthDate.Month;
                    var y = targetMonthDate.Year;

                    tempChartData[5 - i].Revenue = 15000000 + (m * 1500000);
                    tempChartData[5 - i].Unpaid = 5000000 + (m * 500000);
                }
            }
            else
            {
                dto.IsMockData = false;
            }

            dto.RevenueChartData = tempChartData;

            return dto;
        }
    }
}
