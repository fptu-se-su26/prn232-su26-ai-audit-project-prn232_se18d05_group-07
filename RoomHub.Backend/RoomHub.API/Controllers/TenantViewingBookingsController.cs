using Application.Common.DTOs.Viewings;
using Application.Common.Interfaces;
using Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace RoomHub.API.Controllers;

[ApiController, Route("api/tenant/viewing-bookings"), Authorize(Roles = "Tenant")]
public class TenantViewingBookingsController(IViewingWorkflowService service) : ViewingControllerBase
{
    [HttpPost] public Task<IActionResult> Create(CreateViewingBookingRequest request, CancellationToken ct) => Run(async () => await service.CreateAsync(UserId, request, ct), 201);
    [HttpGet] public Task<IActionResult> List(int page = 1, int pageSize = 10, ViewingBookingStatus? status = null, CancellationToken ct = default) => Run(async () => await service.TenantListAsync(UserId, page, pageSize, status, ct));
    [HttpGet("{id:long}")] public Task<IActionResult> Get(long id, CancellationToken ct) => Run(async () => await service.TenantGetAsync(UserId, id, ct));
    [HttpPut("{id:long}/accept-reschedule")] public Task<IActionResult> Accept(long id, CancellationToken ct) => Run(async () => await service.TenantAcceptRescheduleAsync(UserId, id, ct));
    [HttpPut("{id:long}/cancel")] public Task<IActionResult> Cancel(long id, ReasonRequest request, CancellationToken ct) => Run(async () => await service.TenantCancelAsync(UserId, id, request.Reason, ct));
    [HttpPost("{id:long}/deposit")] public Task<IActionResult> Deposit(long id, DepositRequest request, CancellationToken ct) => Run(async () => await service.PlaceDepositAsync(UserId, id, request, ct), 201);
}

[ApiController, Route("api/tenant/deposits"), Authorize(Roles = "Tenant")]
public class TenantDepositsController(
    IViewingWorkflowService service,
    IDepositPaymentProofService proofService) : ViewingControllerBase
{
    [HttpGet("{id:int}")] public Task<IActionResult> Get(int id, CancellationToken ct) => Run(async () => await service.TenantDepositAsync(UserId, id, ct));

    [HttpPost("proofs")]
    [RequestSizeLimit(6 * 1024 * 1024)]
    public async Task<IActionResult> UploadProof(IFormFile file, CancellationToken ct)
    {
        if (file is null || file.Length == 0)
            return BadRequest(new { success = false, message = "Vui lòng chọn ảnh minh chứng thanh toán.", errors = new { } });

        try
        {
            await using var stream = file.OpenReadStream();
            var result = await proofService.UploadAsync(
                UserId,
                stream,
                file.FileName,
                file.ContentType,
                file.Length,
                $"{Request.Scheme}://{Request.Host}",
                ct);
            return StatusCode(201, new { success = true, data = result });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { success = false, message = ex.Message, errors = new { } });
        }
    }
}
