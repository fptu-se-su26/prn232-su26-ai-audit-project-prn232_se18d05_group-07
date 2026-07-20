using Application.Common.DTOs.Favorites;
using Application.Common.Interfaces;
using Application.Services;
using Microsoft.AspNetCore.Authorization;
using RoomHub.API.Controllers;
using RoomHub.Domain.Entities;
using Xunit;

namespace RoomHub.Application.Tests;

public sealed class FavoriteRoomServiceTests
{
    [Fact]
    public async Task AddAsync_CalledTwice_DelegatesIdempotentAddForSameTenantAndRoom()
    {
        var repository = new FakeFavoriteRoomRepository { RoomExists = true };
        var service = new FavoriteRoomService(repository);

        await service.AddAsync("tenant-a", 12);
        await service.AddAsync("tenant-a", 12);

        Assert.Single(repository.Favorites);
        Assert.Contains(("tenant-a", 12), repository.Favorites);
    }

    [Fact]
    public async Task AddAsync_InvalidOrDeletedListing_ThrowsNotFound()
    {
        var service = new FavoriteRoomService(new FakeFavoriteRoomRepository { RoomExists = false });

        await Assert.ThrowsAsync<KeyNotFoundException>(() => service.AddAsync("tenant-a", 99));
    }

    [Fact]
    public async Task RemoveAsync_UsesAuthenticatedTenantIdSoOtherTenantsFavoriteIsUntouched()
    {
        var repository = new FakeFavoriteRoomRepository { RoomExists = true };
        repository.Favorites.Add(("tenant-a", 4));
        repository.Favorites.Add(("tenant-b", 4));
        var service = new FavoriteRoomService(repository);

        await service.RemoveAsync("tenant-a", 4);

        Assert.DoesNotContain(("tenant-a", 4), repository.Favorites);
        Assert.Contains(("tenant-b", 4), repository.Favorites);
    }

    [Fact]
    public void Controller_IsRestrictedToTenantRole()
    {
        var attribute = Assert.Single(typeof(TenantFavoritesController)
            .GetCustomAttributes(typeof(AuthorizeAttribute), true).Cast<AuthorizeAttribute>());

        Assert.Equal("Tenant", attribute.Roles);
    }

    private sealed class FakeFavoriteRoomRepository : IFavoriteRoomRepository
    {
        public bool RoomExists { get; init; }
        public HashSet<(string UserId, int RoomId)> Favorites { get; } = [];

        public Task<(IReadOnlyList<FavoriteRoom> Items, int Total)> GetPageAsync(string userId, int page, int pageSize, CancellationToken cancellationToken = default) =>
            Task.FromResult<(IReadOnlyList<FavoriteRoom>, int)>(([], 0));

        public Task<IReadOnlyList<int>> GetRoomIdsAsync(string userId, CancellationToken cancellationToken = default) =>
            Task.FromResult<IReadOnlyList<int>>(Favorites.Where(x => x.UserId == userId).Select(x => x.RoomId).ToList());

        public Task<bool> ExistsAsync(string userId, int roomId, CancellationToken cancellationToken = default) =>
            Task.FromResult(Favorites.Contains((userId, roomId)));

        public Task<bool> RoomCanBeFavoritedAsync(int roomId, CancellationToken cancellationToken = default) => Task.FromResult(RoomExists);

        public Task AddIfMissingAsync(string userId, int roomId, CancellationToken cancellationToken = default)
        {
            Favorites.Add((userId, roomId));
            return Task.CompletedTask;
        }

        public Task RemoveIfPresentAsync(string userId, int roomId, CancellationToken cancellationToken = default)
        {
            Favorites.Remove((userId, roomId));
            return Task.CompletedTask;
        }
    }
}
