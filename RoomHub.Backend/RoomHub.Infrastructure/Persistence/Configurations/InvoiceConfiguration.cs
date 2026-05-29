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
    public class InvoiceConfiguration : IEntityTypeConfiguration<Invoice>
    {
        public void Configure(EntityTypeBuilder<Invoice> builder)
        {
            builder.ToTable("Invoices");
            builder.HasKey(i => i.Id);

            builder.Property(i => i.InvoiceDate).HasColumnType("date").IsRequired();
            builder.Property(i => i.DueDate).HasColumnType("date").IsRequired();
            builder.Property(i => i.TotalAmount).HasColumnType("decimal(18,2)").IsRequired();
            builder.Property(i => i.Status)
                .HasConversion<string>()
                .HasColumnType("varchar(20)")
                .IsRequired();
            builder.Property(i => i.PaymentProofPath).HasMaxLength(512);
            builder.Property(i => i.CreatedAt).HasDefaultValueSql("GETUTCDATE()");

            builder.HasOne(i => i.Contract)
                .WithMany(c => c.Invoices)
                .HasForeignKey(i => i.ContractId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasIndex(i => new { i.DueDate, i.Status })
                .HasDatabaseName("IX_Invoices_DueDate_Status");
        }
    }
}
