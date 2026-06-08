using System;
using System.Collections.Generic;

namespace Application.Common.DTOs.Listings
{
    public class AdminModerationListingDto
    {
        public int RoomId { get; set; }
        public string Title { get; set; } = "";
        public string Description { get; set; } = "";
        public decimal Price { get; set; }
        public decimal Area { get; set; }
        public string OwnerName { get; set; } = "";
        public string OwnerEmail { get; set; } = "";
        public string BuildingName { get; set; } = "";
        public string District { get; set; } = "";
        public List<string> ImageUrls { get; set; } = new();
        public string ModerationStatus { get; set; } = "Pending";
        public string? ModerationRemarks { get; set; }
        public int ListingScore { get; set; }
        public bool IsPublished { get; set; }
        public DateTime? ModeratedAt { get; set; }
        public DateTime SubmittedAt { get; set; }
    }

    public class AdminModerationStatsDto
    {
        public int FlaggedCount { get; set; }
        public int PendingCount { get; set; }
        public int ApprovedThisMonth { get; set; }
        public int RejectedThisMonth { get; set; }
    }

    public class AdminModerationActionRequest
    {
        public bool Publish { get; set; } = true;
        public string? Remarks { get; set; }
    }

    public class AdminModerationActionResult
    {
        public bool Success { get; set; }
        public string Message { get; set; } = "";
        public string ModerationStatus { get; set; } = "";
        public bool IsPublished { get; set; }
    }
}
