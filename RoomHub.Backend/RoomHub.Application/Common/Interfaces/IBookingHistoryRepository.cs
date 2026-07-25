using System.Collections.Generic;
using System.Threading.Tasks;
using Domain.Entities;

namespace Application.Common.Interfaces
{
    public interface IBookingHistoryRepository
    {
        Task<List<BookingHistory>> GetByTenantIdAsync(string tenantId);
        Task<BookingHistory?> GetByTenantAndRoomAsync(string tenantId, int roomId);
        Task<BookingHistory?> GetByIdAsync(long id);
        Task<Room?> GetRoomAsync(int roomId);
        Task AddAsync(BookingHistory bookingHistory);
        Task UpdateAsync(BookingHistory bookingHistory);
        Task DeleteAsync(BookingHistory bookingHistory);
        Task ClearByTenantIdAsync(string tenantId);
    }
}
