using System.Collections.Generic;
using System.Threading.Tasks;
using Domain.Entities;

namespace Application.Common.Interfaces
{
    public interface ISearchHistoryRepository
    {
        Task<List<SearchHistory>> GetByUserIdAsync(string userId);
        Task<SearchHistory?> GetByIdAsync(long id);
        Task AddAsync(SearchHistory searchHistory);
        Task DeleteAsync(SearchHistory searchHistory);
        Task ClearByUserIdAsync(string userId);
    }
}
