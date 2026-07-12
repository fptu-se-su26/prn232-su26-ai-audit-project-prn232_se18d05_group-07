using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Domain.Entities;
using Domain.Enums;
using Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace RoomHub.API.Controllers
{
    [ApiController]
    [Route("api/public/listings")]
    public class PublicListingsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public PublicListingsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // ==========================================
        // 1. GET ALL PUBLIC APPROVED LISTINGS
        // ==========================================
        [HttpGet]
        public async Task<IActionResult> GetListings(
            [FromQuery] string? district = null,
            [FromQuery] decimal? minPrice = null,
            [FromQuery] decimal? maxPrice = null,
            [FromQuery] decimal? minArea = null,
            [FromQuery] decimal? maxArea = null,
            [FromQuery] string? roomType = null,
            [FromQuery] string? searchQuery = null,
            [FromQuery] string? amenities = null,
            [FromQuery] string? sortBy = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 12)
        {
            // Validate pagination
            page = Math.Max(1, page);
            pageSize = Math.Clamp(pageSize, 1, 50);

            var query = _context.Rooms
                .Include(r => r.Floor)
                    .ThenInclude(f => f.Building)
                        .ThenInclude(b => b.Owner)
                .Include(r => r.RoomPhotos)
                .Include(r => r.RoomAmenities)
                    .ThenInclude(ra => ra.Amenity)
                .Where(r => !r.IsDeleted && r.HasListing && r.IsPublished && r.ModerationStatus == ModerationStatus.Approved);

            // Filter by District
            if (!string.IsNullOrEmpty(district) && district != "Tất cả")
            {
                var normDistrict = district.ToLower().Trim();
                query = query.Where(r => r.Floor.Building.District.ToLower().Contains(normDistrict));
            }

            // Filter by Price
            if (minPrice.HasValue)
            {
                query = query.Where(r => r.BasePrice >= minPrice.Value);
            }
            if (maxPrice.HasValue)
            {
                query = query.Where(r => r.BasePrice <= maxPrice.Value);
            }

            // Filter by Area
            if (minArea.HasValue)
            {
                query = query.Where(r => r.SurfaceArea >= minArea.Value);
            }
            if (maxArea.HasValue)
            {
                query = query.Where(r => r.SurfaceArea <= maxArea.Value);
            }

            // Filter by Room Type
            if (!string.IsNullOrEmpty(roomType) && roomType != "Tất cả")
            {
                var parsedType = roomType switch
                {
                    "Phòng trọ" => RoomType.BoardingHouse,
                    "Studio" => RoomType.Studio,
                    "Căn hộ mini" => RoomType.MiniApartment,
                    "Căn hộ" => RoomType.Apartment,
                    _ => (RoomType?)null
                };

                if (parsedType.HasValue)
                {
                    query = query.Where(r => r.RoomType == parsedType.Value);
                }
            }

            // Filter by Keyword Search
            if (!string.IsNullOrEmpty(searchQuery))
            {
                var search = searchQuery.ToLower().Trim();
                query = query.Where(r => 
                    r.Title.ToLower().Contains(search) || 
                    (r.Description != null && r.Description.ToLower().Contains(search)) ||
                    r.Floor.Building.Name.ToLower().Contains(search) ||
                    r.Floor.Building.Address.ToLower().Contains(search)
                );
            }

            // Filter by Amenities (comma-separated list)
            if (!string.IsNullOrEmpty(amenities))
            {
                var amenityList = amenities.Split(',', StringSplitOptions.RemoveEmptyEntries)
                                           .Select(a => a.Trim().ToLower())
                                           .ToList();
                foreach (var amName in amenityList)
                {
                    query = query.Where(r => r.RoomAmenities.Any(ra => ra.Amenity.Name.ToLower().Contains(amName)));
                }
            }

            // Sorting
            IOrderedQueryable<Room> orderedQuery;
            if (sortBy == "priceAsc")
            {
                orderedQuery = query.OrderBy(r => r.BasePrice).ThenByDescending(r => r.ListingScore);
            }
            else if (sortBy == "priceDesc")
            {
                orderedQuery = query.OrderByDescending(r => r.BasePrice).ThenByDescending(r => r.ListingScore);
            }
            else
            {
                // default or newest: sort by ListingScore DESC first, then CreatedAt DESC
                orderedQuery = query.OrderByDescending(r => r.ListingScore).ThenByDescending(r => r.CreatedAt);
            }

            // Total count before pagination (for frontend pagination)
            var totalCount = await orderedQuery.CountAsync();
            var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

            // Apply pagination
            var rooms = await orderedQuery
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var items = rooms.Select(r => new
            {
                id = r.Id,
                title = r.Title,
                description = r.AIFormattedDescription ?? r.Description ?? "",
                type = r.RoomType switch
                {
                    RoomType.Studio => "Studio",
                    RoomType.MiniApartment => "Căn hộ mini",
                    RoomType.Apartment => "Căn hộ",
                    _ => "Phòng trọ"
                },
                location = $"{r.Floor.Building.Address}, {r.Floor.Building.Ward}, {r.Floor.Building.District}, {r.Floor.Building.City}",
                district = r.Floor.Building.District,
                price = (double)r.BasePrice,
                area = (double)(r.SurfaceArea ?? 25),
                maxPeople = r.MaxCapacity,
                image = r.RoomPhotos.OrderBy(p => p.DisplayOrder).Select(p => p.Url).FirstOrDefault() ?? "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
                amenities = r.RoomAmenities.Select(ra => ra.Amenity.Name).ToList(),
                isNew = (DateTime.UtcNow - r.CreatedAt).TotalDays <= 7
            }).ToList();

            return Ok(new
            {
                items,
                total = totalCount,
                page,
                pageSize,
                totalPages
            });
        }

        // ==========================================
        // 2. GET SINGLE PUBLIC LISTING BY ID
        // ==========================================
        [HttpGet("{id}")]
        public async Task<IActionResult> GetListingById(int id)
        {
            var room = await _context.Rooms
                .Include(r => r.Floor)
                    .ThenInclude(f => f.Building)
                        .ThenInclude(b => b.Owner)
                .Include(r => r.RoomPhotos)
                .Include(r => r.RoomAmenities)
                    .ThenInclude(ra => ra.Amenity)
                .FirstOrDefaultAsync(r => r.Id == id && !r.IsDeleted);

            if (room == null || !room.HasListing || !room.IsPublished)
            {
                return NotFound(new { message = "Không tìm thấy tin cho thuê hoặc tin đã bị ẩn." });
            }

            var electricity = room.ElectricityPrice ?? room.Floor.Building.ElectricityPrice;
            var water = room.WaterPrice ?? room.Floor.Building.WaterPrice;
            var internet = room.InternetPrice ?? room.Floor.Building.InternetPrice;
            var garbage = room.GarbagePrice ?? room.Floor.Building.GarbagePrice;

            var landlordName = room.Floor.Building.Owner.FullName ?? "Chủ nhà RoomHub";
            var landlordPhone = room.Floor.Building.Owner.PhoneNumber ?? "0905 *** ***";
            
            var result = new
            {
                id = room.Id,
                title = room.Title,
                description = room.AIFormattedDescription ?? room.Description ?? "",
                type = room.RoomType switch
                {
                    RoomType.Studio => "Studio",
                    RoomType.MiniApartment => "Căn hộ mini",
                    RoomType.Apartment => "Căn hộ",
                    _ => "Phòng trọ"
                },
                location = $"{room.Floor.Building.Address}, {room.Floor.Building.Ward}, {room.Floor.Building.District}, {room.Floor.Building.City}",
                district = room.Floor.Building.District,
                price = (double)room.BasePrice,
                area = (double)(room.SurfaceArea ?? 25),
                maxPeople = room.MaxCapacity,
                image = room.RoomPhotos.OrderBy(p => p.DisplayOrder).Select(p => p.Url).FirstOrDefault() ?? "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
                imageUrls = room.RoomPhotos.OrderBy(p => p.DisplayOrder).Select(p => p.Url).ToList(),
                amenities = room.RoomAmenities.Select(ra => ra.Amenity.Name).ToList(),
                electricityPrice = (double)electricity,
                waterPrice = (double)water,
                internetPrice = (double)internet,
                garbagePrice = (double)garbage,
                ownerId = room.Floor.Building.OwnerId,
                landlordName = landlordName,
                landlordPhone = landlordPhone,
                landlordAvatar = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
                listingScore = room.ListingScore,
                moderationRemarks = room.ModerationRemarks
            };

            return Ok(result);
        }
    }
}
