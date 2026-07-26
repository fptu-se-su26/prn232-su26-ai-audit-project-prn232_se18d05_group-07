using System.Text.RegularExpressions;

namespace Application.Common.DTOs.Viewings;

public static partial class DepositRequestPolicy
{
    public const string BankTransfer = "BankTransfer";
    public const string Cash = "Cash";

    public static string NormalizePaymentMethod(string? value) =>
        value?.Trim().ToLowerInvariant() switch
        {
            "banktransfer" or "bank transfer" or "chuyển khoản" => BankTransfer,
            "cash" or "tiền mặt" => Cash,
            _ => throw new WorkflowException("Phương thức thanh toán chỉ chấp nhận chuyển khoản hoặc tiền mặt.")
        };

    public static string? NormalizeTransactionId(string? value)
    {
        var normalized = value?.Trim();
        if (string.IsNullOrEmpty(normalized))
            return null;
        if (normalized.Length is < 6 or > 100 || !TransactionIdPattern().IsMatch(normalized))
            throw new WorkflowException("Mã giao dịch phải có 6-100 ký tự chữ, số, dấu chấm, gạch ngang hoặc gạch dưới.");
        return normalized;
    }

    [GeneratedRegex(@"^[\p{L}\p{N}._-]+$", RegexOptions.CultureInvariant)]
    private static partial Regex TransactionIdPattern();
}
