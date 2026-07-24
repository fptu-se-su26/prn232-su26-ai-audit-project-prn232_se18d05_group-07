using System.Threading.Tasks;
using Application.Common.DTOs.Auth;

namespace Application.Common.Interfaces
{
    public interface IAuthService
    {
        Task<AuthResponse> RegisterAsync(RegisterRequest request, bool exposeOtpForDebugging);
        Task<AuthResponse> VerifyOtpAsync(VerifyOtpRequest request);
        Task<AuthResponse> LoginAsync(LoginRequest request);
        Task<AuthResponse> ForgotPasswordAsync(ForgotPasswordRequest request, bool exposeOtpForDebugging);
        AuthResponse VerifyResetOtp(VerifyResetOtpRequest request);
        Task<AuthResponse> ResetPasswordAsync(ResetPasswordRequest request);
        Task<AuthResponse> ResendOtpAsync(ResendOtpRequest request, bool exposeOtpForDebugging);
        Task<bool> CheckEmailExistsAsync(string email);
        Task<AuthResponse> RefreshTokenAsync(RefreshTokenRequest request);
        Task LogoutAsync(string refreshToken);
    }
}
