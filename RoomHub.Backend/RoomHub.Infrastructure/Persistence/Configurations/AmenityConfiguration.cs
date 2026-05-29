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
    public class AmenityConfiguration : IEntityTypeConfiguration<Amenity>
    {
        public void Configure(EntityTypeBuilder<Amenity> builder)
        {
            builder.ToTable("Amenities");
            builder.HasKey(a => a.Id);

            builder.Property(a => a.Name).HasMaxLength(128).IsRequired();
            builder.Property(a => a.IconUrl).HasMaxLength(256);
            builder.HasIndex(a => a.Name).IsUnique();

            // Seed data
            builder.HasData(
                new Amenity { Id = 1, Name = "Air Conditioning" },
                new Amenity { Id = 2, Name = "WiFi" },
                new Amenity { Id = 3, Name = "Refrigerator" },
                new Amenity { Id = 4, Name = "Washing Machine" },
                new Amenity { Id = 5, Name = "Kitchen" },
                new Amenity { Id = 6, Name = "Parking" }
            );
        }
    }
}
