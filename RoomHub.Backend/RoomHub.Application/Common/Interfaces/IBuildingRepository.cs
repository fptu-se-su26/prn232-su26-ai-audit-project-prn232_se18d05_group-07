using System.Collections.Generic;
using System.Threading.Tasks;
using Domain.Entities;

namespace Application.Common.Interfaces
{
    public interface IBuildingRepository
    {
        Task<Building?> GetByIdAsync(int id);
        Task<Building?> GetByIdWithOwnerAsync(int id, string ownerId);
        Task<List<Building>> GetBuildingsByOwnerAsync(string ownerId);
        Task AddAsync(Building building);
        Task UpdateAsync(Building building);
        Task DeleteAsync(Building building);
    }
}
