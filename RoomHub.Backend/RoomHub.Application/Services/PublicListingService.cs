using System;
using System.Linq;
using System.Threading.Tasks;
using Application.Common.DTOs.Listings;
using Application.Common.Interfaces;
using Domain.Entities;
using Domain.Enums;

namespace Application.Services
{
    public class PublicListingService : IPublicListingService
    {
        private const string DefaultThumbnail = "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80";

        private readonly IRoomRepository _roomRepository;

        public PublicListingService(IRoomRepository roomRepository)
        {
            _roomRepository = roomRepository;
        }

        public async Task<PublicListingPageDto> SearchListingsAsync(PublicListingFilterRequest filter)
        {
            var (rooms, totalCount) = await _roomRepository.SearchPublicListingsAsync(filter);
            var page = Math.Max(1, filter.Page);
            var pageSize = Math.Clamp(filter.PageSize, 1, 50);

            return new PublicListingPageDto
            {
                Items = rooms.Select(MapToSummary).ToList(),
                Total = totalCount,
                Page = page,
                PageSize = pageSize,
                TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
            };
        }

        public async Task<PublicListingDetailDto?> GetListingDetailAsync(int id)
        {
            var room = await _roomRepository.GetPublicListingDetailAsync(id);
            if (room == null || !room.HasListing || !room.IsPublished)
                return null;

            var building = room.Floor.Building;
            var electricity = room.ElectricityPrice ?? building.ElectricityPrice;
            var water = room.WaterPrice ?? building.WaterPrice;
            var internet = room.InternetPrice ?? building.InternetPrice;
            var garbage = room.GarbagePrice ?? building.GarbagePrice;

            return new PublicListingDetailDto
            {
                Id = room.Id,
                Title = room.Title,
                Description = room.AIFormattedDescription ?? room.Description ?? "",
                Type = MapRoomType(room.RoomType),
                Location = $"{building.Address}, {building.Ward}, {building.District}, {building.City}",
                District = building.District,
                Price = (double)room.BasePrice,
                Area = (double)(room.SurfaceArea ?? 25),
                MaxPeople = room.MaxCapacity,
                Image = room.RoomPhotos.OrderBy(p => p.DisplayOrder).Select(p => p.Url).FirstOrDefault() ?? DefaultThumbnail,
                ImageUrls = room.RoomPhotos.OrderBy(p => p.DisplayOrder).Select(p => p.Url).ToList(),
                Amenities = room.RoomAmenities.Select(ra => ra.Amenity.Name).ToList(),
                ElectricityPrice = (double)electricity,
                WaterPrice = (double)water,
                InternetPrice = (double)internet,
                GarbagePrice = (double)garbage,
                LandlordName = building.Owner.FullName ?? "Chủ nhà RoomHub",
                LandlordPhone = building.Owner.PhoneNumber ?? "0905 *** ***",
                LandlordAvatar = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
                ListingScore = room.ListingScore,
                ModerationRemarks = room.ModerationRemarks
            };
        }

        private static PublicListingSummaryDto MapToSummary(Room r) => new()
        {
            Id = r.Id,
            Title = r.Title,
            Description = r.AIFormattedDescription ?? r.Description ?? "",
            Type = MapRoomType(r.RoomType),
            Location = $"{r.Floor.Building.Address}, {r.Floor.Building.Ward}, {r.Floor.Building.District}, {r.Floor.Building.City}",
            District = r.Floor.Building.District,
            Price = (double)r.BasePrice,
            Area = (double)(r.SurfaceArea ?? 25),
            MaxPeople = r.MaxCapacity,
            Image = r.RoomPhotos.OrderBy(p => p.DisplayOrder).Select(p => p.Url).FirstOrDefault() ?? DefaultThumbnail,
            Amenities = r.RoomAmenities.Select(ra => ra.Amenity.Name).ToList(),
            IsNew = (DateTime.UtcNow - r.CreatedAt).TotalDays <= 7
        };

        private static string MapRoomType(RoomType type) => type switch
        {
            RoomType.Studio => "Studio",
            RoomType.MiniApartment => "Căn hộ mini",
            RoomType.Apartment => "Căn hộ",
            _ => "Phòng trọ"
        };
    }
}
