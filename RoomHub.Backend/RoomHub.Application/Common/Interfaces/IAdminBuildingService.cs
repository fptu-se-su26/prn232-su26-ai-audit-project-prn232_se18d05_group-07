using System.Collections.Generic;
using System.Threading.Tasks;
using Application.Common.DTOs.Admin;

namespace Application.Common.Interfaces
{
    public interface IAdminBuildingService
    {
        Task<List<AdminBuildingDto>> GetAllBuildingsAsync();
        Task<bool> ToggleLockBuildingAsync(int buildingId, string? reason);
    }
}
