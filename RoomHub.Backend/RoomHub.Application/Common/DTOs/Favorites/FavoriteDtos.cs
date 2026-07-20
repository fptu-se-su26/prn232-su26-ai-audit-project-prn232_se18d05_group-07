using Domain.Enums;

namespace Application.Common.DTOs.Favorites;

public sealed record FavoriteRoomDto(
    int RoomId,
    string Title,
    string RoomType,
    string Address,
    string District,
    decimal Price,
    string? PhotoUrl,
    RoomStatus Status,
    bool IsListingVisible,
    DateTime FavoritedAt);

public sealed record FavoriteRoomPageDto(
    IReadOnlyList<FavoriteRoomDto> Items,
    int Page,
    int PageSize,
    int Total,
    int TotalPages);

public sealed record FavoriteStatusDto(bool IsFavorite);
