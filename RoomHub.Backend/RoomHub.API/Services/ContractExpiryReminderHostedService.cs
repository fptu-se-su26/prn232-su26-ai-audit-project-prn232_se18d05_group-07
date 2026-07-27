using Application.Common.Interfaces;

namespace RoomHub.API.Services;

/// <summary>
/// Chạy mỗi ngày một lần để nhắc hợp đồng sắp hết hạn.
/// Theo đúng cấu trúc của <see cref="DepositExpiryHostedService"/>.
///
/// ⚠️ Chỉ tạo thông báo — KHÔNG đổi trạng thái hợp đồng.
/// </summary>
public class ContractExpiryReminderHostedService(
    IServiceScopeFactory scopes,
    ILogger<ContractExpiryReminderHostedService> logger) : BackgroundService
{
    private static readonly TimeSpan Interval = TimeSpan.FromHours(24);

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var timer = new PeriodicTimer(Interval);
        do
        {
            try
            {
                using var scope = scopes.CreateScope();
                var count = await scope.ServiceProvider
                    .GetRequiredService<IContractReminderService>()
                    .SendExpiryRemindersAsync(stoppingToken);

                if (count > 0)
                    logger.LogInformation("Sent {Count} contract expiry reminders", count);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested) { break; }
            catch (Exception ex) { logger.LogError(ex, "Contract expiry reminder cycle failed"); }
        } while (await timer.WaitForNextTickAsync(stoppingToken));
    }
}
