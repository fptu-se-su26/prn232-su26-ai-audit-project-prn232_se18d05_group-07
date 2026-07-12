using System.Collections.Generic;
using System.Threading.Tasks;
using Domain.Entities;

namespace Application.Common.Interfaces
{
    public interface IReviewRepository
    {
        Task<Review?> GetByIdAsync(int id);
        Task<List<Review>> GetByRoomIdAsync(int roomId);
        Task<List<Review>> GetByTenantIdAsync(string tenantId);
        Task<bool> HasTenantReviewedRoomAsync(string tenantId, int roomId);
        Task<Room?> GetRoomAsync(int roomId);
        Task AddAsync(Review review);
        Task UpdateAsync(Review review);
        Task DeleteAsync(Review review);
    }
}
