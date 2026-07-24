using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class ReviewViolation
    {
        public int Id { get; set; }
        public string UserId { get; set; } = null!;
        public int? ReviewId { get; set; }
        public string ReporterId { get; set; } = null!;
        public string ReasonCode { get; set; } = null!;
        public string? Description { get; set; }
        public Domain.Enums.ReviewReportStatus Status { get; set; } = Domain.Enums.ReviewReportStatus.Pending;
        public string? ReviewedByAdminId { get; set; }
        public DateTime? ReviewedAt { get; set; }
        public string? AdminNote { get; set; }
        public string Content { get; set; } = null!;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public virtual ApplicationUser User { get; set; } = null!;
        public virtual Review Review { get; set; } = null!;
    }
}
