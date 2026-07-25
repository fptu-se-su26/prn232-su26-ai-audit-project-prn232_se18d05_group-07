using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Common.Interfaces;
using Domain.Entities;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence.Repositories
{
    public class BookingHistoryRepository : IBookingHistoryRepository
    {
        private readonly ApplicationDbContext _context;

        public BookingHistoryRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<BookingHistory>> GetByTenantIdAsync(string tenantId)
        {
            return await _context.BookingHistories
                .Include(b => b.Room)
                .Where(b => b.TenantId == tenantId)
                .OrderByDescending(b => b.BookedAt)
                .ToListAsync();
        }

        public async Task<BookingHistory?> GetByTenantAndRoomAsync(string tenantId, int roomId)
        {
            return await _context.BookingHistories
                .FirstOrDefaultAsync(b => b.TenantId == tenantId && b.RoomId == roomId);
        }

        public async Task<BookingHistory?> GetByIdAsync(long id)
        {
            return await _context.BookingHistories.FindAsync(id);
        }

        public async Task<Room?> GetRoomAsync(int roomId)
        {
            return await _context.Rooms
                .FirstOrDefaultAsync(r => r.Id == roomId && !r.IsDeleted);
        }

        public async Task AddAsync(BookingHistory bookingHistory)
        {
            await _context.BookingHistories.AddAsync(bookingHistory);
        }

        public async Task UpdateAsync(BookingHistory bookingHistory)
        {
            _context.BookingHistories.Update(bookingHistory);
            await Task.CompletedTask;
        }

        public async Task DeleteAsync(BookingHistory bookingHistory)
        {
            _context.BookingHistories.Remove(bookingHistory);
            await Task.CompletedTask;
        }

        public async Task ClearByTenantIdAsync(string tenantId)
        {
            var items = await _context.BookingHistories
                .Where(b => b.TenantId == tenantId)
                .ToListAsync();
            _context.BookingHistories.RemoveRange(items);
        }
    }
}
