using System.Threading.Tasks;
using Application.Common.DTOs.Profile;

namespace Application.Common.Interfaces
{
    public interface IProfileService
    {
        Task<ProfileDto?> GetProfileAsync(string userId);
        Task<ProfileResult> UpdateProfileAsync(string userId, UpdateProfileDto dto);
        Task<ProfileResult> ChangePasswordAsync(string userId, ChangePasswordDto dto);
    }
}
