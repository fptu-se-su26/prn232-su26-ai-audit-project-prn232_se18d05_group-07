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
    public class ServiceRequestRepository : IServiceRequestRepository
    {
        private readonly ApplicationDbContext _context;

        public ServiceRequestRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Contract?> GetActiveContractForTenantAsync(string tenantId)
        {
            return await _context.Contracts
                .Include(c => c.Room)
                .Where(c => c.TenantId == tenantId && c.Status == ContractStatus.Active && !c.IsDeleted)
                .OrderByDescending(c => c.CreatedAt)
                .FirstOrDefaultAsync();
        }

        public async Task<Service?> GetServiceAsync(int serviceId)
        {
            return await _context.Services.FindAsync(serviceId);
        }

        public async Task<ServiceRequest?> GetByIdAsync(int id)
        {
            return await _context.ServiceRequests
                .Include(r => r.Service)
                .Include(r => r.Contract).ThenInclude(c => c.Room)
                .Include(r => r.Contract).ThenInclude(c => c.Tenant)
                .FirstOrDefaultAsync(r => r.Id == id);
        }

        public async Task<List<ServiceRequest>> GetByTenantIdAsync(string tenantId)
        {
            return await _context.ServiceRequests
                .Include(r => r.Service)
                .Include(r => r.Contract).ThenInclude(c => c.Room)
                .Where(r => r.Contract.TenantId == tenantId)
                .OrderByDescending(r => r.RequestDate)
                .ToListAsync();
        }

        public async Task<List<ServiceRequest>> GetByOwnerIdAsync(string ownerId)
        {
            return await _context.ServiceRequests
                .Include(r => r.Service)
                .Include(r => r.Contract).ThenInclude(c => c.Room)
                .Include(r => r.Contract).ThenInclude(c => c.Tenant)
                .Where(r => r.Contract.OwnerId == ownerId)
                .OrderByDescending(r => r.RequestDate)
                .ToListAsync();
        }

        public async Task AddAsync(ServiceRequest request)
        {
            await _context.ServiceRequests.AddAsync(request);
        }

        public async Task UpdateAsync(ServiceRequest request)
        {
            _context.ServiceRequests.Update(request);
            await Task.CompletedTask;
        }

        public async Task DeleteAsync(ServiceRequest request)
        {
            _context.ServiceRequests.Remove(request);
            await Task.CompletedTask;
        }
    }
}
