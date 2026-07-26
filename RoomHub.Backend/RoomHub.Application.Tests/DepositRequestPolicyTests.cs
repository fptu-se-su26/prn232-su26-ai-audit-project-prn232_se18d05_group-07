using Application.Common.DTOs.Viewings;
using Xunit;

namespace RoomHub.Application.Tests;

public sealed class DepositRequestPolicyTests
{
    [Theory]
    [InlineData("BankTransfer", DepositRequestPolicy.BankTransfer)]
    [InlineData(" Chuyển khoản ", DepositRequestPolicy.BankTransfer)]
    [InlineData("Cash", DepositRequestPolicy.Cash)]
    [InlineData("tiền mặt", DepositRequestPolicy.Cash)]
    public void NormalizePaymentMethod_KnownValue_ReturnsCanonicalValue(string input, string expected)
    {
        Assert.Equal(expected, DepositRequestPolicy.NormalizePaymentMethod(input));
    }

    [Theory]
    [InlineData("")]
    [InlineData("Crypto")]
    [InlineData("PayPal")]
    public void NormalizePaymentMethod_UnsupportedValue_IsRejected(string input)
    {
        Assert.Throws<WorkflowException>(() => DepositRequestPolicy.NormalizePaymentMethod(input));
    }

    [Theory]
    [InlineData(" FT260726_123-456 ", "FT260726_123-456")]
    [InlineData("ABCDEF", "ABCDEF")]
    public void NormalizeTransactionId_ValidValue_IsTrimmed(string input, string expected)
    {
        Assert.Equal(expected, DepositRequestPolicy.NormalizeTransactionId(input));
    }

    [Theory]
    [InlineData("123")]
    [InlineData("TXN 123456")]
    [InlineData("<script>alert(1)</script>")]
    public void NormalizeTransactionId_InvalidValue_IsRejected(string input)
    {
        Assert.Throws<WorkflowException>(() => DepositRequestPolicy.NormalizeTransactionId(input));
    }
}
