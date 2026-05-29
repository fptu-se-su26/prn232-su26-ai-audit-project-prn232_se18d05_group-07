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
    public class RoomAmenityConfiguration : IEntityTypeConfiguration<RoomAmenity>
    {
        public void Configure(EntityTypeBuilder<RoomAmenity> builder)
        {
            builder.ToTable("RoomAmenities");
            builder.HasKey(ra => new { ra.RoomId, ra.AmenityId });

            builder.HasOne(ra => ra.Room)
                .WithMany(r => r.RoomAmenities)
                .HasForeignKey(ra => ra.RoomId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(ra => ra.Amenity)
                .WithMany(a => a.RoomAmenities)
                .HasForeignKey(ra => ra.AmenityId)
                .OnDelete(DeleteBehavior.NoAction);
        }
    }
}
