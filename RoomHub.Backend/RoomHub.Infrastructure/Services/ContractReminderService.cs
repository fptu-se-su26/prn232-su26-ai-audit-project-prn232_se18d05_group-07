using Application.Common.Interfaces;
using Domain.Entities;
using Domain.Enums;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Services;

/// <summary>
/// Tạo thông báo cho hợp đồng sắp hết hạn ở các mốc 30 / 15 / 7 ngày.
///
/// ⚠️ Dịch vụ này CHỈ ĐỌC bảng Contract — không bao giờ ghi <c>Contract.Status</c>.
/// Xem <see cref="IContractReminderService"/> để biết lý do.
/// </summary>
public sealed class ContractReminderService(ApplicationDbContext db) : IContractReminderService
{
    /// <summary>
    /// Các mốc nhắc, sắp TĂNG DẦN. Thứ tự này quan trọng: khi chọn mốc phải lấy mốc chặt nhất
    /// mà hợp đồng đã chạm tới, nên phải duyệt từ gần tới xa (còn 7 ngày là mốc 7, không phải 30).
    /// </summary>
    private static readonly int[] Milestones = { 7, 15, 30 };

    public async Task<int> SendExpiryRemindersAsync(CancellationToken ct = default)
    {
        var today = DateTime.UtcNow.Date;
        var horizon = today.AddDays(Milestones.Max());

        // Chỉ hợp đồng đang hiệu lực và sắp tới hạn trong vòng 30 ngày.
        var contracts = await db.Contracts
            .AsNoTracking()
            .Include(c => c.Room)
            .Where(c => !c.IsDeleted
                     && c.Status == ContractStatus.Active
                     && c.EndDate >= today
                     && c.EndDate <= horizon)
            .ToListAsync(ct);

        if (contracts.Count == 0) return 0;

        var contractIds = contracts.Select(c => c.Id).ToList();
        var alreadySent = await db.ContractReminderLogs
            .AsNoTracking()
            .Where(l => contractIds.Contains(l.ContractId))
            .Select(l => new { l.ContractId, l.MilestoneDays })
            .ToListAsync(ct);

        var sentLookup = alreadySent
            .Select(x => (x.ContractId, x.MilestoneDays))
            .ToHashSet();

        var created = 0;

        foreach (var contract in contracts)
        {
            var daysLeft = (contract.EndDate.Date - today).Days;

            // Mốc chặt nhất mà hợp đồng đã chạm tới: còn 12 ngày → mốc 15, còn 7 ngày → mốc 7.
            var milestone = Milestones.FirstOrDefault(m => daysLeft <= m);
            if (milestone == 0) continue;
            if (sentLookup.Contains((contract.Id, milestone))) continue;

            var roomLabel = contract.Room?.RoomNumber is { } number ? $"phòng {number}" : "phòng thuê";
            var title = "Hợp đồng sắp hết hạn";
            var content = daysLeft == 0
                ? $"Hợp đồng {roomLabel} hết hạn hôm nay ({contract.EndDate:dd/MM/yyyy})."
                : $"Hợp đồng {roomLabel} sẽ hết hạn sau {daysLeft} ngày, vào {contract.EndDate:dd/MM/yyyy}.";

            AddNotification(contract.OwnerId, title, content, contract.Id);
            if (!string.IsNullOrEmpty(contract.TenantId))
                AddNotification(contract.TenantId, title, content, contract.Id);

            db.ContractReminderLogs.Add(new ContractReminderLog
            {
                ContractId = contract.Id,
                MilestoneDays = milestone,
                SentAt = DateTime.UtcNow
            });

            sentLookup.Add((contract.Id, milestone));
            created++;
        }

        if (created > 0)
        {
            try
            {
                await db.SaveChangesAsync(ct);
            }
            catch (DbUpdateException)
            {
                // Chỉ số duy nhất (ContractId, MilestoneDays) chặn gửi trùng khi có hai tiến trình
                // cùng chạy. Va chạm nghĩa là tiến trình kia đã nhắc rồi — bỏ qua, không phải lỗi.
                return 0;
            }
        }

        return created;
    }

    private void AddNotification(string userId, string title, string content, int contractId) =>
        db.Notifications.Add(new Notification
        {
            UserId = userId,
            Type = "ContractExpiring",
            Title = title,
            Content = content,
            LinkedId = contractId
        });
}
