using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations;

public sealed class ContractReminderLogConfiguration : IEntityTypeConfiguration<ContractReminderLog>
{
    public void Configure(EntityTypeBuilder<ContractReminderLog> builder)
    {
        builder.ToTable("ContractReminderLogs");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.SentAt).HasDefaultValueSql("GETUTCDATE()");

        // Khoá chống gửi trùng: mỗi hợp đồng chỉ nhắc một lần cho mỗi mốc.
        builder.HasIndex(x => new { x.ContractId, x.MilestoneDays }).IsUnique();

        builder.HasOne(x => x.Contract)
            .WithMany()
            .HasForeignKey(x => x.ContractId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
