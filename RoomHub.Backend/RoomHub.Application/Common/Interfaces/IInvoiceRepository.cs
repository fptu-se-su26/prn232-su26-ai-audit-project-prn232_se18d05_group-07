using System.Collections.Generic;
using System.Threading.Tasks;
using Domain.Entities;

namespace Application.Common.Interfaces
{
    public interface IInvoiceRepository
    {
        Task<Invoice?> GetByIdAsync(int id);
        Task<List<Invoice>> GetUnpaidInvoicesByContractAsync(int contractId);
        Task<List<Invoice>> GetInvoicesByOwnerAsync(string ownerId);
        Task<List<Invoice>> GetInvoicesByTenantAsync(string tenantId);
        Task AddAsync(Invoice invoice);
        Task UpdateAsync(Invoice invoice);
    }
}
