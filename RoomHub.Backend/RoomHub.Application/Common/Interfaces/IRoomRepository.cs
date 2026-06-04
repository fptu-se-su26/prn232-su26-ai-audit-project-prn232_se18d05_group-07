using System.Collections.Generic;
using System.Threading.Tasks;
using Domain.Entities;

namespace Application.Common.Interfaces
{
    public interface IRoomRepository
    {
        Task<Room?> GetByIdAsync(int id);
        Task<Room?> GetRoomWithDetailsAsync(int id);
        Task<List<Room>> GetRoomsByBuildingAsync(int buildingId);
        Task AddAsync(Room room);
        Task AddRangeAsync(IEnumerable<Room> rooms);
        Task UpdateAsync(Room room);
    }
}
