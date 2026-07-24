using System;

namespace Application.Common.DTOs.Auth
{
    public class LoginRequest
    {
        public string Email { get; set; } = null!;
        public string Password { get; set; } = null!;
        public bool RememberMe { get; set; }
    }

    public class RegisterRequest
    {
        public string Email { get; set; } = null!;
        public string Password { get; set; } = null!;
        public string FullName { get; set; } = null!;
        public string Role { get; set; } = null!; // "Tenant" or "PropertyOwner"
    }

    public class VerifyOtpRequest
    {
        public string Email { get; set; } = null!;
        public string Code { get; set; } = null!;
    }

    public class ForgotPasswordRequest
    {
        public string Email { get; set; } = null!;
    }

    public class VerifyResetOtpRequest
    {
        public string Email { get; set; } = null!;
        public string Code { get; set; } = null!;
    }

    public class ResetPasswordRequest
    {
        public string Email { get; set; } = null!;
        public string NewPassword { get; set; } = null!;
    }

    public class ResendOtpRequest
    {
        public string Email { get; set; } = null!;
    }

    public class RefreshTokenRequest
    {
        public string RefreshToken { get; set; } = null!;
    }

    public class AuthResponse
    {
        public bool Succeeded { get; set; }
        public string Message { get; set; } = string.Empty;
        public string? Token { get; set; }
        public string? RefreshToken { get; set; }
        public DateTime? Expiration { get; set; }
        public UserInfoDto? UserInfo { get; set; }
    }

    public class UserInfoDto
    {
        public string Id { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string FullName { get; set; } = null!;
        public string Role { get; set; } = null!;
    }

    public class GoogleLoginRequest
    {
        public string IdToken { get; set; } = null!;
    }
}

