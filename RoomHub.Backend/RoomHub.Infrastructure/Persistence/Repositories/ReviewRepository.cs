using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Common.Interfaces;
using Domain.Entities;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence.Repositories
{
    public class ReviewRepository : IReviewRepository
    {
        private readonly ApplicationDbContext _context;

        public ReviewRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Review?> GetByIdAsync(int id)
        {
            return await _context.Reviews
                .Include(r => r.Tenant)
                .Include(r => r.Room)
                .FirstOrDefaultAsync(r => r.Id == id);
        }

        public async Task<List<Review>> GetByRoomIdAsync(int roomId)
        {
            return await _context.Reviews
                .Include(r => r.Tenant)
                .Where(r => r.RoomId == roomId)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();
        }

        public async Task<List<Review>> GetByTenantIdAsync(string tenantId)
        {
            return await _context.Reviews
                .Include(r => r.Tenant)
                .Include(r => r.Room)
                .Where(r => r.TenantId == tenantId)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();
        }

        public async Task<bool> HasTenantReviewedRoomAsync(string tenantId, int roomId)
        {
            return await _context.Reviews
                .AnyAsync(r => r.TenantId == tenantId && r.RoomId == roomId);
        }

        public async Task<Room?> GetRoomAsync(int roomId)
        {
            return await _context.Rooms
                .FirstOrDefaultAsync(r => r.Id == roomId && !r.IsDeleted);
        }

        public async Task AddAsync(Review review)
        {
            await _context.Reviews.AddAsync(review);
        }

        public async Task DeleteAsync(Review review)
        {
            _context.Reviews.Remove(review);
            await Task.CompletedTask;
        }
    }
}
