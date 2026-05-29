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
    public class FloorConfiguration : IEntityTypeConfiguration<Floor>
    {
        public void Configure(EntityTypeBuilder<Floor> builder)
        {
            builder.ToTable("Floors");
            builder.HasKey(f => f.Id);

            builder.Property(f => f.Description).HasMaxLength(512);
            builder.Property(f => f.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            builder.Property(f => f.IsDeleted).HasDefaultValue(false);

            builder.HasOne(f => f.Building)
                .WithMany(b => b.Floors)
                .HasForeignKey(f => f.BuildingId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
