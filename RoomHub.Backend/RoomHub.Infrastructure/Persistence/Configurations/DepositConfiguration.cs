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
    public class DepositConfiguration : IEntityTypeConfiguration<Deposit>
    {
        public void Configure(EntityTypeBuilder<Deposit> builder)
        {
            builder.ToTable("Deposits");
            builder.HasKey(d => d.Id);

            builder.Property(d => d.Amount).HasColumnType("decimal(18,2)").IsRequired();
            builder.Property(d => d.PlacedAt).HasDefaultValueSql("GETUTCDATE()");
            builder.Property(d => d.Status)
                .HasConversion<string>()
                .HasColumnType("varchar(20)")
                .IsRequired();
            builder.Property(d => d.RefundAmount).HasColumnType("decimal(18,2)");

            builder.HasOne(d => d.Room)
                .WithMany(r => r.Deposits)
                .HasForeignKey(d => d.RoomId)
                .OnDelete(DeleteBehavior.NoAction);

            builder.HasOne(d => d.Tenant)
                .WithMany(u => u.Deposits)
                .HasForeignKey(d => d.TenantId)
                .OnDelete(DeleteBehavior.NoAction);
        }
    }
}
