using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations;

public sealed class DepositPaymentProofConfiguration : IEntityTypeConfiguration<DepositPaymentProof>
{
    public void Configure(EntityTypeBuilder<DepositPaymentProof> builder)
    {
        builder.ToTable("DepositPaymentProofs");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.StorageUrl).HasMaxLength(2048).IsRequired();
        builder.Property(x => x.OriginalFileName).HasMaxLength(255).IsRequired();
        builder.Property(x => x.ContentType).HasMaxLength(100).IsRequired();
        builder.Property(x => x.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
        builder.HasIndex(x => new { x.TenantId, x.CreatedAt });
        builder.HasIndex(x => x.DepositId).IsUnique().HasFilter("[DepositId] IS NOT NULL");
        builder.HasOne(x => x.Tenant).WithMany().HasForeignKey(x => x.TenantId).OnDelete(DeleteBehavior.NoAction);
        builder.HasOne(x => x.Deposit).WithOne(x => x.PaymentProof).HasForeignKey<DepositPaymentProof>(x => x.DepositId).OnDelete(DeleteBehavior.NoAction);
    }
}
