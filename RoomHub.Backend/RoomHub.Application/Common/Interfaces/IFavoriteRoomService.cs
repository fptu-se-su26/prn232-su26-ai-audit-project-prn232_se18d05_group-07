using Application.Common.DTOs.Favorites;

namespace Application.Common.Interfaces;

public interface IFavoriteRoomService
{
    Task<FavoriteRoomPageDto> GetAsync(string userId, int page, int pageSize, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<int>> GetIdsAsync(string userId, CancellationToken cancellationToken = default);
    Task<FavoriteStatusDto> GetStatusAsync(string userId, int roomId, CancellationToken cancellationToken = default);
    Task AddAsync(string userId, int roomId, CancellationToken cancellationToken = default);
    Task RemoveAsync(string userId, int roomId, CancellationToken cancellationToken = default);
}
