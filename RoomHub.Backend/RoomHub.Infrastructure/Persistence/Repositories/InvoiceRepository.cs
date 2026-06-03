using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Common.Interfaces;
using Domain.Entities;
using Domain.Enums;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence.Repositories
{
    public class InvoiceRepository : IInvoiceRepository
    {
        private readonly ApplicationDbContext _context;

        public InvoiceRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<Invoice>> GetUnpaidInvoicesByContractAsync(int contractId)
        {
            return await _context.Invoices
                .Where(i => i.ContractId == contractId && (i.Status == InvoiceStatus.Unpaid || i.Status == InvoiceStatus.Overdue))
                .ToListAsync();
        }
    }
}
