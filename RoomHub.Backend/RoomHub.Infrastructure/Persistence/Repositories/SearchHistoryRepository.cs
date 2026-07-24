using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Common.Interfaces;
using Domain.Entities;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence.Repositories
{
    public class SearchHistoryRepository : ISearchHistoryRepository
    {
        private readonly ApplicationDbContext _context;

        public SearchHistoryRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<SearchHistory>> GetByUserIdAsync(string userId)
        {
            return await _context.SearchHistories
                .Include(s => s.ViewedRoom)
                .Where(s => s.UserId == userId)
                .OrderByDescending(s => s.Timestamp)
                .ToListAsync();
        }

        public async Task<SearchHistory?> GetByIdAsync(long id)
        {
            return await _context.SearchHistories.FindAsync(id);
        }

        public async Task AddAsync(SearchHistory searchHistory)
        {
            await _context.SearchHistories.AddAsync(searchHistory);
        }

        public async Task DeleteAsync(SearchHistory searchHistory)
        {
            _context.SearchHistories.Remove(searchHistory);
            await Task.CompletedTask;
        }

        public async Task ClearByUserIdAsync(string userId)
        {
            var items = await _context.SearchHistories
                .Where(s => s.UserId == userId)
                .ToListAsync();
            _context.SearchHistories.RemoveRange(items);
        }
    }
}
