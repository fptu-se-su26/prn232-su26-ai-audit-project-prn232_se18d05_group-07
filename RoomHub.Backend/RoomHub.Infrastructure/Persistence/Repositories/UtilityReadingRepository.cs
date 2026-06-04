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
    public class UtilityReadingRepository : IUtilityReadingRepository
    {
        private readonly ApplicationDbContext _context;

        public UtilityReadingRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<UtilityReading?> GetLastReadingForContractAsync(int contractId, UtilityType type)
        {
            return await _context.UtilityReadings
                .Where(ur => ur.ContractId == contractId && ur.UtilityType == type)
                .OrderByDescending(ur => ur.ReadingDate)
                .FirstOrDefaultAsync();
        }

        public async Task<List<UtilityReading>> GetReadingsByContractAsync(int contractId)
        {
            return await _context.UtilityReadings
                .Where(ur => ur.ContractId == contractId)
                .OrderByDescending(ur => ur.ReadingDate)
                .ToListAsync();
        }

        public async Task AddAsync(UtilityReading reading)
        {
            await _context.UtilityReadings.AddAsync(reading);
        }

        public async Task AddRangeAsync(IEnumerable<UtilityReading> readings)
        {
            await _context.UtilityReadings.AddRangeAsync(readings);
        }
    }
}
