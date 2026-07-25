using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Common.Interfaces;
using Domain.Entities;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence.Repositories
{
    public class MaintenanceTicketRepository : IMaintenanceTicketRepository
    {
        private readonly ApplicationDbContext _context;

        public MaintenanceTicketRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<MaintenanceTicket?> GetByIdAsync(int id)
        {
            return await _context.MaintenanceTickets
                .Include(t => t.Room)
                .FirstOrDefaultAsync(t => t.Id == id);
        }

        public async Task<List<MaintenanceTicket>> GetByTenantIdAsync(string tenantId)
        {
            return await _context.MaintenanceTickets
                .Include(t => t.Room)
                .Where(t => t.TenantId == tenantId)
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync();
        }

        public async Task AddAsync(MaintenanceTicket ticket)
        {
            await _context.MaintenanceTickets.AddAsync(ticket);
        }

        public async Task DeleteAsync(MaintenanceTicket ticket)
        {
            _context.MaintenanceTickets.Remove(ticket);
            await Task.CompletedTask;
        }
    }
}
