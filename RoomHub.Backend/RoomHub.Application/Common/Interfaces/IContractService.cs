using System.Threading.Tasks;
using Application.Common.DTOs.Contracts;

namespace Application.Common.Interfaces
{
    public interface IContractService
    {
        Task<TenantSearchResultDto?> SearchTenantAsync(string query);
        Task<bool> CreateContractAsync(CreateContractRequest request, string ownerId);
        Task<bool> TerminateContractAsync(int roomId, TerminateContractRequest request, string ownerId);
        Task<TenantRoomDto?> GetActiveRoomForTenantAsync(string tenantId);
    }
}
