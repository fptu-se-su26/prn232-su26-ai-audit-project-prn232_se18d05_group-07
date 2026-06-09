using System;
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
                .Include(r => r.Floor)
                    .ThenInclude(f => f.Building)
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

        public async Task<List<Room>> GetListingsByModerationStatusAsync(ModerationStatus? status = null)
        {
            var query = _context.Rooms
                .Where(r => !r.IsDeleted && r.HasListing)
                .Include(r => r.Floor)
                    .ThenInclude(f => f.Building)
                        .ThenInclude(b => b.Owner)
                .Include(r => r.RoomPhotos)
                .AsQueryable();

            if (status.HasValue)
                query = query.Where(r => r.ModerationStatus == status.Value);

            return await query
                .OrderByDescending(r => r.ModeratedAt ?? r.UpdatedAt ?? r.CreatedAt)
                .ToListAsync();
        }

        public async Task<Room?> FindVacantRoomInBuildingAsync(int buildingId, int excludeRoomId)
        {
            return await _context.Rooms
                .Include(r => r.RoomPhotos)
                .Where(r =>
                    !r.IsDeleted &&
                    !r.HasListing &&
                    r.Id != excludeRoomId &&
                    r.Floor.BuildingId == buildingId)
                .OrderBy(r => r.RoomNumber)
                .FirstOrDefaultAsync();
        }

        public async Task<int> CountListingsByModerationStatusAsync(ModerationStatus status)
        {
            return await _context.Rooms.CountAsync(r =>
                !r.IsDeleted && r.HasListing && r.ModerationStatus == status);
        }

        public async Task<int> CountListingsModeratedSinceAsync(ModerationStatus status, DateTime since)
        {
            return await _context.Rooms.CountAsync(r =>
                !r.IsDeleted &&
                r.HasListing &&
                r.ModerationStatus == status &&
                r.ModeratedAt >= since);
        }
    }
}
