using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class ServiceRequest
    {
        public int Id { get; set; }
        public int ServiceId { get; set; }
        public int ContractId { get; set; }
        public DateTime RequestDate { get; set; } = DateTime.UtcNow;
        public string Status { get; set; } = null!;
        public decimal? Amount { get; set; }

        // Navigation
        public virtual Service Service { get; set; } = null!;
        public virtual Contract Contract { get; set; } = null!;
    }
}
