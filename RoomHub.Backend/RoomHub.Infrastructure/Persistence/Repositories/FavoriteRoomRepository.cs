using Application.Common.Interfaces;
using RoomHub.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence.Repositories;

public sealed class FavoriteRoomRepository(ApplicationDbContext context) : IFavoriteRoomRepository
{
    public async Task<(IReadOnlyList<FavoriteRoom> Items, int Total)> GetPageAsync(string userId, int page, int pageSize, CancellationToken cancellationToken = default)
    {
        var query = context.FavoriteRooms.AsNoTracking().Where(f => f.UserId == userId && !f.Room.IsDeleted);
        var total = await query.CountAsync(cancellationToken);
        var items = await query
            .Include(f => f.Room).ThenInclude(r => r.RoomPhotos)
            .Include(f => f.Room).ThenInclude(r => r.Floor).ThenInclude(f => f.Building)
            .OrderByDescending(f => f.CreatedAt)
            .Skip((page - 1) * pageSize).Take(pageSize)
            .ToListAsync(cancellationToken);
        return (items, total);
    }

    public async Task<IReadOnlyList<int>> GetRoomIdsAsync(string userId, CancellationToken cancellationToken = default) =>
        await context.FavoriteRooms.AsNoTracking().Where(f => f.UserId == userId).Select(f => f.RoomId).ToListAsync(cancellationToken);

    public Task<bool> ExistsAsync(string userId, int roomId, CancellationToken cancellationToken = default) =>
        context.FavoriteRooms.AnyAsync(f => f.UserId == userId && f.RoomId == roomId, cancellationToken);

    public Task<bool> RoomCanBeFavoritedAsync(int roomId, CancellationToken cancellationToken = default) =>
        context.Rooms.AnyAsync(r => r.Id == roomId && !r.IsDeleted && r.HasListing, cancellationToken);

    public async Task AddIfMissingAsync(string userId, int roomId, CancellationToken cancellationToken = default)
    {
        if (await ExistsAsync(userId, roomId, cancellationToken)) return;
        var favorite = new FavoriteRoom { UserId = userId, RoomId = roomId, CreatedAt = DateTime.UtcNow };
        context.FavoriteRooms.Add(favorite);
        try { await context.SaveChangesAsync(cancellationToken); }
        catch (DbUpdateException)
        {
            context.Entry(favorite).State = EntityState.Detached;
            if (!await ExistsAsync(userId, roomId, cancellationToken)) throw;
        }
    }

    public async Task RemoveIfPresentAsync(string userId, int roomId, CancellationToken cancellationToken = default)
    {
        var favorite = await context.FavoriteRooms.FindAsync([userId, roomId], cancellationToken);
        if (favorite is null) return;
        context.FavoriteRooms.Remove(favorite);
        await context.SaveChangesAsync(cancellationToken);
    }
}
