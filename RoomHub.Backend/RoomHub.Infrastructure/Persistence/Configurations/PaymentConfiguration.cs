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
    public class PaymentConfiguration : IEntityTypeConfiguration<Payment>
    {
        public void Configure(EntityTypeBuilder<Payment> builder)
        {
            builder.ToTable("Payments");
            builder.HasKey(p => p.Id);

            builder.Property(p => p.Amount).HasColumnType("decimal(18,2)").IsRequired();
            builder.Property(p => p.PaymentMethod).HasMaxLength(50);
            builder.Property(p => p.TransactionId).HasMaxLength(100);
            builder.Property(p => p.Status).HasMaxLength(20).IsRequired();
            builder.Property(p => p.ProofPath).HasMaxLength(512);

            builder.HasOne(p => p.Invoice)
                .WithMany(i => i.Payments)
                .HasForeignKey(p => p.InvoiceId)
                .OnDelete(DeleteBehavior.NoAction);
        }
    }
}
