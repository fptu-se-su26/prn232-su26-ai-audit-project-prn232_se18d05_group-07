using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Common.DTOs.Listings;
using Application.Common.Interfaces;
using Domain.Entities;
using Domain.Enums;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence.Repositories
{
    public class RoomRepository : IRoomRepository
    {
        private readonly ApplicationDbContext _context;

        public RoomRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Room?> GetByIdAsync(int id)
        {
            return await _context.Rooms.FindAsync(id);
        }

        public async Task<List<Room>> GetRoomsByBuildingAsync(int buildingId)
        {
            return await _context.Rooms
                .Include(r => r.Floor)
                    .ThenInclude(f => f.Building)
                .Where(r => r.Floor.BuildingId == buildingId && !r.IsDeleted)
                .ToListAsync();
        }

        public async Task<Room?> GetRoomWithDetailsAsync(int id)
        {
            return await _context.Rooms
                .Include(r => r.Floor)
                    .ThenInclude(f => f.Building)
                        .ThenInclude(b => b.Owner)
                .Include(r => r.Contracts)
                    .ThenInclude(c => c.Tenant)
                        .ThenInclude(u => u.TenantProfile)
                .Include(r => r.Contracts)
                    .ThenInclude(c => c.Invoices)
                .Include(r => r.RoomPhotos)
                .Include(r => r.RoomAmenities)
                .FirstOrDefaultAsync(r => r.Id == id && !r.IsDeleted);
        }

        public async Task AddAsync(Room room)
        {
            await _context.Rooms.AddAsync(room);
        }

        public async Task AddRangeAsync(IEnumerable<Room> rooms)
        {
            await _context.Rooms.AddRangeAsync(rooms);
        }

        public async Task UpdateAsync(Room room)
        {
            _context.Rooms.Update(room);
            await Task.CompletedTask;
        }

        public async Task<List<Room>> GetListingsByModerationStatusAsync(ModerationStatus? status = null)
        {
            var query = _context.Rooms
                .Where(r => !r.IsDeleted && r.HasListing)
                .Include(r => r.Floor)
                    .ThenInclude(f => f.Building)
                        .ThenInclude(b => b.Owner)
                .Include(r => r.RoomPhotos)
                .AsQueryable();

            if (status.HasValue)
                query = query.Where(r => r.ModerationStatus == status.Value);

            return await query
                .OrderByDescending(r => r.ModeratedAt ?? r.UpdatedAt ?? r.CreatedAt)
                .ToListAsync();
        }

        public async Task<Room?> FindVacantRoomInBuildingAsync(int buildingId, int excludeRoomId)
        {
            return await _context.Rooms
                .Include(r => r.RoomPhotos)
                .Where(r =>
                    !r.IsDeleted &&
                    !r.HasListing &&
                    r.Id != excludeRoomId &&
                    r.Floor.BuildingId == buildingId)
                .OrderBy(r => r.RoomNumber)
                .FirstOrDefaultAsync();
        }

        public async Task<int> CountListingsByModerationStatusAsync(ModerationStatus status)
        {
            return await _context.Rooms.CountAsync(r =>
                !r.IsDeleted && r.HasListing && r.ModerationStatus == status);
        }

        public async Task<int> CountListingsModeratedSinceAsync(ModerationStatus status, DateTime since)
        {
            return await _context.Rooms.CountAsync(r =>
                !r.IsDeleted &&
                r.HasListing &&
                r.ModerationStatus == status &&
                r.ModeratedAt >= since);
        }

        public async Task<(List<Room> Rooms, int TotalCount)> SearchPublicListingsAsync(PublicListingFilterRequest filter)
        {
            var page = Math.Max(1, filter.Page);
            var pageSize = Math.Clamp(filter.PageSize, 1, 50);

            var query = _context.Rooms
                .Include(r => r.Floor)
                    .ThenInclude(f => f.Building)
                        .ThenInclude(b => b.Owner)
                .Include(r => r.RoomPhotos)
                .Include(r => r.RoomAmenities)
                    .ThenInclude(ra => ra.Amenity)
                .Where(r => !r.IsDeleted && r.HasListing && r.IsPublished && r.ModerationStatus == ModerationStatus.Approved);

            if (!string.IsNullOrEmpty(filter.District) && filter.District != "Tất cả")
            {
                var normDistrict = filter.District.ToLower().Trim();
                query = query.Where(r => r.Floor.Building.District.ToLower().Contains(normDistrict));
            }

            if (filter.MinPrice.HasValue)
                query = query.Where(r => r.BasePrice >= filter.MinPrice.Value);
            if (filter.MaxPrice.HasValue)
                query = query.Where(r => r.BasePrice <= filter.MaxPrice.Value);

            if (filter.MinArea.HasValue)
                query = query.Where(r => r.SurfaceArea >= filter.MinArea.Value);
            if (filter.MaxArea.HasValue)
                query = query.Where(r => r.SurfaceArea <= filter.MaxArea.Value);

            if (!string.IsNullOrEmpty(filter.RoomType) && filter.RoomType != "Tất cả")
            {
                var parsedType = filter.RoomType switch
                {
                    "Phòng trọ" => RoomType.BoardingHouse,
                    "Studio" => RoomType.Studio,
                    "Căn hộ mini" => RoomType.MiniApartment,
                    "Căn hộ" => RoomType.Apartment,
                    _ => (RoomType?)null
                };

                if (parsedType.HasValue)
                    query = query.Where(r => r.RoomType == parsedType.Value);
            }

            if (!string.IsNullOrEmpty(filter.SearchQuery))
            {
                var search = filter.SearchQuery.ToLower().Trim();
                query = query.Where(r =>
                    r.Title.ToLower().Contains(search) ||
                    (r.Description != null && r.Description.ToLower().Contains(search)) ||
                    r.Floor.Building.Name.ToLower().Contains(search) ||
                    r.Floor.Building.Address.ToLower().Contains(search)
                );
            }

            if (!string.IsNullOrEmpty(filter.Amenities))
            {
                var amenityList = filter.Amenities.Split(',', StringSplitOptions.RemoveEmptyEntries)
                                           .Select(a => a.Trim().ToLower())
                                           .ToList();
                foreach (var amName in amenityList)
                {
                    query = query.Where(r => r.RoomAmenities.Any(ra => ra.Amenity.Name.ToLower().Contains(amName)));
                }
            }

            IOrderedQueryable<Room> orderedQuery = filter.SortBy switch
            {
                "priceAsc" => query.OrderBy(r => r.BasePrice).ThenByDescending(r => r.ListingScore),
                "priceDesc" => query.OrderByDescending(r => r.BasePrice).ThenByDescending(r => r.ListingScore),
                _ => query.OrderByDescending(r => r.ListingScore).ThenByDescending(r => r.CreatedAt)
            };

            var totalCount = await orderedQuery.CountAsync();
            var rooms = await orderedQuery
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (rooms, totalCount);
        }

        public async Task<Room?> GetPublicListingDetailAsync(int id)
        {
            return await _context.Rooms
                .Include(r => r.Floor)
                    .ThenInclude(f => f.Building)
                        .ThenInclude(b => b.Owner)
                .Include(r => r.RoomPhotos)
                .Include(r => r.RoomAmenities)
                    .ThenInclude(ra => ra.Amenity)
                .FirstOrDefaultAsync(r => r.Id == id && !r.IsDeleted);
        }
    }
}
