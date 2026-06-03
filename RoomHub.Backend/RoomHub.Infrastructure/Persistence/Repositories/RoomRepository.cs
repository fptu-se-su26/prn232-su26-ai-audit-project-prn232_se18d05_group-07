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
