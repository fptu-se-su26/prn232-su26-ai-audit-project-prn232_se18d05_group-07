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
    public class BookingHistoryConfiguration : IEntityTypeConfiguration<BookingHistory>
    {
        public void Configure(EntityTypeBuilder<BookingHistory> builder)
        {
            builder.ToTable("BookingHistories");
            builder.HasKey(b => b.Id);

            builder.Property(b => b.PriceAtBooking).HasColumnType("decimal(18,2)");

            builder.Property(b => b.TenantId).IsRequired();

            builder.HasOne(b => b.Room)
                .WithMany(r => r.BookingHistories)
                .HasForeignKey(b => b.RoomId)
                .OnDelete(DeleteBehavior.NoAction);

            builder.HasOne(b => b.Tenant)
                .WithMany()
                .HasForeignKey(b => b.TenantId)
                .OnDelete(DeleteBehavior.NoAction);

            builder.HasIndex(b => b.RoomId)
                .HasDatabaseName("IX_BookingHistories_RoomId");

            builder.HasIndex(b => b.TenantId)
                .HasDatabaseName("IX_BookingHistories_TenantId");
        }
    }
}
