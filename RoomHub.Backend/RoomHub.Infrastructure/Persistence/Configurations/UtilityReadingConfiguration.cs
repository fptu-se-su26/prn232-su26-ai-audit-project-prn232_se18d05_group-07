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
    public class UtilityReadingConfiguration : IEntityTypeConfiguration<UtilityReading>
    {
        public void Configure(EntityTypeBuilder<UtilityReading> builder)
        {
            builder.ToTable("UtilityReadings");
            builder.HasKey(u => u.Id);

            builder.Property(u => u.ReadingDate).HasColumnType("date").IsRequired();
            builder.Property(u => u.UtilityType)
                .HasConversion<string>()
                .HasColumnType("varchar(20)")
                .IsRequired();
            builder.Property(u => u.OldIndex).HasColumnType("decimal(12,2)");
            builder.Property(u => u.NewIndex).HasColumnType("decimal(12,2)");
            builder.Property(u => u.Usage).HasColumnType("decimal(12,2)");
            builder.Property(u => u.Amount).HasColumnType("decimal(18,2)");

            builder.HasOne(u => u.Contract)
                .WithMany(c => c.UtilityReadings)
                .HasForeignKey(u => u.ContractId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
