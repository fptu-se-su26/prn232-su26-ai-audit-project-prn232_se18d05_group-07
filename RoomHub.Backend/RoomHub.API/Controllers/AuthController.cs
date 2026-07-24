using System.Threading.Tasks;
using Application.Common.DTOs.Auth;
using Application.Common.Interfaces;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace RoomHub.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [EnableRateLimiting("AuthPolicy")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly IWebHostEnvironment _environment;

        public AuthController(IAuthService authService, IWebHostEnvironment environment)
        {
            _authService = authService;
            _environment = environment;
        }

        [HttpPost("register")]
        public async Task<ActionResult<AuthResponse>> Register(RegisterRequest request)
        {
            var response = await _authService.RegisterAsync(request, _environment.IsDevelopment());
            return Ok(response);
        }

        [HttpPost("verify-otp")]
        public async Task<ActionResult<AuthResponse>> VerifyOtp(VerifyOtpRequest request)
        {
            var response = await _authService.VerifyOtpAsync(request);
            return Ok(response);
        }

        [HttpPost("login")]
        public async Task<ActionResult<AuthResponse>> Login(LoginRequest request)
        {
            var response = await _authService.LoginAsync(request);
            return Ok(response);
        }

        [HttpPost("forgot-password")]
        public async Task<ActionResult<AuthResponse>> ForgotPassword(ForgotPasswordRequest request)
        {
            var response = await _authService.ForgotPasswordAsync(request, _environment.IsDevelopment());
            return Ok(response);
        }

        [HttpPost("verify-reset-otp")]
        public ActionResult<AuthResponse> VerifyResetOtp(VerifyResetOtpRequest request)
        {
            var response = _authService.VerifyResetOtp(request);
            return Ok(response);
        }

        [HttpPost("reset-password")]
        public async Task<ActionResult<AuthResponse>> ResetPassword(ResetPasswordRequest request)
        {
            var response = await _authService.ResetPasswordAsync(request);
            return Ok(response);
        }

        [HttpPost("resend-otp")]
        public async Task<ActionResult<AuthResponse>> ResendOtp(ResendOtpRequest request)
        {
            var response = await _authService.ResendOtpAsync(request, _environment.IsDevelopment());
            return Ok(response);
        }

        [HttpGet("check-email")]
        public async Task<ActionResult> CheckEmail([FromQuery] string email)
        {
            var exists = await _authService.CheckEmailExistsAsync(email);
            return Ok(new { exists });
        }

        [HttpPost("refresh-token")]
        public async Task<ActionResult<AuthResponse>> RefreshToken(RefreshTokenRequest request)
        {
            var response = await _authService.RefreshTokenAsync(request);
            return Ok(response);
        }

        [HttpPost("logout")]
        public async Task<IActionResult> Logout(RefreshTokenRequest request)
        {
            await _authService.LogoutAsync(request.RefreshToken);
            return Ok(new { success = true, message = "Đã đăng xuất." });
        }
    }
}
