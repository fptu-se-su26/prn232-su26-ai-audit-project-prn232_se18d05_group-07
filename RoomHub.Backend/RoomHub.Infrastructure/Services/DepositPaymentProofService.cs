using Application.Common.DTOs.Viewings;
using Application.Common.Interfaces;
using Domain.Entities;
using Infrastructure.Persistence;

namespace Infrastructure.Services;

public sealed class DepositPaymentProofService(
    ApplicationDbContext db,
    IFileUploadService fileUploadService) : IDepositPaymentProofService
{
    private const long MaxFileSize = 5 * 1024 * 1024;

    public async Task<DepositPaymentProofDto> UploadAsync(
        string tenantId,
        Stream stream,
        string originalFileName,
        string contentType,
        long fileSize,
        string localBaseUrl,
        CancellationToken cancellationToken)
    {
        if (fileSize is <= 0 or > MaxFileSize)
            throw new ArgumentException("Minh chứng thanh toán phải có dung lượng từ 1 byte đến 5 MB.");
        if (string.IsNullOrWhiteSpace(originalFileName) || originalFileName.Length > 255)
            throw new ArgumentException("Tên tập tin minh chứng không hợp lệ.");

        var url = await fileUploadService.UploadImageAsync(
            stream,
            originalFileName,
            "deposit_proofs",
            localBaseUrl);

        var now = DateTime.UtcNow;
        var proof = new DepositPaymentProof
        {
            TenantId = tenantId,
            StorageUrl = url,
            OriginalFileName = Path.GetFileName(originalFileName),
            ContentType = contentType?.Trim() ?? "application/octet-stream",
            FileSize = fileSize,
            CreatedAt = now,
            ExpiresAt = now.AddHours(24)
        };
        db.DepositPaymentProofs.Add(proof);
        await db.SaveChangesAsync(cancellationToken);
        return new DepositPaymentProofDto(proof.Id, proof.OriginalFileName, proof.ExpiresAt);
    }
}
