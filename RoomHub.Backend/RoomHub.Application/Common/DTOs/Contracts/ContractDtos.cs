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
}
