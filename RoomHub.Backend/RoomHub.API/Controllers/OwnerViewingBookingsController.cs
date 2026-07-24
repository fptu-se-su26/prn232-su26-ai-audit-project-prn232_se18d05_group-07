using Application.Common.DTOs.Viewings;
using Application.Common.Interfaces;
using Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace RoomHub.API.Controllers;

[ApiController, Route("api/owner/viewing-bookings"), Authorize(Roles = "PropertyOwner")]
public class OwnerViewingBookingsController(IViewingWorkflowService service) : ViewingControllerBase
{
    [HttpGet] public Task<IActionResult> List(int page = 1, int pageSize = 20, ViewingBookingStatus? status = null, CancellationToken ct = default) => Run(async () => await service.OwnerListAsync(UserId, page, pageSize, status, ct));
    [HttpPut("{id:long}/approve")] public Task<IActionResult> Approve(long id, CancellationToken ct) => Transition(id, "approve", null, null, ct);
    [HttpPut("{id:long}/reschedule")] public Task<IActionResult> Reschedule(long id, RescheduleViewingRequest request, CancellationToken ct) => Transition(id, "reschedule", request, null, ct);
    [HttpPut("{id:long}/reject")] public Task<IActionResult> Reject(long id, ReasonRequest request, CancellationToken ct) => Transition(id, "reject", null, request.Reason, ct);
    [HttpPut("{id:long}/complete")] public Task<IActionResult> Complete(long id, CancellationToken ct) => Transition(id, "complete", null, null, ct);
    [HttpPut("{id:long}/no-show")] public Task<IActionResult> NoShow(long id, CancellationToken ct) => Transition(id, "no-show", null, null, ct);
    private Task<IActionResult> Transition(long id, string action, RescheduleViewingRequest? request, string? reason, CancellationToken ct) => Run(async () => await service.OwnerTransitionAsync(UserId, id, action, request, reason, ct));
}

[ApiController, Route("api/owner/deposits"), Authorize(Roles = "PropertyOwner")]
public class OwnerDepositsController(IViewingWorkflowService service) : ViewingControllerBase
{
    [HttpPut("{id:int}/confirm")] public Task<IActionResult> Confirm(int id, CancellationToken ct) => Change(id, "confirm", null, ct);
    [HttpPut("{id:int}/refund")] public Task<IActionResult> Refund(int id, ReasonRequest? request, CancellationToken ct) => Change(id, "refund", request?.Reason, ct);
    [HttpPut("{id:int}/forfeit")] public Task<IActionResult> Forfeit(int id, ReasonRequest request, CancellationToken ct) => Change(id, "forfeit", request.Reason, ct);
    private Task<IActionResult> Change(int id, string action, string? reason, CancellationToken ct) => Run(async () => await service.OwnerDepositTransitionAsync(UserId, id, action, reason, ct));
}
