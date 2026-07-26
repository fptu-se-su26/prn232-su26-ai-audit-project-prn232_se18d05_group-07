using Application.Common.DTOs.Listings;
using Application.Common.DTOs.Recommendations;
using Application.Common.Interfaces;
using Application.Services;
using Domain.Entities;
using Domain.Enums;
using Xunit;
using FavoriteRoomEntity = RoomHub.Domain.Entities.FavoriteRoom;

namespace RoomHub.Application.Tests;

public sealed class RecommendationServiceTests
{
    private const string User = "tenant-a";

    // ==========================================
    // 1. KHÁCH VÃNG LAI
    // ==========================================
    [Fact]
    public async Task GetForYou_AnonymousVisitor_FallsBackToFeaturedWithoutFailing()
    {
        var rooms = new List<Room>
        {
            PublishedRoom(1, "Hải Châu", 3_000_000m, listingScore: 60),
            PublishedRoom(2, "Sơn Trà", 4_000_000m, listingScore: 95),
        };
        var service = BuildService(rooms);

        var result = await service.GetForYouAsync(null, 6);

        Assert.Equal(RecommendationStrategy.Featured, result.Strategy);
        Assert.Equal(2, result.Items.Count);
        Assert.Equal(2, result.Items[0].Id);            // ListingScore cao nhất lên đầu
    }

    [Fact]
    public async Task GetForYou_SignedInButNoHistory_FallsBackToFeatured()
    {
        var service = BuildService(new List<Room> { PublishedRoom(1, "Hải Châu", 3_000_000m) });

        var result = await service.GetForYouAsync(User, 6);

        Assert.Equal(RecommendationStrategy.Featured, result.Strategy);
        Assert.Single(result.Items);
    }

    // ==========================================
    // 2. CÓ KHẨU VỊ
    // ==========================================
    [Fact]
    public async Task GetForYou_RanksSameDistrictAndSimilarPriceHigher()
    {
        var favorite = PublishedRoom(10, "Hải Châu", 3_000_000m);
        var rooms = new List<Room>
        {
            favorite,
            PublishedRoom(11, "Hải Châu", 3_100_000m),      // cùng quận, cùng tầm giá
            PublishedRoom(12, "Liên Chiểu", 9_000_000m),    // khác quận, lệch giá
        };
        var service = BuildService(rooms, favorites: new[] { favorite });

        var result = await service.GetForYouAsync(User, 6);

        Assert.Equal(RecommendationStrategy.Personalized, result.Strategy);
        Assert.Equal(11, result.Items[0].Id);
        Assert.True(result.Items[0].MatchScore > result.Items.Last().MatchScore);
        Assert.Contains("Hải Châu", result.Items[0].Reason);
    }

    [Fact]
    public async Task GetForYou_ExcludesRoomsAlreadySavedOrViewed()
    {
        var favorite = PublishedRoom(10, "Hải Châu", 3_000_000m);
        var viewed = PublishedRoom(11, "Hải Châu", 3_050_000m);
        var fresh = PublishedRoom(12, "Hải Châu", 3_100_000m);
        var service = BuildService(
            new List<Room> { favorite, viewed, fresh },
            favorites: new[] { favorite },
            viewed: new[] { viewed });

        var result = await service.GetForYouAsync(User, 6);

        Assert.DoesNotContain(result.Items, r => r.Id == 10);
        Assert.DoesNotContain(result.Items, r => r.Id == 11);
        Assert.Contains(result.Items, r => r.Id == 12);
    }

    [Fact]
    public async Task GetForYou_WeighsSavedRoomsAboveMerelyViewedRooms()
    {
        // Đã lưu ở tầm 3 triệu (trọng số 3), chỉ xem ở tầm 9 triệu (trọng số 1)
        // → khẩu vị phải nghiêng về 3 triệu.
        var favorite = PublishedRoom(10, "Hải Châu", 3_000_000m);
        var viewed = PublishedRoom(11, "Hải Châu", 9_000_000m);
        var cheapCandidate = PublishedRoom(20, "Hải Châu", 3_100_000m);
        var pricyCandidate = PublishedRoom(21, "Hải Châu", 9_100_000m);

        var service = BuildService(
            new List<Room> { favorite, viewed, cheapCandidate, pricyCandidate },
            favorites: new[] { favorite },
            viewed: new[] { viewed });

        var result = await service.GetForYouAsync(User, 6);

        Assert.Equal(20, result.Items[0].Id);
        Assert.True(
            result.Items.Single(r => r.Id == 20).MatchScore >
            result.Items.Single(r => r.Id == 21).MatchScore);
    }

    // ==========================================
    // 3. PHÒNG TƯƠNG TỰ
    // ==========================================
    [Fact]
    public async Task GetSimilar_NeverReturnsTheAnchorRoomItself()
    {
        var anchor = PublishedRoom(1, "Hải Châu", 3_000_000m);
        var service = BuildService(new List<Room>
        {
            anchor,
            PublishedRoom(2, "Hải Châu", 3_200_000m),
        });

        var result = await service.GetSimilarAsync(1, 6);

        Assert.Equal(RecommendationStrategy.Similar, result.Strategy);
        Assert.DoesNotContain(result.Items, r => r.Id == 1);
        Assert.Contains(result.Items, r => r.Id == 2);
    }

    [Fact]
    public async Task GetSimilar_PrefersSameDistrictAndComparablePrice()
    {
        var anchor = PublishedRoom(1, "Hải Châu", 3_000_000m, type: RoomType.Studio);
        var service = BuildService(new List<Room>
        {
            anchor,
            PublishedRoom(2, "Hải Châu", 3_100_000m, type: RoomType.Studio),
            PublishedRoom(3, "Cẩm Lệ", 3_050_000m, type: RoomType.Apartment),
        });

        var result = await service.GetSimilarAsync(1, 6);

        Assert.Equal(2, result.Items[0].Id);
        Assert.True(result.Items[0].MatchScore > result.Items.Last().MatchScore);
    }

    [Fact]
    public async Task GetSimilar_HiddenOrUnapprovedRoomsAreNeverSuggested()
    {
        var anchor = PublishedRoom(1, "Hải Châu", 3_000_000m);
        var hidden = PublishedRoom(2, "Hải Châu", 3_100_000m);
        hidden.HiddenByOwner = true;
        var pending = PublishedRoom(3, "Hải Châu", 3_100_000m);
        pending.ModerationStatus = ModerationStatus.Pending;

        var service = BuildService(new List<Room> { anchor, hidden, pending });

        var result = await service.GetSimilarAsync(1, 6);

        Assert.Empty(result.Items);
    }

    // ==========================================
    // 4. KHÔNG CÓ DỮ LIỆU
    // ==========================================
    [Fact]
    public async Task Recommendations_WithNoCandidates_ReturnEmptyInsteadOfThrowing()
    {
        var service = BuildService(new List<Room>());

        var forYou = await service.GetForYouAsync(User, 6);
        var similar = await service.GetSimilarAsync(999, 6);

        Assert.Empty(forYou.Items);
        Assert.Empty(similar.Items);
    }

    // ==========================================
    // Dựng dữ liệu thử
    // ==========================================
    private static RecommendationService BuildService(
        List<Room> rooms,
        IEnumerable<Room>? favorites = null,
        IEnumerable<Room>? viewed = null)
    {
        var favoriteEntities = (favorites ?? Enumerable.Empty<Room>())
            .Select(r => new FavoriteRoomEntity { UserId = User, RoomId = r.Id, Room = r })
            .ToList();

        var history = (viewed ?? Enumerable.Empty<Room>())
            .Select(r => new SearchHistory { UserId = User, ViewedRoomId = r.Id, ViewedRoom = r })
            .ToList();

        return new RecommendationService(
            new FakeRoomRepository { Rooms = rooms },
            new FakeFavoriteRoomRepository { Favorites = favoriteEntities },
            new FakeSearchHistoryRepository { History = history });
    }

    private static Room PublishedRoom(
        int id, string district, decimal price,
        RoomType type = RoomType.BoardingHouse, decimal area = 25m, int listingScore = 50) =>
        new()
        {
            Id = id,
            Title = $"Phòng {id} {district}",
            RoomNumber = $"P{id}",
            BasePrice = price,
            SurfaceArea = area,
            RoomType = type,
            MaxCapacity = 2,
            ListingScore = listingScore,
            HasListing = true,
            IsPublished = true,
            HiddenByOwner = false,
            IsDeleted = false,
            ModerationStatus = ModerationStatus.Approved,
            CreatedAt = DateTime.UtcNow.AddDays(-id),
            Floor = new Floor
            {
                BuildingId = id,
                Building = new Building
                {
                    Id = id,
                    Name = $"Nhà trọ {id}",
                    District = district,
                    Ward = "Hòa Thuận",
                    City = "Đà Nẵng",
                    Address = "12 Nguyễn Văn Linh"
                }
            }
        };

    // ==========================================
    // Fake repository (dự án không dùng Moq)
    // ==========================================
    private sealed class FakeRoomRepository : IRoomRepository
    {
        public List<Room> Rooms { get; init; } = new();

        public Task<(List<Room> Rooms, int TotalCount)> SearchPublicListingsAsync(PublicListingFilterRequest filter)
        {
            var query = Rooms.Where(r =>
                !r.IsDeleted && r.HasListing && r.IsPublished
                && r.ModerationStatus == ModerationStatus.Approved);

            if (!string.IsNullOrEmpty(filter.District))
                query = query.Where(r =>
                    r.Floor.Building.District.Contains(filter.District, StringComparison.OrdinalIgnoreCase));

            var list = query.OrderByDescending(r => r.ListingScore)
                            .Take(Math.Clamp(filter.PageSize, 1, 50))
                            .ToList();
            return Task.FromResult((list, list.Count));
        }

        public Task<Room?> GetPublicListingDetailAsync(int id) =>
            Task.FromResult(Rooms.FirstOrDefault(r => r.Id == id));

        public Task<Room?> GetByIdAsync(int id) => throw new NotSupportedException();
        public Task<Room?> GetRoomWithDetailsAsync(int id) => throw new NotSupportedException();
        public Task<List<Room>> GetRoomsByBuildingAsync(int buildingId) => throw new NotSupportedException();
        public Task<List<Room>> GetListingsByModerationStatusAsync(ModerationStatus? status = null) => throw new NotSupportedException();
        public Task<Room?> FindVacantRoomInBuildingAsync(int buildingId, int excludeRoomId) => throw new NotSupportedException();
        public Task<int> CountListingsByModerationStatusAsync(ModerationStatus status) => throw new NotSupportedException();
        public Task<int> CountListingsModeratedSinceAsync(ModerationStatus status, DateTime since) => throw new NotSupportedException();
        public Task AddAsync(Room room) => throw new NotSupportedException();
        public Task AddRangeAsync(IEnumerable<Room> rooms) => throw new NotSupportedException();
        public Task UpdateAsync(Room room) => throw new NotSupportedException();
    }

    private sealed class FakeFavoriteRoomRepository : IFavoriteRoomRepository
    {
        public List<FavoriteRoomEntity> Favorites { get; init; } = new();

        public Task<(IReadOnlyList<FavoriteRoomEntity> Items, int Total)> GetPageAsync(
            string userId, int page, int pageSize, CancellationToken cancellationToken = default)
        {
            var items = Favorites.Where(f => f.UserId == userId).Take(pageSize).ToList();
            return Task.FromResult(((IReadOnlyList<FavoriteRoomEntity>)items, items.Count));
        }

        public Task<IReadOnlyList<int>> GetRoomIdsAsync(string userId, CancellationToken cancellationToken = default) =>
            Task.FromResult((IReadOnlyList<int>)Favorites.Where(f => f.UserId == userId).Select(f => f.RoomId).ToList());

        public Task<bool> ExistsAsync(string userId, int roomId, CancellationToken cancellationToken = default) => throw new NotSupportedException();
        public Task<bool> RoomCanBeFavoritedAsync(int roomId, CancellationToken cancellationToken = default) => throw new NotSupportedException();
        public Task AddIfMissingAsync(string userId, int roomId, CancellationToken cancellationToken = default) => throw new NotSupportedException();
        public Task RemoveIfPresentAsync(string userId, int roomId, CancellationToken cancellationToken = default) => throw new NotSupportedException();
    }

    private sealed class FakeSearchHistoryRepository : ISearchHistoryRepository
    {
        public List<SearchHistory> History { get; init; } = new();

        public Task<List<SearchHistory>> GetByUserIdAsync(string userId) =>
            Task.FromResult(History.Where(h => h.UserId == userId).ToList());

        public Task<SearchHistory?> GetByIdAsync(long id) => throw new NotSupportedException();
        public Task AddAsync(SearchHistory searchHistory) => throw new NotSupportedException();
        public Task DeleteAsync(SearchHistory searchHistory) => throw new NotSupportedException();
        public Task ClearByUserIdAsync(string userId) => throw new NotSupportedException();
    }
}
