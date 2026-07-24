using Application.Common.DTOs.Favorites;
using Application.Common.Interfaces;
using Domain.Enums;

namespace Application.Services;

public sealed class FavoriteRoomService(IFavoriteRoomRepository repository) : IFavoriteRoomService
{
    public async Task<FavoriteRoomPageDto> GetAsync(string userId, int page, int pageSize, CancellationToken cancellationToken = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 50);
        var (items, total) = await repository.GetPageAsync(userId, page, pageSize, cancellationToken);
        var result = items.Select(f => new FavoriteRoomDto(
            f.RoomId,
            f.Room.Title,
            f.Room.RoomType.ToString(),
            $"{f.Room.Floor.Building.Address}, {f.Room.Floor.Building.Ward}, {f.Room.Floor.Building.District}, {f.Room.Floor.Building.City}",
            f.Room.Floor.Building.District,
            f.Room.BasePrice,
            f.Room.RoomPhotos.OrderBy(p => p.DisplayOrder).Select(p => p.Url).FirstOrDefault(),
            f.Room.Status,
            f.Room.HasListing && f.Room.IsPublished && !f.Room.HiddenByOwner && f.Room.ModerationStatus == ModerationStatus.Approved,
            f.CreatedAt)).ToList();

        return new FavoriteRoomPageDto(result, page, pageSize, total, (int)Math.Ceiling(total / (double)pageSize));
    }

    public Task<IReadOnlyList<int>> GetIdsAsync(string userId, CancellationToken cancellationToken = default) =>
        repository.GetRoomIdsAsync(userId, cancellationToken);

    public async Task<FavoriteStatusDto> GetStatusAsync(string userId, int roomId, CancellationToken cancellationToken = default) =>
        new(await repository.ExistsAsync(userId, roomId, cancellationToken));

    public async Task AddAsync(string userId, int roomId, CancellationToken cancellationToken = default)
    {
        if (!await repository.RoomCanBeFavoritedAsync(roomId, cancellationToken))
            throw new KeyNotFoundException("Không tìm thấy phòng có tin đăng hợp lệ.");
        await repository.AddIfMissingAsync(userId, roomId, cancellationToken);
    }

    public Task RemoveAsync(string userId, int roomId, CancellationToken cancellationToken = default) =>
        repository.RemoveIfPresentAsync(userId, roomId, cancellationToken);
}
