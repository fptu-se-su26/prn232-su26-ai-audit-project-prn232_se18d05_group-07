namespace Domain.Entities;

public sealed class ReviewRevision
{
    public long Id { get; set; }
    public int ReviewId { get; set; }
    public string EditedByUserId { get; set; } = null!;
    public byte? PreviousRating { get; set; }
    public string? PreviousComment { get; set; }
    public Domain.Enums.ReviewModerationStatus PreviousModerationStatus { get; set; }
    public byte? NewRating { get; set; }
    public string? NewComment { get; set; }
    public Domain.Enums.ReviewModerationStatus NewModerationStatus { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Review Review { get; set; } = null!;
    public ApplicationUser EditedByUser { get; set; } = null!;
}
