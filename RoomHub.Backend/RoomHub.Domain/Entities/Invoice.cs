using Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class Invoice
    {
        public int Id { get; set; }
        public int ContractId { get; set; }
        public DateTime InvoiceDate { get; set; }
        public DateTime DueDate { get; set; }
        public decimal TotalAmount { get; set; }
        public InvoiceStatus Status { get; set; }
        public string? PaymentProofPath { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public virtual Contract Contract { get; set; } = null!;
        public virtual ICollection<InvoiceItem> InvoiceItems { get; set; } = new List<InvoiceItem>();
        public virtual ICollection<Payment> Payments { get; set; } = new List<Payment>();
    }
}
