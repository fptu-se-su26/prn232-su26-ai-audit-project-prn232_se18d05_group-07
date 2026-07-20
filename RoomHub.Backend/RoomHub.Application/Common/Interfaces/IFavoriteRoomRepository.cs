using RoomHub.Domain.Entities;

namespace Application.Common.Interfaces;

public interface IFavoriteRoomRepository
{
    Task<(IReadOnlyList<FavoriteRoom> Items, int Total)> GetPageAsync(string userId, int page, int pageSize, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<int>> GetRoomIdsAsync(string userId, CancellationToken cancellationToken = default);
    Task<bool> ExistsAsync(string userId, int roomId, CancellationToken cancellationToken = default);
    Task<bool> RoomCanBeFavoritedAsync(int roomId, CancellationToken cancellationToken = default);
    Task AddIfMissingAsync(string userId, int roomId, CancellationToken cancellationToken = default);
    Task RemoveIfPresentAsync(string userId, int roomId, CancellationToken cancellationToken = default);
}
