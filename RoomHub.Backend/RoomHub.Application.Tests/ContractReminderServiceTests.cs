using Domain.Entities;
using Domain.Enums;
using Infrastructure.Persistence;
using Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace RoomHub.Application.Tests;

/// <summary>
/// Kiểm thử việc nhắc hợp đồng sắp hết hạn.
///
/// Test quan trọng nhất ở đây là <see cref="SendExpiryReminders_NeverMutatesContractStatus"/>:
/// nó chứng minh dịch vụ KHÔNG ghi Contract.Status. Nếu ai đó sau này thêm việc tự động
/// chuyển hợp đồng sang Expired, test này phải đỏ — vì ContractStatus.Active đang được lọc ở
/// khoảng 12 nơi (quyền chat, quyền gửi yêu cầu dịch vụ, quyền đánh giá).
/// </summary>
public sealed class ContractReminderServiceTests
{
    private const string Owner = "owner-a";
    private const string Tenant = "tenant-a";

    // ==========================================
    // 1. TEST CHỐNG HỒI QUY — BẮT BUỘC GIỮ
    // ==========================================
    [Fact]
    public async Task SendExpiryReminders_NeverMutatesContractStatus()
    {
        await using var db = NewContext();
        db.Contracts.Add(ActiveContract(1, endsInDays: 7));
        db.Contracts.Add(ActiveContract(2, endsInDays: 30));
        db.Contracts.Add(ActiveContract(3, endsInDays: 0));
        await db.SaveChangesAsync();

        await new ContractReminderService(db).SendExpiryRemindersAsync();

        var statuses = await db.Contracts.AsNoTracking().Select(c => c.Status).ToListAsync();
        Assert.All(statuses, status => Assert.Equal(ContractStatus.Active, status));
        Assert.DoesNotContain(ContractStatus.Expired, statuses);
        Assert.DoesNotContain(ContractStatus.Renewed, statuses);
    }

    // ==========================================
    // 2. ĐÚNG MỐC NHẮC
    // ==========================================
    [Theory]
    [InlineData(30, 30)]
    [InlineData(22, 30)]   // còn 22 ngày → rơi vào mốc 30
    [InlineData(15, 15)]
    [InlineData(9, 15)]
    [InlineData(7, 7)]
    [InlineData(0, 7)]     // hết hạn hôm nay
    public async Task SendExpiryReminders_MapsDaysLeftToTheCorrectMilestone(int daysLeft, int expectedMilestone)
    {
        await using var db = NewContext();
        db.Contracts.Add(ActiveContract(1, endsInDays: daysLeft));
        await db.SaveChangesAsync();

        var sent = await new ContractReminderService(db).SendExpiryRemindersAsync();

        Assert.Equal(1, sent);
        var log = await db.ContractReminderLogs.AsNoTracking().SingleAsync();
        Assert.Equal(expectedMilestone, log.MilestoneDays);
    }

    [Fact]
    public async Task SendExpiryReminders_IgnoresContractsOutsideTheReminderWindow()
    {
        await using var db = NewContext();
        db.Contracts.Add(ActiveContract(1, endsInDays: 60));    // còn quá xa
        db.Contracts.Add(ActiveContract(2, endsInDays: -5));    // đã quá hạn
        await db.SaveChangesAsync();

        var sent = await new ContractReminderService(db).SendExpiryRemindersAsync();

        Assert.Equal(0, sent);
        Assert.Empty(await db.Notifications.ToListAsync());
    }

    [Fact]
    public async Task SendExpiryReminders_SkipsContractsThatAreNotActive()
    {
        await using var db = NewContext();
        var pending = ActiveContract(1, endsInDays: 7);
        pending.Status = ContractStatus.Pending;
        var terminated = ActiveContract(2, endsInDays: 7);
        terminated.Status = ContractStatus.Terminated;
        var deleted = ActiveContract(3, endsInDays: 7);
        deleted.IsDeleted = true;
        db.Contracts.AddRange(pending, terminated, deleted);
        await db.SaveChangesAsync();

        Assert.Equal(0, await new ContractReminderService(db).SendExpiryRemindersAsync());
    }

    // ==========================================
    // 3. KHÔNG GỬI TRÙNG
    // ==========================================
    [Fact]
    public async Task SendExpiryReminders_RunningTwiceDoesNotDuplicateTheSameMilestone()
    {
        await using var db = NewContext();
        db.Contracts.Add(ActiveContract(1, endsInDays: 7));
        await db.SaveChangesAsync();
        var service = new ContractReminderService(db);

        var first = await service.SendExpiryRemindersAsync();
        var second = await service.SendExpiryRemindersAsync();

        Assert.Equal(1, first);
        Assert.Equal(0, second);
        Assert.Single(await db.ContractReminderLogs.ToListAsync());
        Assert.Equal(2, await db.Notifications.CountAsync());   // một cho chủ trọ, một cho người thuê
    }

    [Fact]
    public async Task SendExpiryReminders_StillFiresTheNextMilestoneAsTheDeadlineApproaches()
    {
        await using var db = NewContext();
        db.Contracts.Add(ActiveContract(1, endsInDays: 7));
        db.ContractReminderLogs.Add(new ContractReminderLog { ContractId = 1, MilestoneDays = 30 });
        await db.SaveChangesAsync();

        var sent = await new ContractReminderService(db).SendExpiryRemindersAsync();

        Assert.Equal(1, sent);
        var milestones = await db.ContractReminderLogs.AsNoTracking()
            .Select(l => l.MilestoneDays).OrderBy(m => m).ToListAsync();
        Assert.Equal(new[] { 7, 30 }, milestones);
    }

    // ==========================================
    // 4. NGƯỜI NHẬN THÔNG BÁO
    // ==========================================
    [Fact]
    public async Task SendExpiryReminders_NotifiesBothPartiesAndLinksTheContract()
    {
        await using var db = NewContext();
        db.Contracts.Add(ActiveContract(1, endsInDays: 15));
        await db.SaveChangesAsync();

        await new ContractReminderService(db).SendExpiryRemindersAsync();

        var notifications = await db.Notifications.AsNoTracking().ToListAsync();
        Assert.Equal(2, notifications.Count);
        Assert.Contains(notifications, n => n.UserId == Owner);
        Assert.Contains(notifications, n => n.UserId == Tenant);
        Assert.All(notifications, n =>
        {
            Assert.Equal("ContractExpiring", n.Type);
            Assert.Equal(1, n.LinkedId);
        });
    }

    [Fact]
    public async Task SendExpiryReminders_ContractWithoutTenantAccountOnlyNotifiesTheOwner()
    {
        await using var db = NewContext();
        var contract = ActiveContract(1, endsInDays: 7);
        contract.TenantId = null;                       // khách thuê nhập tay, chưa có tài khoản
        contract.TemporaryTenantName = "Nguyễn Văn A";
        db.Contracts.Add(contract);
        await db.SaveChangesAsync();

        await new ContractReminderService(db).SendExpiryRemindersAsync();

        var notification = Assert.Single(await db.Notifications.AsNoTracking().ToListAsync());
        Assert.Equal(Owner, notification.UserId);
    }

    // ==========================================
    // Dựng dữ liệu thử
    // ==========================================
    private static ApplicationDbContext NewContext() =>
        new(new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase($"contract-reminders-{Guid.NewGuid()}")
            .Options);

    private static Contract ActiveContract(int id, int endsInDays) => new()
    {
        Id = id,
        RoomId = id,
        OwnerId = Owner,
        TenantId = Tenant,
        Status = ContractStatus.Active,
        StartDate = DateTime.UtcNow.Date.AddMonths(-6),
        EndDate = DateTime.UtcNow.Date.AddDays(endsInDays),
        RentAmount = 3_000_000m,
        DepositAmount = 3_000_000m,
        Room = new Room
        {
            Id = id,
            RoomNumber = $"P{id:D3}",
            Title = $"Phòng {id}",
            LandlordId = Owner
        }
    };
}
