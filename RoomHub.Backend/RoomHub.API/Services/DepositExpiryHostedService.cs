using Application.Common.Interfaces;

namespace RoomHub.API.Services;

public class DepositExpiryHostedService(IServiceScopeFactory scopes, ILogger<DepositExpiryHostedService> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var timer = new PeriodicTimer(TimeSpan.FromMinutes(5));
        do
        {
            try { using var scope = scopes.CreateScope(); var count = await scope.ServiceProvider.GetRequiredService<IViewingWorkflowService>().ExpireDepositsAsync(stoppingToken); if (count > 0) logger.LogInformation("Expired {Count} room deposits", count); }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested) { break; }
            catch (Exception ex) { logger.LogError(ex, "Deposit expiry cycle failed"); }
        } while (await timer.WaitForNextTickAsync(stoppingToken));
    }
}
