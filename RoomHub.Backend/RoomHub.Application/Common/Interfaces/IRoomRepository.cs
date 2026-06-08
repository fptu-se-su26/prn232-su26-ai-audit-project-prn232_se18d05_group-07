using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Domain.Entities;
using Domain.Enums;

namespace Application.Common.Interfaces
{
    public interface IRoomRepository
    {
        Task<Room?> GetByIdAsync(int id);
        Task<Room?> GetRoomWithDetailsAsync(int id);
        Task<List<Room>> GetRoomsByBuildingAsync(int buildingId);
        Task<List<Room>> GetListingsByModerationStatusAsync(ModerationStatus? status = null);
        Task<Room?> FindVacantRoomInBuildingAsync(int buildingId, int excludeRoomId);
        Task<int> CountListingsByModerationStatusAsync(ModerationStatus status);
        Task<int> CountListingsModeratedSinceAsync(ModerationStatus status, DateTime since);
        Task AddAsync(Room room);
        Task AddRangeAsync(IEnumerable<Room> rooms);
        Task UpdateAsync(Room room);
    }
}
