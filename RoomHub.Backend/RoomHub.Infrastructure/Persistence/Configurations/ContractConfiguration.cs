using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Persistence.Configurations
{
    public class ContractConfiguration : IEntityTypeConfiguration<Contract>
    {
        public void Configure(EntityTypeBuilder<Contract> builder)
        {
            builder.ToTable("Contracts");
            builder.HasKey(c => c.Id);

            builder.Property(c => c.StartDate).HasColumnType("date").IsRequired();
            builder.Property(c => c.EndDate).HasColumnType("date").IsRequired();
            builder.Property(c => c.RentAmount).HasColumnType("decimal(18,2)").IsRequired();
            builder.Property(c => c.DepositAmount).HasColumnType("decimal(18,2)").IsRequired();
            builder.Property(c => c.Status)
                .HasConversion<string>()
                .HasColumnType("varchar(20)")
                .IsRequired();
            builder.Property(c => c.SignaturePath).HasMaxLength(512);
            builder.Property(c => c.PenaltyAmount).HasColumnType("decimal(18,2)");
            builder.Property(c => c.RefundAmount).HasColumnType("decimal(18,2)");
            builder.Property(c => c.TemporaryTenantName).HasMaxLength(256);
            builder.Property(c => c.TemporaryTenantPhone).HasMaxLength(20);
            builder.Property(c => c.TemporaryTenantEmail).HasMaxLength(256);
            builder.Property(c => c.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            builder.Property(c => c.IsDeleted).HasDefaultValue(false);

            builder.HasOne(c => c.Room)
                .WithMany(r => r.Contracts)
                .HasForeignKey(c => c.RoomId)
                .OnDelete(DeleteBehavior.NoAction);

            builder.HasOne(c => c.Tenant)
                .WithMany(u => u.TenantContracts)
                .HasForeignKey(c => c.TenantId)
                .OnDelete(DeleteBehavior.NoAction);

            builder.HasOne(c => c.Owner)
                .WithMany(u => u.OwnerContracts)
                .HasForeignKey(c => c.OwnerId)
                .OnDelete(DeleteBehavior.NoAction);

            builder.HasIndex(c => new { c.StartDate, c.EndDate })
                .HasDatabaseName("IX_Contracts_Dates");
        }
    }
}
