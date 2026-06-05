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

        public async Task<Invoice?> GetByIdAsync(int id)
        {
            return await _context.Invoices
                .Include(i => i.InvoiceItems)
                .Include(i => i.Contract)
                    .ThenInclude(c => c.Room)
                        .ThenInclude(r => r.Floor)
                            .ThenInclude(f => f.Building)
                .Include(i => i.Contract)
                    .ThenInclude(c => c.Tenant)
                .Include(i => i.Payments)
                .FirstOrDefaultAsync(i => i.Id == id);
        }

        public async Task<List<Invoice>> GetUnpaidInvoicesByContractAsync(int contractId)
        {
            return await _context.Invoices
                .Where(i => i.ContractId == contractId && (i.Status == InvoiceStatus.Unpaid || i.Status == InvoiceStatus.Overdue))
                .ToListAsync();
        }

        public async Task<List<Invoice>> GetInvoicesByOwnerAsync(string ownerId)
        {
            return await _context.Invoices
                .Include(i => i.Contract)
                    .ThenInclude(c => c.Room)
                .Where(i => i.Contract.OwnerId == ownerId)
                .OrderByDescending(i => i.InvoiceDate)
                .ToListAsync();
        }

        public async Task AddAsync(Invoice invoice)
        {
            await _context.Invoices.AddAsync(invoice);
        }

        public async Task UpdateAsync(Invoice invoice)
        {
            _context.Invoices.Update(invoice);
            await Task.CompletedTask;
        }
    }
}
