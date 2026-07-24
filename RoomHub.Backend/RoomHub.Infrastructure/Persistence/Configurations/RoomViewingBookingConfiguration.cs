using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations;

public class RoomViewingBookingConfiguration : IEntityTypeConfiguration<RoomViewingBooking>
{
    public void Configure(EntityTypeBuilder<RoomViewingBooking> builder)
    {
        builder.ToTable("RoomViewingBookings");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Status).HasConversion<string>().HasMaxLength(20);
        builder.Property(x => x.TenantNote).HasMaxLength(1000);
        builder.Property(x => x.OwnerNote).HasMaxLength(1000);
        builder.Property(x => x.RejectReason).HasMaxLength(1000);
        builder.Property(x => x.RowVersion).IsRowVersion();
        builder.HasIndex(x => new { x.RoomId, x.ScheduledStartAt, x.ScheduledEndAt, x.Status });
        builder.HasIndex(x => new { x.TenantId, x.Status });
        builder.HasOne(x => x.Room).WithMany(x => x.ViewingBookings).HasForeignKey(x => x.RoomId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.Tenant).WithMany().HasForeignKey(x => x.TenantId).OnDelete(DeleteBehavior.Restrict);
    }
}
