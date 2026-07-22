using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations
{
    public class ReviewViolationConfiguration : IEntityTypeConfiguration<ReviewViolation>
    {
        public void Configure(EntityTypeBuilder<ReviewViolation> builder)
        {
            builder.HasKey(v => v.Id);
            builder.Property(v => v.Content).IsRequired().HasMaxLength(1000);
            builder.Property(v => v.ReasonCode).IsRequired().HasMaxLength(50);
            builder.Property(v => v.Description).HasMaxLength(1000);
            builder.Property(v => v.AdminNote).HasMaxLength(1000);
            builder.Property(v => v.Status).HasConversion<string>().HasMaxLength(20);
            builder.Property(v => v.CreatedAt).HasDefaultValueSql("GETUTCDATE()");

            builder.HasOne(v => v.User)
                .WithMany()
                .HasForeignKey(v => v.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            builder.HasOne(v => v.Review).WithMany(r => r.Reports).HasForeignKey(v => v.ReviewId).OnDelete(DeleteBehavior.NoAction);
            builder.HasIndex(v => new { v.ReviewId, v.ReporterId, v.Status });
        }
    }
}
