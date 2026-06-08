using System;
using System.Collections.Generic;

namespace Application.Common.DTOs.Listings
{
    public class ListingDto
    {
        public int RoomId { get; set; }
        public string Title { get; set; } = null!;
        public string Description { get; set; } = "";
        public decimal Price { get; set; }
        public decimal Area { get; set; }
        public int Capacity { get; set; }
        public bool IsPublished { get; set; }
        public bool IsHidden { get; set; }
        public string BuildingName { get; set; } = null!;
        public string RoomNumber { get; set; } = null!;
        public int Views { get; set; }
        public string CreatedDate { get; set; } = null!;
        public string Type { get; set; } = "Phòng trọ";
        public List<string> ImageUrls { get; set; } = new();
        
        // AI moderation details
        public string ModerationStatus { get; set; } = "Approved";
        public string? ModerationRemarks { get; set; }
        public int ListingScore { get; set; } = 100;
        public string? AIFormattedDescription { get; set; }
    }

    public class UpdateListingRequest
    {
        public string Title { get; set; } = null!;
        public string Description { get; set; } = null!;
        public decimal Price { get; set; }
        public decimal Area { get; set; }
        public int Capacity { get; set; }
        public bool IsPublished { get; set; }
        public List<string> ImageUrls { get; set; } = new();
    }

    public class ValidateContentRequest
    {
        public string Title { get; set; } = null!;
        public string Description { get; set; } = null!;
        public decimal Price { get; set; }
        public decimal Area { get; set; }
    }

    public class StepValidationResult
    {
        public bool IsValid { get; set; }
        public string Message { get; set; } = "";
        public string? Field { get; set; }
        public int? ListingScore { get; set; }
        public bool AiSkipped { get; set; }
    }

    public class DuplicateListingRequest
    {
        public int? TargetRoomId { get; set; }
    }

    public class DuplicateListingResult
    {
        public bool Success { get; set; }
        public string Message { get; set; } = "";
        public ListingDto? Listing { get; set; }
    }

    public class ListingUpdateResult
    {
        public bool Success { get; set; }
        public string ModerationStatus { get; set; } = "Pending";
        public string? ModerationRemarks { get; set; }
        public int ListingScore { get; set; }
        public bool IsPublished { get; set; }
        public string Message { get; set; } = "";
    }
}
