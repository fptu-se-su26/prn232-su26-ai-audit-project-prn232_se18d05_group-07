using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Common.Interfaces;
using Domain.Entities;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence.Repositories
{
    public class RoomRepository : IRoomRepository
    {
        private readonly ApplicationDbContext _context;

        public RoomRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Room?> GetByIdAsync(int id)
        {
            return await _context.Rooms.FindAsync(id);
        }

        public async Task<List<Room>> GetRoomsByBuildingAsync(int buildingId)
        {
            return await _context.Rooms
                .Where(r => r.Floor.BuildingId == buildingId && !r.IsDeleted)
                .ToListAsync();
        }

        public async Task<Room?> GetRoomWithDetailsAsync(int id)
        {
            return await _context.Rooms
                .Include(r => r.Floor)
                    .ThenInclude(f => f.Building)
                        .ThenInclude(b => b.Owner)
                .Include(r => r.Contracts)
                    .ThenInclude(c => c.Tenant)
                        .ThenInclude(u => u.TenantProfile)
                .Include(r => r.Contracts)
                    .ThenInclude(c => c.Invoices)
                .Include(r => r.RoomPhotos)
                .Include(r => r.RoomAmenities)
                .FirstOrDefaultAsync(r => r.Id == id && !r.IsDeleted);
        }

        public async Task AddAsync(Room room)
        {
            await _context.Rooms.AddAsync(room);
        }

        public async Task AddRangeAsync(IEnumerable<Room> rooms)
        {
            await _context.Rooms.AddRangeAsync(rooms);
        }

        public async Task UpdateAsync(Room room)
        {
            _context.Rooms.Update(room);
            await Task.CompletedTask;
        }
    }
}
