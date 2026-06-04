using System;
using System.Collections.Generic;

namespace Application.Common.DTOs.Properties
{
    public class PropertyDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public string Type { get; set; } = null!;
        public string Address { get; set; } = null!;
        public string District { get; set; } = null!;
        public int Floors { get; set; }
        public int RoomsPerFloor { get; set; }
        public int TotalRooms { get; set; }
        public int OccupiedRooms { get; set; }
        public decimal BasePrice { get; set; }
        public decimal ElectricityPrice { get; set; }
        public decimal WaterPrice { get; set; }
        public decimal InternetPrice { get; set; }
        public decimal GarbagePrice { get; set; }
        public decimal ParkingPrice { get; set; }
        public decimal ServicePrice { get; set; }
        public string Image { get; set; } = null!;
        public string Status { get; set; } = null!;
    }

    public class RoomUnitDto
    {
        public string Id { get; set; } = null!;
        public string RoomNumber { get; set; } = null!;
        public int Floor { get; set; }
        public string Type { get; set; } = null!;
        public decimal Area { get; set; }
        public decimal Price { get; set; }
        public string Status { get; set; } = null!;
        public string? TenantName { get; set; }
        public string? TenantPhone { get; set; }
        public string? TenantStartDate { get; set; }
        public decimal Deposit { get; set; }
        public string OutstandingBillStatus { get; set; } = null!;
        public decimal OutstandingBillAmount { get; set; }
        public decimal OldElectricity { get; set; }
        public decimal OldWater { get; set; }
        public decimal ElectricityPrice { get; set; }
        public decimal WaterPrice { get; set; }
        public decimal InternetPrice { get; set; }
        public decimal GarbagePrice { get; set; }
    }

    public class PropertyDetailDto
    {
        public PropertyDto Property { get; set; } = null!;
        public List<RoomUnitDto> Rooms { get; set; } = new();
    }

    public class CustomRoomDto
    {
        public string RoomNumber { get; set; } = null!;
        public int FloorNumber { get; set; }
        public decimal? BasePrice { get; set; }
        public decimal? SurfaceArea { get; set; }
        public int? MaxCapacity { get; set; }
    }

    public class CreatePropertyRequestDto
    {
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public string Address { get; set; } = null!;
        public string? District { get; set; }
        public string? Ward { get; set; }
        public string? ImageUrl { get; set; }
        public string SelectedType { get; set; } = "building"; // building, studio, mini-apartment, independent
        public decimal BasePrice { get; set; } = 2500000;
        public decimal DefaultArea { get; set; } = 25;
        public int MaxPeople { get; set; } = 2;
        public int NumFloors { get; set; } = 4;
        public int NumRoomsPerFloor { get; set; } = 5;
        public List<int>? RoomsCountPerFloor { get; set; }
        public string NumberingRule { get; set; } = "standard"; // standard, prefix, manual
        public string PrefixText { get; set; } = "";
        public int StartNum { get; set; } = 1;
        public decimal ElectricityPrice { get; set; } = 3500;
        public decimal WaterPrice { get; set; } = 15000;
        public decimal InternetPrice { get; set; } = 100000;
        public decimal GarbagePrice { get; set; } = 30000;
        public List<CustomRoomDto>? CustomRooms { get; set; }
    }
}
