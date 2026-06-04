using System;
using System.Collections.Generic;

namespace Application.Common.DTOs.Invoices
{
    public class InvoiceHeaderDto
    {
        public int Id { get; set; }
        public string RoomNumber { get; set; } = null!;
        public string BuildingName { get; set; } = null!;
        public string Month { get; set; } = null!;
        public decimal TotalAmount { get; set; }
        public string Status { get; set; } = null!;
        public string DueDate { get; set; } = null!;
        public string TenantName { get; set; } = "";
        public string TenantPhone { get; set; } = "";
        public bool IsLinkedAccount { get; set; }
    }

    public class InvoiceItemDto
    {
        public string Description { get; set; } = null!;
        public decimal Amount { get; set; }
        public string ItemType { get; set; } = null!; // Rent, Electricity, Water, Internet, Garbage, Add, Reduce
    }

    public class InvoicePaymentDto
    {
        public decimal Amount { get; set; }
        public string PaymentMethod { get; set; } = null!;
        public string PaidAt { get; set; } = null!;
        public string TransactionId { get; set; } = null!;
    }

    public class InvoiceDetailDto
    {
        public int Id { get; set; }
        public string RoomNumber { get; set; } = null!;
        public string BuildingName { get; set; } = null!;
        public string BuildingAddress { get; set; } = null!;
        public string TenantName { get; set; } = null!;
        public string TenantPhone { get; set; } = null!;
        public string Month { get; set; } = null!;
        public string InvoiceDate { get; set; } = null!;
        public string DueDate { get; set; } = null!;
        public decimal TotalAmount { get; set; }
        public string Status { get; set; } = null!;
        public List<InvoiceItemDto> Items { get; set; } = new();
        public List<InvoicePaymentDto> Payments { get; set; } = new();
        public bool IsLinkedAccount { get; set; }
    }

    public class RoomReadingInput
    {
        public int RoomId { get; set; }
        public decimal OldElectricity { get; set; }
        public decimal NewElectricity { get; set; }
        public decimal OldWater { get; set; }
        public decimal NewWater { get; set; }
        public decimal AdditionalPrice { get; set; }
        public decimal ReductionPrice { get; set; }
        public string? Note { get; set; }
    }

    public class BatchInvoiceRequest
    {
        public int BuildingId { get; set; }
        public int Month { get; set; }
        public int Year { get; set; }
        public DateTime DueDate { get; set; }
        public List<RoomReadingInput> RoomReadings { get; set; } = new();
    }

    public class RecordPaymentRequest
    {
        public decimal Amount { get; set; }
        public string PaymentMethod { get; set; } = "BankTransfer"; // BankTransfer, Cash, EWallet
        public string? TransactionId { get; set; }
    }
}
