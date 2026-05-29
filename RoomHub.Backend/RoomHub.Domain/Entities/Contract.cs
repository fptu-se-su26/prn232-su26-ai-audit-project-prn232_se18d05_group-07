using Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class Contract
    {
        public int Id { get; set; }
        public int RoomId { get; set; }
        public string? TenantId { get; set; }
        public string OwnerId { get; set; } = null!;
        public string? TemporaryTenantName { get; set; }
        public string? TemporaryTenantPhone { get; set; }
        public string? TemporaryTenantEmail { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public decimal RentAmount { get; set; }
        public decimal DepositAmount { get; set; }
        public string? Terms { get; set; }
        public ContractStatus Status { get; set; }
        public string? SignaturePath { get; set; }
        public decimal? PenaltyAmount { get; set; }
        public decimal? RefundAmount { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        public bool IsDeleted { get; set; }

        // Navigation
        public virtual Room Room { get; set; } = null!;
        public virtual ApplicationUser? Tenant { get; set; }
        public virtual ApplicationUser Owner { get; set; } = null!;
        public virtual ICollection<UtilityReading> UtilityReadings { get; set; } = new List<UtilityReading>();
        public virtual ICollection<Invoice> Invoices { get; set; } = new List<Invoice>();
        public virtual ICollection<ServiceRequest> ServiceRequests { get; set; } = new List<ServiceRequest>();
        public virtual ICollection<Message> Messages { get; set; } = new List<Message>();
    }
}
