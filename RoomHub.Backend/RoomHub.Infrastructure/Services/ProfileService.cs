using System;
using System.Linq;
using System.Threading.Tasks;
using Application.Common.DTOs.Profile;
using Application.Common.Interfaces;
using Domain.Entities;
using Microsoft.AspNetCore.Identity;

namespace Infrastructure.Services
{
    // Profile management lives in Infrastructure because it relies on ASP.NET
    // Identity's UserManager (the Application layer does not reference Identity).
    public class ProfileService : IProfileService
    {
        private readonly UserManager<ApplicationUser> _userManager;

        public ProfileService(UserManager<ApplicationUser> userManager)
        {
            _userManager = userManager;
        }

        public async Task<ProfileDto?> GetProfileAsync(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) return null;

            return new ProfileDto
            {
                Id = user.Id,
                FullName = user.FullName,
                Email = user.Email ?? string.Empty,
                PhoneNumber = user.PhoneNumber,
                Address = user.Address,
                AvatarUrl = user.AvatarUrl,
                DateOfBirth = user.DateOfBirth,
                Gender = user.Gender,
                IsVerified = user.IsVerified,
                CreatedAt = user.CreatedAt
            };
        }

        public async Task<ProfileResult> UpdateProfileAsync(string userId, UpdateProfileDto dto)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return new ProfileResult { Succeeded = false, Message = "Không tìm thấy người dùng." };

            if (string.IsNullOrWhiteSpace(dto.FullName))
                return new ProfileResult { Succeeded = false, Message = "Họ tên không được để trống." };

            user.FullName = dto.FullName.Trim();
            user.Address = dto.Address;
            user.DateOfBirth = dto.DateOfBirth;
            user.Gender = dto.Gender;
            user.UpdatedAt = DateTime.UtcNow;

            // Identity tracks the phone number separately, so use the dedicated API
            // (also runs phone validation) rather than assigning the property directly.
            if (user.PhoneNumber != dto.PhoneNumber)
            {
                var phoneResult = await _userManager.SetPhoneNumberAsync(user, dto.PhoneNumber);
                if (!phoneResult.Succeeded)
                    return new ProfileResult { Succeeded = false, Message = "Số điện thoại không hợp lệ." };
            }

            if (!string.IsNullOrEmpty(dto.AvatarUrl))
                user.AvatarUrl = dto.AvatarUrl;

            var result = await _userManager.UpdateAsync(user);
            return result.Succeeded
                ? new ProfileResult { Succeeded = true, Message = "Cập nhật hồ sơ thành công." }
                : new ProfileResult { Succeeded = false, Message = string.Join("; ", result.Errors.Select(e => e.Description)) };
        }

        public async Task<ProfileResult> ChangePasswordAsync(string userId, ChangePasswordDto dto)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return new ProfileResult { Succeeded = false, Message = "Không tìm thấy người dùng." };

            if (string.IsNullOrWhiteSpace(dto.CurrentPassword) || string.IsNullOrWhiteSpace(dto.NewPassword))
                return new ProfileResult { Succeeded = false, Message = "Vui lòng nhập đầy đủ mật khẩu hiện tại và mật khẩu mới." };

            var result = await _userManager.ChangePasswordAsync(user, dto.CurrentPassword, dto.NewPassword);
            return result.Succeeded
                ? new ProfileResult { Succeeded = true, Message = "Đổi mật khẩu thành công." }
                : new ProfileResult { Succeeded = false, Message = string.Join("; ", result.Errors.Select(e => e.Description)) };
        }
    }
}
