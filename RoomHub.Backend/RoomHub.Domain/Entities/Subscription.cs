using Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class Subscription
    {
        public int Id { get; set; }
        public string UserId { get; set; } = null!;
        public SubscriptionPlan PlanType { get; set; }
        public decimal Amount { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public SubscriptionStatus Status { get; set; }
        public string? TransactionProofUrl { get; set; }
        public string? Note { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public virtual ApplicationUser User { get; set; } = null!;
    }
}
