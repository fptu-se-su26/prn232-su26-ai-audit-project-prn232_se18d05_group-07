using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations;

public sealed class ReviewRevisionConfiguration : IEntityTypeConfiguration<ReviewRevision>
{
    public void Configure(EntityTypeBuilder<ReviewRevision> builder)
    {
        builder.ToTable("ReviewRevisions");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.PreviousComment).HasMaxLength(1000);
        builder.Property(x => x.NewComment).HasMaxLength(1000);
        builder.Property(x => x.PreviousModerationStatus).HasConversion<string>().HasMaxLength(20);
        builder.Property(x => x.NewModerationStatus).HasConversion<string>().HasMaxLength(20);
        builder.Property(x => x.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
        builder.HasIndex(x => new { x.ReviewId, x.CreatedAt });
        builder.HasOne(x => x.Review).WithMany(x => x.Revisions).HasForeignKey(x => x.ReviewId).OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(x => x.EditedByUser).WithMany().HasForeignKey(x => x.EditedByUserId).OnDelete(DeleteBehavior.NoAction);
    }
}
