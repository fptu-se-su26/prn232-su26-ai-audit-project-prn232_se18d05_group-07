using System.Collections.Generic;

namespace Application.Common.DTOs.Listings
{
    public class PublicListingFilterRequest
    {
        public string? District { get; set; }
        public decimal? MinPrice { get; set; }
        public decimal? MaxPrice { get; set; }
        public decimal? MinArea { get; set; }
        public decimal? MaxArea { get; set; }
        public string? RoomType { get; set; }
        public string? SearchQuery { get; set; }
        public string? Amenities { get; set; }
        public string? SortBy { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 12;
    }

    public class PublicListingSummaryDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = null!;
        public string Description { get; set; } = "";
        public string Type { get; set; } = null!;
        public string Location { get; set; } = null!;
        public string District { get; set; } = null!;
        public double Price { get; set; }
        public double Area { get; set; }
        public int MaxPeople { get; set; }
        public string Image { get; set; } = null!;
        public List<string> Amenities { get; set; } = new();
        public bool IsNew { get; set; }
    }

    public class PublicListingPageDto
    {
        public List<PublicListingSummaryDto> Items { get; set; } = new();
        public int Total { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
    }

    public class PublicListingDetailDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = null!;
        public string Description { get; set; } = "";
        public string Type { get; set; } = null!;
        public string Location { get; set; } = null!;
        public string District { get; set; } = null!;
        public double Price { get; set; }
        public double Area { get; set; }
        public int MaxPeople { get; set; }
        public string Image { get; set; } = null!;
        public List<string> ImageUrls { get; set; } = new();
        public List<string> Amenities { get; set; } = new();
        public double ElectricityPrice { get; set; }
        public double WaterPrice { get; set; }
        public double InternetPrice { get; set; }
        public double GarbagePrice { get; set; }
        public string OwnerId { get; set; } = null!;
        public string LandlordName { get; set; } = null!;
        public string LandlordPhone { get; set; } = null!;
        public string LandlordAvatar { get; set; } = null!;
        public int ListingScore { get; set; }
        public string? ModerationRemarks { get; set; }
    }
}
