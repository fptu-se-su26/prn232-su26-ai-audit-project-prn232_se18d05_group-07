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
    public class ServiceConfiguration : IEntityTypeConfiguration<Service>
    {
        public void Configure(EntityTypeBuilder<Service> builder)
        {
            builder.ToTable("Services");
            builder.HasKey(s => s.Id);

            builder.Property(s => s.Name).HasMaxLength(128).IsRequired();
            builder.Property(s => s.Description).HasMaxLength(512);
            builder.Property(s => s.BasePrice).HasColumnType("decimal(18,2)").IsRequired();
            builder.Property(s => s.CommissionRate).HasColumnType("decimal(5,2)").HasDefaultValue(0.10m);
        }
    }
}
