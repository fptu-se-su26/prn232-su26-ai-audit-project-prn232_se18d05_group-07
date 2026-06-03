using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Common.Interfaces;
using Domain.Entities;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence.Repositories
{
    public class BuildingRepository : IBuildingRepository
    {
        private readonly ApplicationDbContext _context;

        public BuildingRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Building?> GetByIdAsync(int id)
        {
            return await _context.Buildings.FindAsync(id);
        }

        public async Task<Building?> GetByIdWithOwnerAsync(int id, string ownerId)
        {
            return await _context.Buildings
                .Include(b => b.Floors)
                    .ThenInclude(f => f.Rooms)
                        .ThenInclude(r => r.Contracts)
                .FirstOrDefaultAsync(b => b.Id == id && b.OwnerId == ownerId && !b.IsDeleted);
        }

        public async Task<List<Building>> GetBuildingsByOwnerAsync(string ownerId)
        {
            return await _context.Buildings
                .Include(b => b.Floors)
                    .ThenInclude(f => f.Rooms)
                .Where(b => b.OwnerId == ownerId && !b.IsDeleted)
                .ToListAsync();
        }

        public async Task AddAsync(Building building)
        {
            await _context.Buildings.AddAsync(building);
        }

        public async Task UpdateAsync(Building building)
        {
            _context.Buildings.Update(building);
            await Task.CompletedTask;
        }

        public async Task DeleteAsync(Building building)
        {
            building.IsDeleted = true;
            _context.Buildings.Update(building);
            await Task.CompletedTask;
        }
    }
}
