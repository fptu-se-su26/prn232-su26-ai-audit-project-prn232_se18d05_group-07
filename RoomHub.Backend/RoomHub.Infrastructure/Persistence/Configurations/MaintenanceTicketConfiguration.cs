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
    public class MaintenanceTicketConfiguration : IEntityTypeConfiguration<MaintenanceTicket>
    {
        public void Configure(EntityTypeBuilder<MaintenanceTicket> builder)
        {
            builder.ToTable("MaintenanceTickets");
            builder.HasKey(m => m.Id);

            builder.Property(m => m.Title).HasMaxLength(256).IsRequired();
            builder.Property(m => m.Status)
                .HasConversion<string>()
                .HasColumnType("varchar(20)")
                .IsRequired();
            builder.Property(m => m.Sentiment)
                .HasConversion<string>()
                .HasColumnType("varchar(20)");
            builder.Property(m => m.CreatedAt).HasDefaultValueSql("GETUTCDATE()");

            builder.HasOne(m => m.Room)
                .WithMany(r => r.MaintenanceTickets)
                .HasForeignKey(m => m.RoomId)
                .OnDelete(DeleteBehavior.NoAction);

            builder.HasOne(m => m.Tenant)
                .WithMany(u => u.MaintenanceTickets)
                .HasForeignKey(m => m.TenantId)
                .OnDelete(DeleteBehavior.NoAction);

            builder.HasOne(m => m.AssignedUser)
                .WithMany(u => u.AssignedTickets)
                .HasForeignKey(m => m.AssignedTo)
                .OnDelete(DeleteBehavior.NoAction);

            builder.HasIndex(m => m.AssignedTo)
                .HasDatabaseName("IX_MaintenanceTickets_AssignedTo");
        }
    }
}
