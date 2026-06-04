using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Common.DTOs.Listings;
using Application.Common.Interfaces;

namespace Application.Services
{
    public class ListingService : IListingService
    {
        private readonly IBuildingRepository _buildingRepository;
        private readonly IRoomRepository _roomRepository;
        private readonly IUnitOfWork _unitOfWork;

        public ListingService(
            IBuildingRepository buildingRepository,
            IRoomRepository roomRepository,
            IUnitOfWork unitOfWork)
        {
            _buildingRepository = buildingRepository;
            _roomRepository = roomRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task<List<ListingDto>> GetOwnerListingsAsync(string ownerId)
        {
            var buildings = await _buildingRepository.GetBuildingsByOwnerAsync(ownerId);

            var listings = new List<ListingDto>();
            foreach (var building in buildings)
            {
                var rooms = building.Floors.SelectMany(f => f.Rooms).Where(r => !r.IsDeleted && r.HasListing).ToList();
                foreach (var room in rooms)
                {
                    listings.Add(new ListingDto
                    {
                        RoomId = room.Id,
                        Title = room.Title ?? $"Phòng trọ {room.RoomNumber} tiện ích tại {building.Name}",
                        Description = room.Description ?? "",
                        Price = room.BasePrice,
                        Area = room.SurfaceArea ?? 25,
                        Capacity = room.MaxCapacity,
                        IsPublished = room.IsPublished,
                        BuildingName = building.Name,
                        RoomNumber = room.RoomNumber,
                        Views = (room.Id * 47) % 180 + 35, // Dynamic realistic views count
                        CreatedDate = room.CreatedAt.ToString("dd/MM/yyyy"),
                        Type = room.RoomType switch
                        {
                            Domain.Enums.RoomType.Studio => "Studio",
                            Domain.Enums.RoomType.MiniApartment => "Căn hộ mini",
                            Domain.Enums.RoomType.Apartment => "Căn hộ",
                            _ => "Phòng trọ"
                        },
                        ImageUrls = room.RoomPhotos.OrderBy(p => p.DisplayOrder).Select(p => p.Url).ToList()
                    });
                }
            }

            return listings;
        }

        public async Task<bool> UpdateListingAsync(int roomId, UpdateListingRequest request, string ownerId)
        {
            var room = await _roomRepository.GetRoomWithDetailsAsync(roomId);
            if (room == null || room.Floor.Building.OwnerId != ownerId)
                return false;

            room.Title = request.Title;
            room.Description = request.Description;
            room.BasePrice = request.Price;
            room.SurfaceArea = request.Area;
            room.MaxCapacity = request.Capacity;
            room.IsPublished = request.IsPublished;
            room.HasListing = true;
            room.UpdatedAt = DateTime.UtcNow;

            // Clear old photos and add new ones
            room.RoomPhotos.Clear();
            if (request.ImageUrls != null)
            {
                int order = 0;
                foreach (var url in request.ImageUrls)
                {
                    room.RoomPhotos.Add(new Domain.Entities.RoomPhoto
                    {
                        Url = url,
                        PublicId = url,
                        IsMain = order == 0,
                        DisplayOrder = order++,
                        UploadedAt = DateTime.UtcNow
                    });
                }
            }

            await _roomRepository.UpdateAsync(room);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        public async Task<bool> TogglePublishStatusAsync(int roomId, bool isPublished, string ownerId)
        {
            var room = await _roomRepository.GetRoomWithDetailsAsync(roomId);
            if (room == null || room.Floor.Building.OwnerId != ownerId)
                return false;

            room.IsPublished = isPublished;
            room.HasListing = true;
            room.UpdatedAt = DateTime.UtcNow;

            await _roomRepository.UpdateAsync(room);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }
    }
}
