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
    public class AuditLogConfiguration : IEntityTypeConfiguration<AuditLog>
    {
        public void Configure(EntityTypeBuilder<AuditLog> builder)
        {
            builder.ToTable("AuditLogs");
            builder.HasKey(a => a.Id);

            builder.Property(a => a.Action).HasMaxLength(100);
            builder.Property(a => a.EntityType).HasMaxLength(50);
            builder.Property(a => a.IpAddress).HasMaxLength(45);
            builder.Property(a => a.CreatedAt).HasDefaultValueSql("GETUTCDATE()");

            builder.HasOne(a => a.User)
                .WithMany(u => u.AuditLogs)
                .HasForeignKey(a => a.UserId)
                .OnDelete(DeleteBehavior.NoAction);

            builder.HasIndex(a => a.UserId)
                .HasDatabaseName("IX_AuditLogs_UserId");
        }
    }
}
