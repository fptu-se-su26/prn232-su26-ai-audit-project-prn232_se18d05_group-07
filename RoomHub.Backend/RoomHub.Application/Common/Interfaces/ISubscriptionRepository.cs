using System.Collections.Generic;
using System.Threading.Tasks;
using Domain.Entities;

namespace Application.Common.Interfaces
{
    public interface ISubscriptionRepository
    {
        Task<Subscription?> GetByIdAsync(int id);
        Task<List<Subscription>> GetPendingSubscriptionsAsync();
        Task AddAsync(Subscription subscription);
        Task UpdateAsync(Subscription subscription);
    }
}
