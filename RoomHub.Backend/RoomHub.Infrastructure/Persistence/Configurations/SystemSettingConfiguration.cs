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
    public class SystemSettingConfiguration : IEntityTypeConfiguration<SystemSetting>
    {
        public void Configure(EntityTypeBuilder<SystemSetting> builder)
        {
            builder.ToTable("SystemSettings");
            builder.HasKey(s => s.Id);

            builder.Property(s => s.Id).ValueGeneratedNever();
            builder.Property(s => s.DefaultHoldDurationDays).HasDefaultValue(3);
            builder.Property(s => s.DefaultDepositPercent).HasColumnType("decimal(5,2)").HasDefaultValue(50.00m);
            builder.Property(s => s.PlatformCommissionRate).HasColumnType("decimal(5,2)").HasDefaultValue(10.00m);
            builder.Property(s => s.MaxRoomsPerBuilding).HasDefaultValue(500);

            // Seed default settings row
            builder.HasData(new SystemSetting
            {
                Id = 1,
                DefaultHoldDurationDays = 3,
                DefaultDepositPercent = 50.00m,
                PlatformCommissionRate = 10.00m,
                MaxRoomsPerBuilding = 500
            });
        }
    }
}
