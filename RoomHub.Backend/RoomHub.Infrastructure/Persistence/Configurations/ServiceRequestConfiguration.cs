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
    public class ServiceRequestConfiguration : IEntityTypeConfiguration<ServiceRequest>
    {
        public void Configure(EntityTypeBuilder<ServiceRequest> builder)
        {
            builder.ToTable("ServiceRequests");
            builder.HasKey(sr => sr.Id);

            builder.Property(sr => sr.RequestDate).HasDefaultValueSql("GETUTCDATE()");
            builder.Property(sr => sr.Status).HasMaxLength(20).IsRequired();
            builder.Property(sr => sr.Amount).HasColumnType("decimal(18,2)");

            builder.HasOne(sr => sr.Service)
                .WithMany(s => s.ServiceRequests)
                .HasForeignKey(sr => sr.ServiceId)
                .OnDelete(DeleteBehavior.NoAction);

            builder.HasOne(sr => sr.Contract)
                .WithMany(c => c.ServiceRequests)
                .HasForeignKey(sr => sr.ContractId)
                .OnDelete(DeleteBehavior.NoAction);
        }
    }
}
