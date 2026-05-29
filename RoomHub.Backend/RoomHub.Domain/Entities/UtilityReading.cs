using Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class UtilityReading
    {
        public int Id { get; set; }
        public int ContractId { get; set; }
        public DateTime ReadingDate { get; set; }
        public UtilityType UtilityType { get; set; }
        public decimal? OldIndex { get; set; }
        public decimal? NewIndex { get; set; }
        public decimal? Usage { get; set; }
        public decimal? Amount { get; set; }

        // Navigation
        public virtual Contract Contract { get; set; } = null!;
    }
}
