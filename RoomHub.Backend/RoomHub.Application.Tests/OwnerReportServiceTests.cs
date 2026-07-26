using Application.Common.DTOs.Reports;
using Application.Common.Interfaces;
using Application.Services;
using Domain.Entities;
using Domain.Enums;
using Xunit;

namespace RoomHub.Application.Tests;

public sealed class OwnerReportServiceTests
{
    private const string Owner = "owner-a";
    private const string Intruder = "owner-b";

    // ==========================================
    // 1. DOANH THU — phân loại theo trạng thái
    // ==========================================
    [Fact]
    public async Task GetRevenueReport_SplitsCollectedFromOutstandingAndIgnoresCancelled()
    {
        var invoices = new List<Invoice>
        {
            Invoice(1, buildingId: 1, new DateTime(2026, 5, 10), 3_000_000m, InvoiceStatus.Paid),
            Invoice(2, buildingId: 1, new DateTime(2026, 5, 12), 2_000_000m, InvoiceStatus.Unpaid),
            Invoice(3, buildingId: 1, new DateTime(2026, 5, 15), 1_000_000m, InvoiceStatus.Overdue),
            Invoice(4, buildingId: 1, new DateTime(2026, 5, 20), 9_999_999m, InvoiceStatus.Cancelled),
        };
        var service = BuildService(invoices: invoices);

        var report = await service.GetRevenueReportAsync(Owner, Range(5, 2026, 5, 2026));

        var may = Assert.Single(report.Rows);
        Assert.Equal(3, may.InvoiceCount);                 // hóa đơn đã hủy không được tính
        Assert.Equal(6_000_000m, may.Invoiced);
        Assert.Equal(3_000_000m, may.Collected);
        Assert.Equal(3_000_000m, may.Outstanding);
        Assert.Equal(6_000_000m, report.TotalInvoiced);
    }

    [Fact]
    public async Task GetRevenueReport_TreatsPendingPaymentAsNotYetCollected()
    {
        var invoices = new List<Invoice>
        {
            Invoice(1, buildingId: 1, new DateTime(2026, 6, 5), 1_500_000m, InvoiceStatus.Pending),
        };
        var service = BuildService(invoices: invoices);

        var report = await service.GetRevenueReportAsync(Owner, Range(6, 2026, 6, 2026));

        Assert.Equal(0m, report.TotalCollected);
        Assert.Equal(1_500_000m, report.TotalOutstanding);
    }

    // ==========================================
    // 2. DOANH THU — lọc khoảng thời gian
    // ==========================================
    [Fact]
    public async Task GetRevenueReport_ExcludesInvoicesOutsideRangeAndKeepsEmptyMonths()
    {
        var invoices = new List<Invoice>
        {
            Invoice(1, buildingId: 1, new DateTime(2026, 3, 9), 1_000_000m, InvoiceStatus.Paid),  // trước kỳ
            Invoice(2, buildingId: 1, new DateTime(2026, 4, 9), 2_000_000m, InvoiceStatus.Paid),  // trong kỳ
            Invoice(3, buildingId: 1, new DateTime(2026, 7, 9), 4_000_000m, InvoiceStatus.Paid),  // sau kỳ
        };
        var service = BuildService(invoices: invoices);

        var report = await service.GetRevenueReportAsync(Owner, Range(4, 2026, 6, 2026));

        Assert.Equal(3, report.Rows.Count);                            // tháng rỗng vẫn hiện, giá trị 0
        Assert.Equal(2_000_000m, report.TotalInvoiced);
        Assert.Equal(new[] { "04/2026", "05/2026", "06/2026" }, report.Rows.Select(r => r.Period));
        Assert.Equal(0m, report.Rows[1].Invoiced);
    }

    // ==========================================
    // 3. TỈ LỆ LẤP ĐẦY
    // ==========================================
    [Fact]
    public async Task GetOccupancyReport_ComputesRateAndHandlesBuildingWithoutRooms()
    {
        var buildings = new List<Building>
        {
            BuildingWith(1, "Nhà trọ A", RoomStatus.Occupied, RoomStatus.Occupied, RoomStatus.Deposited, RoomStatus.Available),
            BuildingWith(2, "Nhà trọ B"),   // chưa có phòng nào
        };
        var service = BuildService(buildings: buildings);

        var report = await service.GetOccupancyReportAsync(Owner, null);

        var a = report.Rows.Single(r => r.BuildingId == 1);
        Assert.Equal(4, a.TotalRooms);
        Assert.Equal(2, a.OccupiedRooms);
        Assert.Equal(1, a.DepositedRooms);
        Assert.Equal(75m, a.OccupancyRate);                            // (2 + 1) / 4

        var b = report.Rows.Single(r => r.BuildingId == 2);
        Assert.Equal(0, b.TotalRooms);
        Assert.Equal(0m, b.OccupancyRate);                             // không chia cho 0
    }

    [Fact]
    public async Task GetOccupancyReport_SkipsDeletedRooms()
    {
        var building = BuildingWith(1, "Nhà trọ A", RoomStatus.Occupied, RoomStatus.Available);
        building.Floors.First().Rooms.Add(new Room { Id = 99, Status = RoomStatus.Occupied, IsDeleted = true });
        var service = BuildService(buildings: new List<Building> { building });

        var report = await service.GetOccupancyReportAsync(Owner, null);

        Assert.Equal(2, report.TotalRooms);
        Assert.Equal(1, report.TotalOccupiedRooms);
    }

    // ==========================================
    // 4. CÔNG NỢ
    // ==========================================
    [Fact]
    public async Task GetDebtReport_OnlyUnpaidAndOverdueAndCountsDaysOverdue()
    {
        var today = DateTime.UtcNow.Date;
        var invoices = new List<Invoice>
        {
            Invoice(1, buildingId: 1, today.AddMonths(-1), 1_000_000m, InvoiceStatus.Overdue, dueDate: today.AddDays(-10)),
            Invoice(2, buildingId: 1, today, 2_000_000m, InvoiceStatus.Unpaid, dueDate: today.AddDays(5)),
            Invoice(3, buildingId: 1, today, 5_000_000m, InvoiceStatus.Paid, dueDate: today.AddDays(-3)),
        };
        var service = BuildService(invoices: invoices);

        var report = await service.GetDebtReportAsync(Owner, null);

        Assert.Equal(2, report.TotalInvoices);                         // hóa đơn đã trả không phải công nợ
        Assert.Equal(3_000_000m, report.TotalDebt);
        Assert.Equal(1_000_000m, report.OverdueDebt);
        Assert.Equal(1, report.OverdueInvoices);
        Assert.Equal(10, report.Rows.Single(r => r.InvoiceId == 1).DaysOverdue);
        Assert.Equal(0, report.Rows.Single(r => r.InvoiceId == 2).DaysOverdue);  // chưa tới hạn
    }

    [Fact]
    public async Task GetDebtReport_ResolvesTenantNameFromContractRepository()
    {
        var invoices = new List<Invoice>
        {
            Invoice(1, buildingId: 1, DateTime.UtcNow, 1_000_000m, InvoiceStatus.Unpaid, contractId: 77),
        };
        var contracts = new List<Contract>
        {
            new() { Id = 77, OwnerId = Owner, Tenant = new ApplicationUser { FullName = "Trần Văn B", PhoneNumber = "0905000111" } },
        };
        var service = BuildService(invoices: invoices, contracts: contracts);

        var report = await service.GetDebtReportAsync(Owner, null);

        var row = Assert.Single(report.Rows);
        Assert.Equal("Trần Văn B", row.TenantName);
        Assert.Equal("0905000111", row.TenantPhone);
    }

    // ==========================================
    // 5. LỌC THEO TÒA NHÀ
    // ==========================================
    [Fact]
    public async Task Reports_FilterByBuildingIdExcludeOtherBuildings()
    {
        var invoices = new List<Invoice>
        {
            Invoice(1, buildingId: 1, new DateTime(2026, 6, 3), 1_000_000m, InvoiceStatus.Paid),
            Invoice(2, buildingId: 2, new DateTime(2026, 6, 4), 7_000_000m, InvoiceStatus.Paid),
        };
        var buildings = new List<Building>
        {
            BuildingWith(1, "Nhà trọ A", RoomStatus.Occupied),
            BuildingWith(2, "Nhà trọ B", RoomStatus.Occupied),
        };
        var service = BuildService(invoices: invoices, buildings: buildings);

        var filter = Range(6, 2026, 6, 2026);
        filter.BuildingId = 1;

        var revenue = await service.GetRevenueReportAsync(Owner, filter);
        var occupancy = await service.GetOccupancyReportAsync(Owner, 1);

        Assert.Equal(1_000_000m, revenue.TotalInvoiced);
        Assert.Equal("Nhà trọ A", revenue.BuildingName);
        Assert.Equal(1, occupancy.TotalRooms);
    }

    // ==========================================
    // 6. CÁCH LY DỮ LIỆU GIỮA CÁC CHỦ TRỌ
    // ==========================================
    [Fact]
    public async Task Reports_AlwaysQueryWithSuppliedOwnerIdOnly()
    {
        var buildingRepo = new FakeBuildingRepository();
        var invoiceRepo = new FakeInvoiceRepository();
        var contractRepo = new FakeContractRepository();
        var service = new OwnerReportService(buildingRepo, invoiceRepo, contractRepo);

        await service.GetRevenueReportAsync(Owner, Range(6, 2026, 6, 2026));
        await service.GetOccupancyReportAsync(Owner, null);
        await service.GetDebtReportAsync(Owner, null);

        Assert.All(buildingRepo.RequestedOwnerIds, id => Assert.Equal(Owner, id));
        Assert.All(invoiceRepo.RequestedOwnerIds, id => Assert.Equal(Owner, id));
        Assert.All(contractRepo.RequestedOwnerIds, id => Assert.Equal(Owner, id));
        Assert.DoesNotContain(Intruder, invoiceRepo.RequestedOwnerIds);
    }

    // ==========================================
    // Dựng dữ liệu thử
    // ==========================================
    private static OwnerReportService BuildService(
        List<Invoice>? invoices = null,
        List<Building>? buildings = null,
        List<Contract>? contracts = null) =>
        new(
            new FakeBuildingRepository { Buildings = buildings ?? new List<Building>() },
            new FakeInvoiceRepository { Invoices = invoices ?? new List<Invoice>() },
            new FakeContractRepository { Contracts = contracts ?? new List<Contract>() });

    private static OwnerReportFilter Range(int fromMonth, int fromYear, int toMonth, int toYear) =>
        new() { FromMonth = fromMonth, FromYear = fromYear, ToMonth = toMonth, ToYear = toYear };

    private static Invoice Invoice(
        int id, int buildingId, DateTime invoiceDate, decimal amount, InvoiceStatus status,
        DateTime? dueDate = null, int contractId = 0) =>
        new()
        {
            Id = id,
            ContractId = contractId,
            InvoiceDate = invoiceDate,
            DueDate = dueDate ?? invoiceDate.AddDays(7),
            TotalAmount = amount,
            Status = status,
            Contract = new Contract
            {
                Id = contractId,
                OwnerId = Owner,
                Room = new Room
                {
                    Id = id,
                    RoomNumber = $"P{id:D3}",
                    Floor = new Floor
                    {
                        BuildingId = buildingId,
                        Building = new Building { Id = buildingId, Name = $"Nhà trọ {buildingId}" }
                    }
                }
            }
        };

    private static Building BuildingWith(int id, string name, params RoomStatus[] roomStatuses)
    {
        var floor = new Floor { Id = id, BuildingId = id };
        var roomId = id * 100;
        foreach (var status in roomStatuses)
            floor.Rooms.Add(new Room { Id = ++roomId, RoomNumber = $"P{roomId}", Status = status });

        return new Building
        {
            Id = id,
            Name = name,
            OwnerId = Owner,
            Address = "12 Nguyễn Văn Linh",
            Ward = "Hòa Thuận",
            District = "Hải Châu",
            City = "Đà Nẵng",
            Floors = new List<Floor> { floor }
        };
    }

    // ==========================================
    // Fake repository (dự án không dùng Moq)
    // ==========================================
    private sealed class FakeBuildingRepository : IBuildingRepository
    {
        public List<Building> Buildings { get; init; } = new();
        public List<string> RequestedOwnerIds { get; } = new();

        public Task<List<Building>> GetBuildingsByOwnerAsync(string ownerId)
        {
            RequestedOwnerIds.Add(ownerId);
            return Task.FromResult(Buildings.Where(b => b.OwnerId == ownerId).ToList());
        }

        public Task<Building?> GetByIdAsync(int id) => throw new NotSupportedException();
        public Task<Building?> GetByIdWithOwnerAsync(int id, string ownerId) => throw new NotSupportedException();
        public Task AddAsync(Building building) => throw new NotSupportedException();
        public Task UpdateAsync(Building building) => throw new NotSupportedException();
        public Task DeleteAsync(Building building) => throw new NotSupportedException();
    }

    private sealed class FakeInvoiceRepository : IInvoiceRepository
    {
        public List<Invoice> Invoices { get; init; } = new();
        public List<string> RequestedOwnerIds { get; } = new();

        public Task<List<Invoice>> GetInvoicesByOwnerAsync(string ownerId)
        {
            RequestedOwnerIds.Add(ownerId);
            return Task.FromResult(Invoices.Where(i => i.Contract?.OwnerId == ownerId).ToList());
        }

        public Task<Invoice?> GetByIdAsync(int id) => throw new NotSupportedException();
        public Task<List<Invoice>> GetUnpaidInvoicesByContractAsync(int contractId) => throw new NotSupportedException();
        public Task<List<Invoice>> GetInvoicesByTenantAsync(string tenantId) => throw new NotSupportedException();
        public Task<List<Invoice>> GetInvoicesByTenantEmailAsync(string email) => throw new NotSupportedException();
        public Task AddAsync(Invoice invoice) => throw new NotSupportedException();
        public Task UpdateAsync(Invoice invoice) => throw new NotSupportedException();
        public Task<List<Invoice>> GetInvoicesByBuildingAndMonthAsync(int buildingId, int month, int year, string ownerId) => throw new NotSupportedException();
    }

    private sealed class FakeContractRepository : IContractRepository
    {
        public List<Contract> Contracts { get; init; } = new();
        public List<string> RequestedOwnerIds { get; } = new();

        public Task<List<Contract>> GetContractsByOwnerAsync(string ownerId)
        {
            RequestedOwnerIds.Add(ownerId);
            return Task.FromResult(Contracts.Where(c => c.OwnerId == ownerId).ToList());
        }

        public Task<Contract?> GetByIdAsync(int id) => throw new NotSupportedException();
        public Task<Contract?> GetActiveContractByRoomIdAsync(int roomId) => throw new NotSupportedException();
        public Task<Contract?> GetContractWithRoomAndTenantAsync(int id) => throw new NotSupportedException();
        public Task<ApplicationUser?> GetTenantByContactAsync(string contact) => throw new NotSupportedException();
        public Task<Contract?> GetActiveContractByTenantIdAsync(string tenantId) => throw new NotSupportedException();
        public Task<bool> HasActiveOrPendingContractAsync(int roomId) => throw new NotSupportedException();
        public Task AddAsync(Contract contract) => throw new NotSupportedException();
        public Task UpdateAsync(Contract contract) => throw new NotSupportedException();
    }
}
