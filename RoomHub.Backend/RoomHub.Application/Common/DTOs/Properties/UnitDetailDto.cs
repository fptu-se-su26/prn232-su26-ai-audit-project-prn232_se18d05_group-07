using System;
using System.Collections.Generic;

namespace Application.Common.DTOs.Properties
{
    public class UnitTenantDto
    {
        public string Name { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string Phone { get; set; } = null!;
        public string Cccd { get; set; } = "";
        public string Address { get; set; } = "";
        public string StartDate { get; set; } = "";
        public string EndDate { get; set; } = "";
        public decimal Deposit { get; set; }
        public decimal AgreementPrice { get; set; }
        public int PeopleCount { get; set; }
        public bool IsLinkedAccount { get; set; }
    }

    public class UnitInvoiceDto
    {
        public string Id { get; set; } = null!;
        public string Month { get; set; } = null!;
        public decimal RentPrice { get; set; }
        public decimal UtilitiesPrice { get; set; }
        public decimal Total { get; set; }
        public string Status { get; set; } = null!;
        public string DueDate { get; set; } = null!;
    }

    public class UnitListingDto
    {
        public string Id { get; set; } = null!;
        public string Title { get; set; } = null!;
        public decimal Price { get; set; }
        public string Status { get; set; } = null!;
        public string CreatedDate { get; set; } = null!;
        public int Views { get; set; }
    }

    public class UnitActivityLogDto
    {
        public string Text { get; set; } = null!;
        public string Time { get; set; } = null!;
    }

    public class UnitDetailDto
    {
        public string Id { get; set; } = null!;
        public string RoomNumber { get; set; } = null!;
        public int Floor { get; set; }
        public string Type { get; set; } = null!;
        public decimal Area { get; set; }
        public decimal Price { get; set; }
        public string Status { get; set; } = null!;
        public string BuildingName { get; set; } = null!;
        public string BuildingAddress { get; set; } = null!;
        public int BuildingId { get; set; }
        public string Description { get; set; } = "";
        public bool IsFurnished { get; set; }
        public int MaxCapacity { get; set; }
        public decimal ElectricityPrice { get; set; }
        public decimal WaterPrice { get; set; }
        public decimal InternetPrice { get; set; }
        public decimal GarbagePrice { get; set; }
        public string InternalNotes { get; set; } = "";

        // Tenant & Listing
        public UnitTenantDto? Tenant { get; set; }
        public UnitListingDto? Listing { get; set; }
        public List<string> ImageUrls { get; set; } = new();
        public List<UnitInvoiceDto> Invoices { get; set; } = new();
        public List<UnitActivityLogDto> Logs { get; set; } = new();
    }
}
