using System.Collections.Generic;
using System.Threading.Tasks;
using Domain.Entities;

namespace Application.Common.Interfaces
{
    public interface IServiceRequestRepository
    {
        Task<Contract?> GetActiveContractForTenantAsync(string tenantId);
        Task<Service?> GetServiceAsync(int serviceId);
        Task<ServiceRequest?> GetByIdAsync(int id);
        Task<List<ServiceRequest>> GetByTenantIdAsync(string tenantId);
        Task<List<ServiceRequest>> GetByOwnerIdAsync(string ownerId);
        Task AddAsync(ServiceRequest request);
        Task UpdateAsync(ServiceRequest request);
        Task DeleteAsync(ServiceRequest request);
    }
}
