namespace Domain.Entities;

public sealed class DepositPaymentProof
{
    public long Id { get; set; }
    public string TenantId { get; set; } = null!;
    public string StorageUrl { get; set; } = null!;
    public string OriginalFileName { get; set; } = null!;
    public string ContentType { get; set; } = null!;
    public long FileSize { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime ExpiresAt { get; set; }
    public DateTime? UsedAt { get; set; }
    public int? DepositId { get; set; }

    public ApplicationUser Tenant { get; set; } = null!;
    public Deposit? Deposit { get; set; }
}
