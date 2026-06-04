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
        public string BuildingName { get; set; } = null!;
        public string RoomNumber { get; set; } = null!;
        public int Views { get; set; }
        public string CreatedDate { get; set; } = null!;
        public string Type { get; set; } = "Phòng trọ";
        public List<string> ImageUrls { get; set; } = new();
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
}
