using Application.Common.DTOs.Viewings;

namespace Application.Common.Interfaces;

public interface IDepositPaymentProofService
{
    Task<DepositPaymentProofDto> UploadAsync(
        string tenantId,
        Stream stream,
        string originalFileName,
        string contentType,
        long fileSize,
        string localBaseUrl,
        CancellationToken cancellationToken);
}
