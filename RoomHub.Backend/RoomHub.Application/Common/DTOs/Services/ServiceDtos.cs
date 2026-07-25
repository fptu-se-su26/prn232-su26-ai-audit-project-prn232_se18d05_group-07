using System;

namespace Application.Common.DTOs.Services
{
    // ----- Danh mục dịch vụ (Admin quản lý) -----

    public class ServiceDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public decimal BasePrice { get; set; }
        public decimal CommissionRate { get; set; }
    }

    public class CreateServiceRequest
    {
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public decimal BasePrice { get; set; }
        public decimal CommissionRate { get; set; } = 0.10m;
    }

    public class UpdateServiceRequest
    {
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public decimal BasePrice { get; set; }
        public decimal CommissionRate { get; set; }
    }

    // ----- Yêu cầu dịch vụ (Người thuê tạo, Chủ trọ xử lý) -----

    public class CreateServiceRequestRequest
    {
        public int ServiceId { get; set; }
    }

    public class UpdateServiceRequestStatusRequest
    {
        public string Status { get; set; } = null!;   // Approved | Completed | Rejected
        public decimal? Amount { get; set; }
    }

    public class ServiceRequestDto
    {
        public int Id { get; set; }
        public int ServiceId { get; set; }
        public string ServiceName { get; set; } = null!;
        public int ContractId { get; set; }
        public string? RoomTitle { get; set; }
        public string? TenantName { get; set; }
        public DateTime RequestDate { get; set; }
        public string Status { get; set; } = null!;
        public decimal? Amount { get; set; }
    }
}
