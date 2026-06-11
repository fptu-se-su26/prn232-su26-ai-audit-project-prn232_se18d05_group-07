using System;

namespace Application.Common.DTOs.Subscriptions
{
    public class SubscriptionStatusDto
    {
        public string Plan { get; set; } = null!;
        public string? ExpiryDate { get; set; }
        public int BuildingsUsed { get; set; }
        public int BuildingsLimit { get; set; }
        public int RoomsUsed { get; set; }
        public int RoomsLimit { get; set; }
        public int AiAuditsUsed { get; set; }
        public int AiAuditsLimit { get; set; }
        public string Status { get; set; } = null!;
    }

    public class UpgradeRequestDto
    {
        public string PlanType { get; set; } = null!; // "Monthly" or "Yearly"
        public string PaymentMethod { get; set; } = null!; // "VietQR" or "Manual"
        public string? ProofImageUrl { get; set; }
        public string? Note { get; set; }
    }

    public class UpgradeResponseDto
    {
        public bool Success { get; set; }
        public string Message { get; set; } = null!;
        public string? PaymentUrl { get; set; }
        public string? QrCodeUrl { get; set; }
        public string? BankAccountName { get; set; }
        public string? BankAccountNumber { get; set; }
        public string? BankName { get; set; }
        public decimal Amount { get; set; }
        public int SubscriptionId { get; set; }
    }

    public class AdminSubscriptionDto
    {
        public int Id { get; set; }
        public string UserId { get; set; } = null!;
        public string OwnerName { get; set; } = null!;
        public string OwnerEmail { get; set; } = null!;
        public string PlanType { get; set; } = null!;
        public decimal Amount { get; set; }
        public string Date { get; set; } = null!;
        public string Status { get; set; } = null!;
        public string? TransactionProofUrl { get; set; }
        public string? Note { get; set; }
    }
}
