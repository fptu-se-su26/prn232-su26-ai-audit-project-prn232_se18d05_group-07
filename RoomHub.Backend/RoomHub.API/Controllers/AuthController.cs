using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Application.Common.DTOs.Auth;
using Application.Common.Interfaces;
using Domain.Entities;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.Extensions.Configuration;
using Google.Apis.Auth;
using System.Net.Http.Json;

namespace RoomHub.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [EnableRateLimiting("AuthPolicy")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly IWebHostEnvironment _environment;

        // Only used by GoogleLogin below, which predates the AuthService extraction and talks to
        // Identity/JWT generation directly rather than through IAuthService.
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly IJwtTokenGenerator _jwtTokenGenerator;
        private readonly IConfiguration _configuration;

        public AuthController(
            IAuthService authService,
            IWebHostEnvironment environment,
            UserManager<ApplicationUser> userManager,
            RoleManager<IdentityRole> roleManager,
            IJwtTokenGenerator jwtTokenGenerator,
            IConfiguration configuration)
        {
            _authService = authService;
            _environment = environment;
            _userManager = userManager;
            _roleManager = roleManager;
            _jwtTokenGenerator = jwtTokenGenerator;
            _configuration = configuration;
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

        // =========================
        // GOOGLE LOGIN
        // =========================
        [HttpPost("google")]
        public async Task<ActionResult<AuthResponse>> GoogleLogin(GoogleLoginRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.IdToken))
                return BadRequest(new AuthResponse { Succeeded = false, Message = "Token Google không được để trống." });

            try
            {
                var clientId = _configuration["Authentication:Google:ClientId"];
                GoogleJsonWebSignature.Payload payload;

                try
                {
                    var settings = new GoogleJsonWebSignature.ValidationSettings
                    {
                        Audience = new List<string> { clientId ?? string.Empty }
                    };
                    payload = await GoogleJsonWebSignature.ValidateAsync(request.IdToken, settings);
                }
                catch (InvalidJwtException)
                {
                    // Fallback to Access Token verification via Google OAuth2 tokeninfo endpoint
                    using (var httpClient = new System.Net.Http.HttpClient())
                    {
                        var tokenInfoResponse = await httpClient.GetAsync($"https://oauth2.googleapis.com/tokeninfo?access_token={Uri.EscapeDataString(request.IdToken)}");
                        if (!tokenInfoResponse.IsSuccessStatusCode)
                        {
                            return BadRequest(new AuthResponse { Succeeded = false, Message = "Xác thực token Google thất bại (Không phải JWT hợp lệ và không thể phân tích access token)." });
                        }

                        var tokenInfo = await tokenInfoResponse.Content.ReadFromJsonAsync<GoogleTokenInfo>();
                        if (tokenInfo == null || (tokenInfo.Audience != clientId && tokenInfo.Azp != clientId) || string.IsNullOrEmpty(tokenInfo.Email))
                        {
                            return BadRequest(new AuthResponse { Succeeded = false, Message = "Xác thực token Google không hợp lệ hoặc Client ID không khớp." });
                        }

                        // Retrieve profile name if available, otherwise call userinfo or default to email prefix
                        string? name = tokenInfo.Name;
                        if (string.IsNullOrEmpty(name))
                        {
                            // Try calling userinfo to get name
                            var userInfoResponse = await httpClient.GetAsync($"https://www.googleapis.com/oauth2/v3/userinfo?access_token={Uri.EscapeDataString(request.IdToken)}");
                            if (userInfoResponse.IsSuccessStatusCode)
                            {
                                var userInfo = await userInfoResponse.Content.ReadFromJsonAsync<GoogleUserInfo>();
                                if (userInfo != null)
                                {
                                    name = userInfo.Name;
                                }
                            }
                        }

                        payload = new GoogleJsonWebSignature.Payload
                        {
                            Email = tokenInfo.Email,
                            Name = name ?? tokenInfo.Email.Split('@')[0]
                        };
                    }
                }

                if (payload == null || string.IsNullOrEmpty(payload.Email))
                {
                    return BadRequest(new AuthResponse { Succeeded = false, Message = "Xác thực token Google thất bại." });
                }

                var email = payload.Email;
                var user = await _userManager.FindByEmailAsync(email);
                string roleName = "Tenant"; // Default role

                if (user == null)
                {
                    // Create new user if not exist
                    user = new ApplicationUser
                    {
                        UserName = email,
                        Email = email,
                        FullName = payload.Name ?? email.Split('@')[0],
                        EmailConfirmed = true
                    };

                    var createResult = await _userManager.CreateAsync(user);
                    if (!createResult.Succeeded)
                    {
                        var errors = string.Join("; ", System.Linq.Enumerable.Select(createResult.Errors, e => e.Description));
                        return BadRequest(new AuthResponse { Succeeded = false, Message = $"Tạo tài khoản Google thất bại: {errors}" });
                    }

                    // Assign default role (Tenant)
                    if (!await _roleManager.RoleExistsAsync(roleName))
                    {
                        await _roleManager.CreateAsync(new IdentityRole(roleName));
                    }
                    await _userManager.AddToRoleAsync(user, roleName);
                }
                else
                {
                    // Check if banned
                    if (user.IsBanned && (!user.BannedUntil.HasValue || user.BannedUntil > DateTime.UtcNow))
                    {
                        return StatusCode(403, new AuthResponse { Succeeded = false, Message = "Tài khoản của bạn đã bị khóa." });
                    }

                    // Get user's existing roles
                    var userRoles = await _userManager.GetRolesAsync(user);
                    if (userRoles.Count > 0)
                    {
                        roleName = userRoles[0];
                    }
                    else
                    {
                        // Assign default role if none
                        if (!await _roleManager.RoleExistsAsync(roleName))
                        {
                            await _roleManager.CreateAsync(new IdentityRole(roleName));
                        }
                        await _userManager.AddToRoleAsync(user, roleName);
                    }
                }

                // Generate JWT Access & Refresh Tokens
                var roles = new List<string> { roleName };
                var accessToken = _jwtTokenGenerator.GenerateAccessToken(user, roles);
                var refreshToken = _jwtTokenGenerator.GenerateRefreshToken();

                // Store refresh token
                var refreshTokenEntity = new RefreshToken
                {
                    Token = refreshToken,
                    ExpiresOn = DateTime.UtcNow.AddDays(7),
                    UserId = user.Id
                };
                user.RefreshTokens.Add(refreshTokenEntity);
                await _userManager.UpdateAsync(user);

                return Ok(new AuthResponse
                {
                    Succeeded = true,
                    Message = "Đăng nhập Google thành công.",
                    Token = accessToken,
                    RefreshToken = refreshToken,
                    Expiration = DateTime.UtcNow.AddMinutes(60),
                    UserInfo = new UserInfoDto
                    {
                        Id = user.Id,
                        Email = user.Email ?? string.Empty,
                        FullName = user.FullName,
                        Role = roleName
                    }
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[GOOGLE AUTH ERROR] Error: {ex}");
                return StatusCode(500, new AuthResponse { Succeeded = false, Message = $"Lỗi hệ thống khi xử lý đăng nhập Google: {ex.Message}" });
            }
        }

        private class GoogleTokenInfo
        {
            [System.Text.Json.Serialization.JsonPropertyName("aud")]
            public string? Audience { get; set; }
            
            [System.Text.Json.Serialization.JsonPropertyName("azp")]
            public string? Azp { get; set; }
            
            [System.Text.Json.Serialization.JsonPropertyName("email")]
            public string Email { get; set; } = null!;
            
            [System.Text.Json.Serialization.JsonPropertyName("name")]
            public string? Name { get; set; }
        }

        private class GoogleUserInfo
        {
            [System.Text.Json.Serialization.JsonPropertyName("name")]
            public string? Name { get; set; }
        }
    }
}
