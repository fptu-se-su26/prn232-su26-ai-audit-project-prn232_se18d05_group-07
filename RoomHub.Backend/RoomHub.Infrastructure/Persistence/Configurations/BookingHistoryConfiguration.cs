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

            builder.HasOne(b => b.Room)
                .WithMany(r => r.BookingHistories)
                .HasForeignKey(b => b.RoomId)
                .OnDelete(DeleteBehavior.NoAction);

            builder.HasIndex(b => b.RoomId)
                .HasDatabaseName("IX_BookingHistories_RoomId");
        }
    }
}
