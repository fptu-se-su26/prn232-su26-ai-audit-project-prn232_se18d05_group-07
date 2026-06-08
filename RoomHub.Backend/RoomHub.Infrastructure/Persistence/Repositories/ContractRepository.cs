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
    public class ContractRepository : IContractRepository
    {
        private readonly ApplicationDbContext _context;

        public ContractRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Contract?> GetByIdAsync(int id)
        {
            return await _context.Contracts.FindAsync(id);
        }

        public async Task<Contract?> GetActiveContractByRoomIdAsync(int roomId)
        {
            return await _context.Contracts
                .Include(c => c.Room)
                .Include(c => c.Tenant)
                .FirstOrDefaultAsync(c => c.RoomId == roomId && c.Status == ContractStatus.Active && !c.IsDeleted);
        }

        public async Task<Contract?> GetContractWithRoomAndTenantAsync(int id)
        {
            return await _context.Contracts
                .Include(c => c.Room)
                    .ThenInclude(r => r.Floor)
                        .ThenInclude(f => f.Building)
                .Include(c => c.Tenant)
                .FirstOrDefaultAsync(c => c.Id == id && !c.IsDeleted);
        }

        public async Task<List<Contract>> GetContractsByOwnerAsync(string ownerId)
        {
            return await _context.Contracts
                .Include(c => c.Room)
                    .ThenInclude(r => r.Floor)
                        .ThenInclude(f => f.Building)
                .Include(c => c.Tenant)
                .Where(c => c.OwnerId == ownerId && !c.IsDeleted)
                .ToListAsync();
        }

        public async Task<ApplicationUser?> GetTenantByContactAsync(string contact)
        {
            return await _context.Users
                .Include(u => u.TenantProfile)
                .FirstOrDefaultAsync(u => u.Email == contact || u.PhoneNumber == contact);
        }

        public async Task<Contract?> GetActiveContractByTenantIdAsync(string tenantId)
        {
            return await _context.Contracts
                .Include(c => c.Room)
                    .ThenInclude(r => r.Floor)
                        .ThenInclude(f => f.Building)
                .Include(c => c.Room.RoomPhotos)
                .Include(c => c.Owner)
                .FirstOrDefaultAsync(c => c.TenantId == tenantId && 
                    (c.Status == ContractStatus.Active || c.Status == ContractStatus.Pending) && 
                    !c.IsDeleted);
        }

        public async Task AddAsync(Contract contract)
        {
            await _context.Contracts.AddAsync(contract);
        }

        public async Task UpdateAsync(Contract contract)
        {
            _context.Contracts.Update(contract);
            await Task.CompletedTask;
        }
    }
}
