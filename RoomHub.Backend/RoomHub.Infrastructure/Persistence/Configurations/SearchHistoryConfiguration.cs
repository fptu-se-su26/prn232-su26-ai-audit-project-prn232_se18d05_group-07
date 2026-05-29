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
    public class SearchHistoryConfiguration : IEntityTypeConfiguration<SearchHistory>
    {
        public void Configure(EntityTypeBuilder<SearchHistory> builder)
        {
            builder.ToTable("SearchHistories");
            builder.HasKey(s => s.Id);

            builder.Property(s => s.Timestamp).HasDefaultValueSql("GETUTCDATE()");

            builder.HasOne(s => s.User)
                .WithMany(u => u.SearchHistories)
                .HasForeignKey(s => s.UserId)
                .OnDelete(DeleteBehavior.NoAction);

            builder.HasOne(s => s.ViewedRoom)
                .WithMany(r => r.SearchHistories)
                .HasForeignKey(s => s.ViewedRoomId)
                .OnDelete(DeleteBehavior.NoAction);

            builder.HasIndex(s => s.UserId)
                .HasDatabaseName("IX_SearchHistories_UserId");

            builder.HasIndex(s => s.ViewedRoomId)
                .HasDatabaseName("IX_SearchHistories_ViewedRoomId");
        }
    }
}
