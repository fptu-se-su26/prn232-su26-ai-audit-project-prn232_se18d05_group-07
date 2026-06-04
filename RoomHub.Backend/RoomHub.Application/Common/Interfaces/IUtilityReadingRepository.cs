using System.Collections.Generic;
using System.Threading.Tasks;
using Domain.Entities;
using Domain.Enums;

namespace Application.Common.Interfaces
{
    public interface IUtilityReadingRepository
    {
        Task<UtilityReading?> GetLastReadingForContractAsync(int contractId, UtilityType type);
        Task<List<UtilityReading>> GetReadingsByContractAsync(int contractId);
        Task AddAsync(UtilityReading reading);
        Task AddRangeAsync(IEnumerable<UtilityReading> readings);
    }
}
