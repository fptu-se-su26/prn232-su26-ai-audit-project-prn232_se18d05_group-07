namespace Application.Common.DTOs.Admin
{
    public class AdminBuildingDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string District { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string Ward { get; set; } = string.Empty;
        public string OwnerId { get; set; } = string.Empty;
        public string OwnerName { get; set; } = string.Empty;
        public string OwnerEmail { get; set; } = string.Empty;
        public string OwnerPhone { get; set; } = string.Empty;
        public int TotalRooms { get; set; }
        public int OccupiedRooms { get; set; }
        public int VacantRooms { get; set; }
        public int MaintenanceRooms { get; set; }
        public decimal ElectricityPrice { get; set; }
        public decimal WaterPrice { get; set; }
        public string WaterBillingType { get; set; } = "PerCubicMeter";
        public decimal InternetPrice { get; set; }
        public decimal GarbagePrice { get; set; }
        public string ThumbnailUrl { get; set; } = string.Empty;
        public string CreatedAt { get; set; } = string.Empty;
    }
}
