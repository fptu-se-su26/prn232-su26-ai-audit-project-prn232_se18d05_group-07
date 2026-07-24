using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Threading.Tasks;
using Application.Common.DTOs.Auth;
using Application.Common.Exceptions;
using Application.Common.Interfaces;
using Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Caching.Memory;

namespace Application.Services
{
    public class AuthService : IAuthService
    {
        private static readonly HashSet<string> AllowedSelfRegisterRoles = new(StringComparer.OrdinalIgnoreCase)
        {
            "Tenant",
            "PropertyOwner"
        };

        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly IJwtTokenGenerator _jwtTokenGenerator;
        private readonly IEmailService _emailService;
        private readonly IMemoryCache _cache;
        private readonly IRefreshTokenRepository _refreshTokenRepository;

        public AuthService(
            UserManager<ApplicationUser> userManager,
            RoleManager<IdentityRole> roleManager,
            IJwtTokenGenerator jwtTokenGenerator,
            IEmailService emailService,
            IMemoryCache cache,
            IRefreshTokenRepository refreshTokenRepository)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _jwtTokenGenerator = jwtTokenGenerator;
            _emailService = emailService;
            _cache = cache;
            _refreshTokenRepository = refreshTokenRepository;
        }

        private static string GenerateOtp() => RandomNumberGenerator.GetInt32(100000, 999999).ToString();

        public async Task<AuthResponse> RegisterAsync(RegisterRequest request, bool exposeOtpForDebugging)
        {
            if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
                throw new ArgumentException("Email và mật khẩu không được để trống.");

            if (string.IsNullOrWhiteSpace(request.Role) || !AllowedSelfRegisterRoles.Contains(request.Role))
                throw new ArgumentException("Vai trò đăng ký không hợp lệ.");

            var existingUser = await _userManager.FindByEmailAsync(request.Email);
            if (existingUser != null)
                throw new ArgumentException("Email này đã được sử dụng.");

            var otp = GenerateOtp();

            var dummyUser = new ApplicationUser { Email = request.Email, UserName = request.Email };
            var hashedPassword = _userManager.PasswordHasher.HashPassword(dummyUser, request.Password);

            var cacheData = new RegisterRequest
            {
                Email = request.Email,
                FullName = request.FullName,
                Password = hashedPassword,
                Role = request.Role
            };

            _cache.Set($"REGISTER_{request.Email}", cacheData, TimeSpan.FromMinutes(5));
            _cache.Set($"OTP_{request.Email}", otp, TimeSpan.FromMinutes(5));

            try
            {
                await _emailService.SendOtpEmailAsync(request.Email, otp);
                return new AuthResponse { Succeeded = true, Message = "Mã xác thực OTP đã được gửi đến email của bạn." };
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[EMAIL FAILURE] Failed to send email to {request.Email}. Error: {ex}. OTP code: {otp}");
                var devHint = exposeOtpForDebugging ? $" (Dev only - OTP: {otp})" : string.Empty;
                return new AuthResponse { Succeeded = true, Message = $"Mã xác thực OTP đã được gửi đến email của bạn.{devHint}" };
            }
        }

        public async Task<AuthResponse> VerifyOtpAsync(VerifyOtpRequest request)
        {
            if (!_cache.TryGetValue($"OTP_{request.Email}", out string? savedOtp) || savedOtp != request.Code)
                throw new ArgumentException("Mã OTP không chính xác hoặc đã hết hạn.");

            if (!_cache.TryGetValue($"REGISTER_{request.Email}", out RegisterRequest? registerData) || registerData == null)
                throw new ArgumentException("Phiên đăng ký đã hết hạn. Vui lòng đăng ký lại.");

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
                throw new InvalidOperationException("Lỗi tạo tài khoản.");

            var roleName = registerData.Role;
            if (!await _roleManager.RoleExistsAsync(roleName))
            {
                await _roleManager.CreateAsync(new IdentityRole(roleName));
            }
            await _userManager.AddToRoleAsync(user, roleName);

            _cache.Remove($"OTP_{request.Email}");
            _cache.Remove($"REGISTER_{request.Email}");

            var roles = new List<string> { roleName };
            var accessToken = _jwtTokenGenerator.GenerateAccessToken(user, roles);
            var refreshToken = _jwtTokenGenerator.GenerateRefreshToken();

            var refreshTokenEntity = new RefreshToken
            {
                Token = refreshToken,
                ExpiresOn = DateTime.UtcNow.AddDays(7),
                UserId = user.Id
            };
            // Adding via the (unloaded) navigation collection instead of the DbSet leaves EF Core
            // unsure whether this is a new row, since RefreshToken.Id is already a non-default Guid
            // (set by its property initializer) - it silently emits a no-op UPDATE instead of an
            // INSERT. Add it through the repository/DbSet so it is unambiguously tracked as Added.
            await _refreshTokenRepository.AddAsync(refreshTokenEntity);
            await _userManager.UpdateAsync(user);

            return new AuthResponse
            {
                Succeeded = true,
                Message = "Xác thực OTP và đăng ký tài khoản thành công.",
                Token = accessToken,
                RefreshToken = refreshToken,
                Expiration = DateTime.UtcNow.AddMinutes(60),
                UserInfo = new UserInfoDto
                {
                    Id = user.Id,
                    Email = user.Email!,
                    FullName = user.FullName,
                    Role = roleName
                }
            };
        }

        public async Task<AuthResponse> LoginAsync(LoginRequest request)
        {
            var user = await _userManager.FindByEmailAsync(request.Email);
            if (user == null)
                throw new UnauthorizedAccessException("Email hoặc mật khẩu không chính xác.");

            if (!user.EmailConfirmed)
                throw new ArgumentException("Tài khoản của bạn chưa được kích hoạt. Vui lòng xác thực email.");

            if (user.IsBanned)
                throw new ForbiddenException("Tài khoản của bạn đã bị khóa.");

            if (await _userManager.IsLockedOutAsync(user))
                throw new ForbiddenException("Tài khoản bị tạm khóa do nhập sai mật khẩu nhiều lần. Vui lòng thử lại sau.");

            var isPasswordValid = await _userManager.CheckPasswordAsync(user, request.Password);
            if (!isPasswordValid)
            {
                await _userManager.AccessFailedAsync(user);
                if (await _userManager.IsLockedOutAsync(user))
                {
                    throw new ForbiddenException("Tài khoản bị tạm khóa do nhập sai mật khẩu nhiều lần.");
                }
                throw new UnauthorizedAccessException("Email hoặc mật khẩu không chính xác.");
            }

            await _userManager.ResetAccessFailedCountAsync(user);

            var roles = await _userManager.GetRolesAsync(user);
            if (roles.Count == 0)
            {
                roles = new List<string> { "Tenant" };
                await _userManager.AddToRoleAsync(user, "Tenant");
            }

            var accessToken = _jwtTokenGenerator.GenerateAccessToken(user, roles);
            var refreshToken = _jwtTokenGenerator.GenerateRefreshToken();

            var refreshTokenEntity = new RefreshToken
            {
                Token = refreshToken,
                ExpiresOn = DateTime.UtcNow.AddDays(7),
                UserId = user.Id
            };
            // See VerifyOtpAsync above for why this must go through the repository/DbSet.
            await _refreshTokenRepository.AddAsync(refreshTokenEntity);
            await _userManager.UpdateAsync(user);

            return new AuthResponse
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
            };
        }

        public async Task<AuthResponse> ForgotPasswordAsync(ForgotPasswordRequest request, bool exposeOtpForDebugging)
        {
            if (string.IsNullOrWhiteSpace(request.Email))
                throw new ArgumentException("Email không hợp lệ.");

            var user = await _userManager.FindByEmailAsync(request.Email);

            // To prevent username enumeration, we return success even if user not found (security practice)
            if (user == null)
                return new AuthResponse { Succeeded = true, Message = "Mã OTP đã được gửi nếu email tồn tại." };

            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            _cache.Set($"RESET_{request.Email}", token, TimeSpan.FromMinutes(15));

            var otp = GenerateOtp();
            _cache.Set($"RESET_OTP_{request.Email}", otp, TimeSpan.FromMinutes(15));

            try
            {
                await _emailService.SendPasswordResetOtpAsync(request.Email, otp);
                return new AuthResponse { Succeeded = true, Message = "Mã OTP đặt lại mật khẩu đã được gửi đến email của bạn." };
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[EMAIL FAILURE] Failed to send password reset email to {request.Email}. Error: {ex}. OTP code: {otp}");
                var devHint = exposeOtpForDebugging ? $" (Dev only - OTP: {otp})" : string.Empty;
                return new AuthResponse { Succeeded = true, Message = $"Mã OTP đặt lại mật khẩu đã được gửi đến email của bạn.{devHint}" };
            }
        }

        public AuthResponse VerifyResetOtp(VerifyResetOtpRequest request)
        {
            if (!_cache.TryGetValue($"RESET_OTP_{request.Email}", out string? savedOtp) || savedOtp != request.Code)
                throw new ArgumentException("Mã OTP không chính xác hoặc đã hết hạn.");

            _cache.Remove($"RESET_OTP_{request.Email}");
            _cache.Set($"RESET_VERIFIED_{request.Email}", true, TimeSpan.FromMinutes(10));

            return new AuthResponse { Succeeded = true, Message = "Mã OTP hợp lệ. Vui lòng thiết lập mật khẩu mới." };
        }

        public async Task<AuthResponse> ResetPasswordAsync(ResetPasswordRequest request)
        {
            if (!_cache.TryGetValue($"RESET_VERIFIED_{request.Email}", out bool verified) || !verified)
                throw new ArgumentException("Yêu cầu đã hết hạn hoặc chưa xác thực OTP.");

            if (!_cache.TryGetValue($"RESET_{request.Email}", out string? token) || string.IsNullOrEmpty(token))
                throw new ArgumentException("Mã Token đặt lại mật khẩu không hợp lệ.");

            var user = await _userManager.FindByEmailAsync(request.Email);
            if (user == null)
                throw new NotFoundException("Không tìm thấy người dùng.");

            var result = await _userManager.ResetPasswordAsync(user, token, request.NewPassword);
            if (!result.Succeeded)
            {
                var errors = string.Join("; ", result.Errors.Select(e => e.Description));
                throw new ArgumentException($"Đặt lại mật khẩu thất bại: {errors}");
            }

            if (!user.EmailConfirmed)
            {
                user.EmailConfirmed = true;
                await _userManager.UpdateAsync(user);
            }

            _cache.Remove($"RESET_{request.Email}");
            _cache.Remove($"RESET_VERIFIED_{request.Email}");

            return new AuthResponse { Succeeded = true, Message = "Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại." };
        }

        public async Task<AuthResponse> ResendOtpAsync(ResendOtpRequest request, bool exposeOtpForDebugging)
        {
            if (!_cache.TryGetValue($"REGISTER_{request.Email}", out RegisterRequest? _))
                throw new ArgumentException("Phiên đăng ký đã hết hạn. Vui lòng đăng ký lại từ đầu.");

            var newOtp = GenerateOtp();
            _cache.Set($"OTP_{request.Email}", newOtp, TimeSpan.FromMinutes(5));

            try
            {
                await _emailService.SendOtpEmailAsync(request.Email, newOtp);
                return new AuthResponse { Succeeded = true, Message = "Mã OTP mới đã được gửi vào email của bạn." };
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[EMAIL FAILURE] Failed to send resend email to {request.Email}. Error: {ex}. OTP code: {newOtp}");
                var devHint = exposeOtpForDebugging ? $" (Dev only - OTP: {newOtp})" : string.Empty;
                return new AuthResponse { Succeeded = true, Message = $"Mã OTP mới đã được gửi vào email của bạn.{devHint}" };
            }
        }

        public async Task<bool> CheckEmailExistsAsync(string email)
        {
            if (string.IsNullOrWhiteSpace(email))
                return false;

            var user = await _userManager.FindByEmailAsync(email);
            return user != null;
        }

        public async Task<AuthResponse> RefreshTokenAsync(RefreshTokenRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.RefreshToken))
                throw new ArgumentException("Refresh token không hợp lệ.");

            var storedToken = await _refreshTokenRepository.GetByTokenAsync(request.RefreshToken);
            if (storedToken == null || storedToken.RevokedOn != null || storedToken.ExpiresOn < DateTime.UtcNow)
                throw new UnauthorizedAccessException("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");

            var user = storedToken.User;
            var roles = await _userManager.GetRolesAsync(user);

            var newAccessToken = _jwtTokenGenerator.GenerateAccessToken(user, roles);
            var newRefreshToken = _jwtTokenGenerator.GenerateRefreshToken();

            // Rotate: revoke the used token and chain it to its replacement so reuse is detectable.
            storedToken.RevokedOn = DateTime.UtcNow;
            storedToken.ReplacedByToken = newRefreshToken;
            await _refreshTokenRepository.UpdateAsync(storedToken);

            await _refreshTokenRepository.AddAsync(new RefreshToken
            {
                Token = newRefreshToken,
                ExpiresOn = DateTime.UtcNow.AddDays(7),
                UserId = user.Id
            });

            // RefreshToken writes above are tracked on the same DbContext as the user; UpdateAsync
            // persists everything pending, consistent with how Login/Register already save their tokens.
            await _userManager.UpdateAsync(user);

            return new AuthResponse
            {
                Succeeded = true,
                Message = "Làm mới phiên đăng nhập thành công.",
                Token = newAccessToken,
                RefreshToken = newRefreshToken,
                Expiration = DateTime.UtcNow.AddMinutes(60),
                UserInfo = new UserInfoDto
                {
                    Id = user.Id,
                    Email = user.Email ?? string.Empty,
                    FullName = user.FullName,
                    Role = roles.FirstOrDefault() ?? string.Empty
                }
            };
        }

        public async Task LogoutAsync(string refreshToken)
        {
            if (string.IsNullOrWhiteSpace(refreshToken))
                return;

            var storedToken = await _refreshTokenRepository.GetByTokenAsync(refreshToken);
            if (storedToken == null || storedToken.RevokedOn != null)
                return;

            storedToken.RevokedOn = DateTime.UtcNow;
            await _refreshTokenRepository.UpdateAsync(storedToken);
            await _userManager.UpdateAsync(storedToken.User);
        }
    }
}
