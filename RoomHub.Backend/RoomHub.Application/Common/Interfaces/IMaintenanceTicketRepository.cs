using System.Collections.Generic;
using System.Threading.Tasks;
using Domain.Entities;

namespace Application.Common.Interfaces
{
    public interface IMaintenanceTicketRepository
    {
        Task<MaintenanceTicket?> GetByIdAsync(int id);
        Task<List<MaintenanceTicket>> GetByTenantIdAsync(string tenantId);
        Task AddAsync(MaintenanceTicket ticket);
        Task DeleteAsync(MaintenanceTicket ticket);
    }
}
