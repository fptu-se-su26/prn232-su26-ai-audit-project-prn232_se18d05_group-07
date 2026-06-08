using System.Collections.Generic;
using System.Threading.Tasks;
using Application.Common.DTOs.Listings;

namespace Application.Common.Interfaces
{
    public interface IAdminModerationService
    {
        Task<List<AdminModerationListingDto>> GetFlaggedListingsAsync();
        Task<List<AdminModerationListingDto>> GetAllListingsAsync(string? status = null);
        Task<AdminModerationStatsDto> GetStatsAsync();
        Task<AdminModerationActionResult?> ApproveListingAsync(int roomId, string adminId, AdminModerationActionRequest request);
        Task<AdminModerationActionResult?> RejectListingAsync(int roomId, string adminId, AdminModerationActionRequest request);
    }
}
