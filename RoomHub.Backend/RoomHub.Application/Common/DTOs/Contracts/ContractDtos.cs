using System;

namespace Application.Common.DTOs.Contracts
{
    public class CreateContractRequest
    {
        public int RoomId { get; set; }
        public string? TenantEmailOrPhone { get; set; }
        public string TemporaryTenantName { get; set; } = null!;
        public string TemporaryTenantPhone { get; set; } = null!;
        public string? TemporaryTenantEmail { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public decimal RentAmount { get; set; }
        public decimal DepositAmount { get; set; }
        public string? Terms { get; set; }
    }

    public class TerminateContractRequest
    {
        public DateTime EndDate { get; set; }
        public string? Reason { get; set; }
        public decimal? RefundAmount { get; set; }
        public decimal? PenaltyAmount { get; set; }
    }

    public class TenantSearchResultDto
    {
        public string UserId { get; set; } = null!;
        public string FullName { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string Phone { get; set; } = null!;
        public string Cccd { get; set; } = "";
        public string Address { get; set; } = "";
    }

    public class TenantRoomDto
    {
        public int RoomId { get; set; }
        public string RoomNumber { get; set; } = null!;
        public string BuildingName { get; set; } = null!;
        public string BuildingAddress { get; set; } = null!;
        public string RoomType { get; set; } = null!;
        public decimal SurfaceArea { get; set; }
        public int MaxCapacity { get; set; }
        public bool IsFurnished { get; set; }
        public decimal ElectricityPrice { get; set; }
        public decimal WaterPrice { get; set; }
        public decimal InternetPrice { get; set; }
        public decimal GarbagePrice { get; set; }

        public decimal RentAmount { get; set; }
        public decimal DepositAmount { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string Status { get; set; } = null!;
        public bool IsPending { get; set; }

        public string OwnerName { get; set; } = null!;
        public string OwnerPhone { get; set; } = null!;
        public string OwnerEmail { get; set; } = null!;
        public string? OwnerAvatar { get; set; }
        public string? RoomImage { get; set; }
        public string? SignaturePath { get; set; }
    }

    public class OwnerTenantDto
    {
        public int ContractId { get; set; }
        public int RoomId { get; set; }
        public string RoomNumber { get; set; } = null!;
        public int BuildingId { get; set; }
        public string BuildingName { get; set; } = null!;
        public string? TenantId { get; set; }
        public string TenantName { get; set; } = null!;
        public string TenantPhone { get; set; } = null!;
        public string? TenantEmail { get; set; }
        public string? TenantAvatar { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public decimal RentAmount { get; set; }
        public decimal DepositAmount { get; set; }
        public string ContractStatus { get; set; } = null!;
        public bool IsOnline { get; set; }
    }
}
