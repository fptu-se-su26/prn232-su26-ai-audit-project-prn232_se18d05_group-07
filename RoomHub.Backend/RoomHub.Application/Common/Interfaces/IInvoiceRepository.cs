using System.Collections.Generic;
using System.Threading.Tasks;
using Domain.Entities;

namespace Application.Common.Interfaces
{
    public interface IInvoiceRepository
    {
        Task<List<Invoice>> GetUnpaidInvoicesByContractAsync(int contractId);
    }
}
