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
    public class NotificationConfiguration : IEntityTypeConfiguration<Notification>
    {
        public void Configure(EntityTypeBuilder<Notification> builder)
        {
            builder.ToTable("Notifications");
            builder.HasKey(n => n.Id);

            builder.Property(n => n.Type).HasMaxLength(50);
            builder.Property(n => n.Title).HasMaxLength(256);
            builder.Property(n => n.IsRead).HasDefaultValue(false);
            builder.Property(n => n.CreatedAt).HasDefaultValueSql("GETUTCDATE()");

            builder.HasOne(n => n.User)
                .WithMany(u => u.Notifications)
                .HasForeignKey(n => n.UserId)
                .OnDelete(DeleteBehavior.NoAction);

            builder.HasIndex(n => n.UserId)
                .HasDatabaseName("IX_Notifications_UserId");
        }
    }
}
