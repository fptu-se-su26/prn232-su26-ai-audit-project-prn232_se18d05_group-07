using System.Collections.Generic;
using System.Threading.Tasks;
using Domain.Entities;

namespace Application.Common.Interfaces
{
    public interface IContractRepository
    {
        Task<Contract?> GetByIdAsync(int id);
        Task<Contract?> GetActiveContractByRoomIdAsync(int roomId);
        Task<Contract?> GetContractWithRoomAndTenantAsync(int id);
        Task<List<Contract>> GetContractsByOwnerAsync(string ownerId);
        Task<ApplicationUser?> GetTenantByContactAsync(string contact);
        Task AddAsync(Contract contract);
        Task UpdateAsync(Contract contract);
    }
}
