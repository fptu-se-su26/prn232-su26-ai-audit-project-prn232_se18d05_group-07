using Application.Common.DTOs.Viewings;
using Domain.Enums;

namespace Application.Common.Interfaces;

public interface IViewingWorkflowService
{
    Task<ViewingBookingDto> CreateAsync(string tenantId, CreateViewingBookingRequest request, CancellationToken ct);
    Task<PagedResult<ViewingBookingDto>> TenantListAsync(string tenantId, int page, int pageSize, ViewingBookingStatus? status, CancellationToken ct);
    Task<ViewingBookingDto> TenantGetAsync(string tenantId, long id, CancellationToken ct);
    Task<ViewingBookingDto> TenantAcceptRescheduleAsync(string tenantId, long id, CancellationToken ct);
    Task<ViewingBookingDto> TenantCancelAsync(string tenantId, long id, string reason, CancellationToken ct);
    Task<DepositDto> PlaceDepositAsync(string tenantId, long bookingId, DepositRequest request, CancellationToken ct);
    Task<DepositDto> TenantDepositAsync(string tenantId, int id, CancellationToken ct);
    Task<PagedResult<ViewingBookingDto>> OwnerListAsync(string ownerId, int page, int pageSize, ViewingBookingStatus? status, CancellationToken ct);
    Task<ViewingBookingDto> OwnerTransitionAsync(string ownerId, long id, string action, RescheduleViewingRequest? reschedule, string? reason, CancellationToken ct);
    Task<DepositDto> OwnerDepositTransitionAsync(string ownerId, int id, string action, string? reason, CancellationToken ct);
    Task<int> ExpireDepositsAsync(CancellationToken ct);
}
