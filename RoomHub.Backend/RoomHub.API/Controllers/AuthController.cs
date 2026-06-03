using System;
using System.Collections.Generic;
using System.Security.Cryptography;
using System.Threading.Tasks;
using Application.Common.DTOs.Auth;
using Application.Common.Interfaces;
using Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;

namespace RoomHub.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly IJwtTokenGenerator _jwtTokenGenerator;
        private readonly IEmailService _emailService;
        private readonly IMemoryCache _cache;

        public AuthController(
            UserManager<ApplicationUser> userManager,
            RoleManager<IdentityRole> roleManager,
            IJwtTokenGenerator jwtTokenGenerator,
            IEmailService emailService,
            IMemoryCache cache)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _jwtTokenGenerator = jwtTokenGenerator;
            _emailService = emailService;
            _cache = cache;
        }

        // =========================
        // REGISTER
        // =========================
        [HttpPost("register")]
        public async Task<ActionResult<AuthResponse>> Register(RegisterRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
                return BadRequest(new AuthResponse { Succeeded = false, Message = "Email và mật khẩu không được để trống." });

            var existingUser = await _userManager.FindByEmailAsync(request.Email);
            if (existingUser != null)
                return BadRequest(new AuthResponse { Succeeded = false, Message = "Email này đã được sử dụng." });

            // Generate 6-digit OTP
            var otp = RandomNumberGenerator.GetInt32(100000, 999999).ToString();

            // Hash the password before caching
            var dummyUser = new ApplicationUser { Email = request.Email, UserName = request.Email };
            var hashedPassword = _userManager.PasswordHasher.HashPassword(dummyUser, request.Password);

            var cacheData = new RegisterRequest
            {
                Email = request.Email,
                FullName = request.FullName,
                Password = hashedPassword,
                Role = request.Role
            };

            // Cache temporary user registration data and OTP for 5 minutes
            _cache.Set($"REGISTER_{request.Email}", cacheData, TimeSpan.FromMinutes(5));
            _cache.Set($"OTP_{request.Email}", otp, TimeSpan.FromMinutes(5));

            try
            {
                await _emailService.SendOtpEmailAsync(request.Email, otp);
            }
            catch (Exception)
            {
                return StatusCode(500, new AuthResponse { Succeeded = false, Message = "Không thể gửi email OTP xác thực. Vui lòng kiểm tra lại cấu hình email." });
            }

            return Ok(new AuthResponse { Succeeded = true, Message = "Mã xác thực OTP đã được gửi đến email của bạn." });
        }

        // =========================
        // VERIFY OTP
        // =========================
        [HttpPost("verify-otp")]
        public async Task<ActionResult<AuthResponse>> VerifyOtp(VerifyOtpRequest request)
        {
            if (!_cache.TryGetValue($"OTP_{request.Email}", out string? savedOtp) || savedOtp != request.Code)
                return BadRequest(new AuthResponse { Succeeded = false, Message = "Mã OTP không chính xác hoặc đã hết hạn." });

            if (!_cache.TryGetValue($"REGISTER_{request.Email}", out RegisterRequest? registerData) || registerData == null)
                return BadRequest(new AuthResponse { Succeeded = false, Message = "Phiên đăng ký đã hết hạn. Vui lòng đăng ký lại." });

            var user = new ApplicationUser
            {
                UserName = registerData.Email,
                Email = registerData.Email,
                FullName = registerData.FullName,
                EmailConfirmed = true,
                PasswordHash = registerData.Password
            };

            var result = await _userManager.CreateAsync(user);
            if (!result.Succeeded)
            {
                return BadRequest(new AuthResponse { Succeeded = false, Message = "Lỗi tạo tài khoản." });
            }

            // Ensure the role exists, then assign it
            var roleName = registerData.Role;
            if (!await _roleManager.RoleExistsAsync(roleName))
            {
                await _roleManager.CreateAsync(new IdentityRole(roleName));
            }
            await _userManager.AddToRoleAsync(user, roleName);

            // Clean up cache
            _cache.Remove($"OTP_{request.Email}");
            _cache.Remove($"REGISTER_{request.Email}");

            // Generate JWT Tokens
            var roles = new List<string> { roleName };
            var accessToken = _jwtTokenGenerator.GenerateAccessToken(user, roles);
            var refreshToken = _jwtTokenGenerator.GenerateRefreshToken();

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
                Message = "Xác thực OTP và đăng ký tài khoản thành công.",
                Token = accessToken,
                RefreshToken = refreshToken,
                Expiration = DateTime.UtcNow.AddMinutes(60),
                UserInfo = new UserInfoDto
                {
                    Id = user.Id,
                    Email = user.Email,
                    FullName = user.FullName,
                    Role = roleName
                }
            });
        }

        // =========================
        // LOGIN
        // =========================
        [HttpPost("login")]
        public async Task<ActionResult<AuthResponse>> Login(LoginRequest request)
        {
            var user = await _userManager.FindByEmailAsync(request.Email);
            if (user == null)
                return Unauthorized(new AuthResponse { Succeeded = false, Message = "Email hoặc mật khẩu không chính xác." });

            if (!user.EmailConfirmed)
                return BadRequest(new AuthResponse { Succeeded = false, Message = "Tài khoản của bạn chưa được kích hoạt. Vui lòng xác thực email." });

            if (user.IsBanned)
                return StatusCode(403, new AuthResponse { Succeeded = false, Message = "Tài khoản của bạn đã bị khóa." });

            var isPasswordValid = await _userManager.CheckPasswordAsync(user, request.Password);
            if (!isPasswordValid)
            {
                // Increment access failed count to support lockout
                await _userManager.AccessFailedAsync(user);
                if (await _userManager.IsLockedOutAsync(user))
                {
                    return StatusCode(403, new AuthResponse { Succeeded = false, Message = "Tài khoản bị tạm khóa do nhập sai mật khẩu nhiều lần." });
                }
                return Unauthorized(new AuthResponse { Succeeded = false, Message = "Email hoặc mật khẩu không chính xác." });
            }

            // Reset access failed count
            await _userManager.ResetAccessFailedCountAsync(user);

            var roles = await _userManager.GetRolesAsync(user);
            if (roles.Count == 0)
            {
                // Assign default role if none
                roles = new List<string> { "Tenant" };
                await _userManager.AddToRoleAsync(user, "Tenant");
            }

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
                Message = "Đăng nhập thành công.",
                Token = accessToken,
                RefreshToken = refreshToken,
                Expiration = DateTime.UtcNow.AddMinutes(60),
                UserInfo = new UserInfoDto
                {
                    Id = user.Id,
                    Email = user.Email ?? string.Empty,
                    FullName = user.FullName,
                    Role = roles[0]
                }
            });
        }

        // =========================
        // FORGOT PASSWORD
        // =========================
        [HttpPost("forgot-password")]
        public async Task<ActionResult<AuthResponse>> ForgotPassword(ForgotPasswordRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Email))
                return BadRequest(new AuthResponse { Succeeded = false, Message = "Email không hợp lệ." });

            var user = await _userManager.FindByEmailAsync(request.Email);
            
            // To prevent username enumeration, we return success even if user not found (security practice)
            if (user == null)
                return Ok(new AuthResponse { Succeeded = true, Message = "Mã OTP đã được gửi nếu email tồn tại." });

            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            _cache.Set($"RESET_{request.Email}", token, TimeSpan.FromMinutes(15));

            var otp = RandomNumberGenerator.GetInt32(100000, 999999).ToString();
            _cache.Set($"RESET_OTP_{request.Email}", otp, TimeSpan.FromMinutes(15));

            try
            {
                await _emailService.SendPasswordResetOtpAsync(request.Email, otp);
            }
            catch (Exception)
            {
                return StatusCode(500, new AuthResponse { Succeeded = false, Message = "Không thể gửi email OTP đặt lại mật khẩu." });
            }

            return Ok(new AuthResponse { Succeeded = true, Message = "Mã OTP đặt lại mật khẩu đã được gửi đến email của bạn." });
        }

        // =========================
        // VERIFY RESET OTP
        // =========================
        [HttpPost("verify-reset-otp")]
        public ActionResult<AuthResponse> VerifyResetOtp(VerifyResetOtpRequest request)
        {
            if (!_cache.TryGetValue($"RESET_OTP_{request.Email}", out string? savedOtp) || savedOtp != request.Code)
                return BadRequest(new AuthResponse { Succeeded = false, Message = "Mã OTP không chính xác hoặc đã hết hạn." });

            _cache.Remove($"RESET_OTP_{request.Email}");
            _cache.Set($"RESET_VERIFIED_{request.Email}", true, TimeSpan.FromMinutes(10));

            return Ok(new AuthResponse { Succeeded = true, Message = "Mã OTP hợp lệ. Vui lòng thiết lập mật khẩu mới." });
        }

        // =========================
        // RESET PASSWORD
        // =========================
        [HttpPost("reset-password")]
        public async Task<ActionResult<AuthResponse>> ResetPassword(ResetPasswordRequest request)
        {
            if (!_cache.TryGetValue($"RESET_VERIFIED_{request.Email}", out bool verified) || !verified)
                return BadRequest(new AuthResponse { Succeeded = false, Message = "Yêu cầu đã hết hạn hoặc chưa xác thực OTP." });

            if (!_cache.TryGetValue($"RESET_{request.Email}", out string? token) || string.IsNullOrEmpty(token))
                return BadRequest(new AuthResponse { Succeeded = false, Message = "Mã Token đặt lại mật khẩu không hợp lệ." });

            var user = await _userManager.FindByEmailAsync(request.Email);
            if (user == null)
                return BadRequest(new AuthResponse { Succeeded = false, Message = "Không tìm thấy người dùng." });

            var result = await _userManager.ResetPasswordAsync(user, token, request.NewPassword);
            if (!result.Succeeded)
            {
                var errors = string.Join("; ", System.Linq.Enumerable.Select(result.Errors, e => e.Description));
                return BadRequest(new AuthResponse { Succeeded = false, Message = $"Đặt lại mật khẩu thất bại: {errors}" });
            }

            if (!user.EmailConfirmed)
            {
                user.EmailConfirmed = true;
                await _userManager.UpdateAsync(user);
            }

            _cache.Remove($"RESET_{request.Email}");
            _cache.Remove($"RESET_VERIFIED_{request.Email}");

            return Ok(new AuthResponse { Succeeded = true, Message = "Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại." });
        }

        // =========================
        // RESEND OTP
        // =========================
        [HttpPost("resend-otp")]
        public async Task<ActionResult<AuthResponse>> ResendOtp(ResendOtpRequest request)
        {
            if (!_cache.TryGetValue($"REGISTER_{request.Email}", out RegisterRequest? _))
                return BadRequest(new AuthResponse { Succeeded = false, Message = "Phiên đăng ký đã hết hạn. Vui lòng đăng ký lại từ đầu." });

            var newOtp = RandomNumberGenerator.GetInt32(100000, 999999).ToString();
            _cache.Set($"OTP_{request.Email}", newOtp, TimeSpan.FromMinutes(5));

            await _emailService.SendOtpEmailAsync(request.Email, newOtp);

            return Ok(new AuthResponse { Succeeded = true, Message = "Mã OTP mới đã được gửi vào email của bạn." });
        }

        // =========================
        // CHECK EMAIL
        // =========================
        [HttpGet("check-email")]
        public async Task<ActionResult> CheckEmail([FromQuery] string email)
        {
            if (string.IsNullOrWhiteSpace(email))
                return Ok(new { exists = false });

            var user = await _userManager.FindByEmailAsync(email);
            return Ok(new { exists = user != null });
        }
    }
}
