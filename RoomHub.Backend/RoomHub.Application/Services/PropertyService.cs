using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Common.DTOs.Properties;
using Application.Common.Interfaces;
using Domain.Entities;
using Domain.Enums;

namespace Application.Services
{
    public class PropertyService : IPropertyService
    {
        private readonly IBuildingRepository _buildingRepository;
        private readonly IRoomRepository _roomRepository;
        private readonly IInvoiceRepository _invoiceRepository;
        private readonly IUnitOfWork _unitOfWork;

        public PropertyService(
            IBuildingRepository buildingRepository,
            IRoomRepository roomRepository,
            IInvoiceRepository invoiceRepository,
            IUnitOfWork unitOfWork)
        {
            _buildingRepository = buildingRepository;
            _roomRepository = roomRepository;
            _invoiceRepository = invoiceRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task<List<PropertyDto>> GetPropertiesByOwnerAsync(string ownerId)
        {
            var buildings = await _buildingRepository.GetBuildingsByOwnerAsync(ownerId);

            return buildings.Select(b =>
            {
                var allRooms = b.Floors.SelectMany(f => f.Rooms).Where(r => !r.IsDeleted).ToList();
                var totalRooms = allRooms.Count;
                var occupiedRooms = allRooms.Count(r => r.Status == RoomStatus.Occupied);

                var firstRoom = allRooms.FirstOrDefault();
                var type = firstRoom?.RoomType switch
                {
                    RoomType.Studio => "Studio",
                    RoomType.MiniApartment => "Căn hộ mini",
                    RoomType.Apartment => "Căn hộ",
                    _ => "Phòng trọ"
                };

                var basePrice = firstRoom?.BasePrice ?? 2500000;

                return new PropertyDto
                {
                    Id = b.Id,
                    Name = b.Name,
                    Type = type,
                    Address = b.Address,
                    District = b.District,
                    Floors = b.Floors.Count,
                    RoomsPerFloor = b.Floors.FirstOrDefault()?.Rooms.Count(r => !r.IsDeleted) ?? 0,
                    TotalRooms = totalRooms,
                    OccupiedRooms = occupiedRooms,
                    BasePrice = basePrice,
                    ElectricityPrice = b.ElectricityPrice,
                    WaterPrice = b.WaterPrice,
                    InternetPrice = b.InternetPrice,
                    GarbagePrice = b.GarbagePrice,
                    ParkingPrice = 50000,
                    ServicePrice = 0,
                    Image = b.ThumbnailUrl ?? "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80",
                    Status = b.IsDeleted ? "Ngừng hoạt động" : "Đang hoạt động"
                };
            }).ToList();
        }

        public async Task<PropertyDetailDto?> GetPropertyDetailWithOwnerAsync(int propertyId, string ownerId)
        {
            var building = await _buildingRepository.GetByIdWithOwnerAsync(propertyId, ownerId);
            if (building == null)
                return null;

            var allRooms = building.Floors.SelectMany(f => f.Rooms).Where(r => !r.IsDeleted).ToList();
            var totalRoomsCount = allRooms.Count;
            var occupiedRoomsCount = allRooms.Count(r => r.Status == RoomStatus.Occupied);

            var roomUnits = new List<RoomUnitDto>();

            foreach (var room in allRooms)
            {
                var activeContract = room.Contracts.FirstOrDefault(c => c.Status == ContractStatus.Active && !c.IsDeleted);

                string? tenantName = activeContract?.TemporaryTenantName;
                string? tenantPhone = activeContract?.TemporaryTenantPhone;
                string? tenantStartDate = activeContract?.StartDate.ToString("dd/MM/yyyy");
                decimal deposit = activeContract?.DepositAmount ?? 0;

                var unpaidInvoices = activeContract != null
                    ? await _invoiceRepository.GetUnpaidInvoicesByContractAsync(activeContract.Id)
                    : new List<Invoice>();

                var outstandingBillAmount = unpaidInvoices.Sum(i => i.TotalAmount);
                var outstandingBillStatus = unpaidInvoices.Any(i => i.Status == InvoiceStatus.Overdue)
                    ? "Quá hạn"
                    : unpaidInvoices.Any()
                        ? "Chưa thanh toán"
                        : "Đã thanh toán";

                var roomStatusStr = room.Status switch
                {
                    RoomStatus.Occupied => unpaidInvoices.Any(i => i.Status == InvoiceStatus.Overdue) ? "Quá hạn" : "Đang thuê",
                    RoomStatus.Maintenance => "Bảo trì",
                    RoomStatus.UnderMaintenance => "Bảo trì",
                    _ => "Còn trống"
                };

                roomUnits.Add(new RoomUnitDto
                {
                    Id = room.Id.ToString(),
                    RoomNumber = room.RoomNumber,
                    Floor = room.Floor.FloorNumber,
                    Type = room.RoomType switch
                    {
                        RoomType.Studio => "Studio",
                        RoomType.MiniApartment => "Căn hộ mini",
                        RoomType.Apartment => "Căn hộ",
                        _ => "Phòng trọ"
                    },
                    Area = room.SurfaceArea ?? 25,
                    Price = room.BasePrice,
                    Status = roomStatusStr,
                    TenantName = tenantName,
                    TenantPhone = tenantPhone,
                    TenantStartDate = tenantStartDate,
                    Deposit = deposit,
                    OutstandingBillStatus = outstandingBillStatus,
                    OutstandingBillAmount = outstandingBillAmount
                });
            }

            var typeStr = allRooms.FirstOrDefault()?.RoomType switch
            {
                RoomType.Studio => "Studio",
                RoomType.MiniApartment => "Căn hộ mini",
                RoomType.Apartment => "Căn hộ",
                _ => "Phòng trọ"
            };

            var propertyDto = new PropertyDto
            {
                Id = building.Id,
                Name = building.Name,
                Type = typeStr,
                Address = building.Address,
                District = building.District,
                Floors = building.Floors.Count,
                RoomsPerFloor = building.Floors.FirstOrDefault()?.Rooms.Count(r => !r.IsDeleted) ?? 0,
                TotalRooms = totalRoomsCount,
                OccupiedRooms = occupiedRoomsCount,
                BasePrice = allRooms.FirstOrDefault()?.BasePrice ?? 2500000,
                ElectricityPrice = building.ElectricityPrice,
                WaterPrice = building.WaterPrice,
                InternetPrice = building.InternetPrice,
                GarbagePrice = building.GarbagePrice,
                ParkingPrice = 50000,
                ServicePrice = 0,
                Image = building.ThumbnailUrl ?? "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80",
                Status = "Đang hoạt động"
            };

            return new PropertyDetailDto
            {
                Property = propertyDto,
                Rooms = roomUnits
            };
        }

        public async Task<bool> CreatePropertyWithOwnerAsync(CreatePropertyRequestDto request, string ownerId)
        {
            await _unitOfWork.BeginTransactionAsync();
            try
            {
                // Create Building
                var building = new Building
                {
                    OwnerId = ownerId,
                    Name = request.Name,
                    Province = "Đà Nẵng",
                    City = "Đà Nẵng",
                    District = request.District ?? "Quận Ngũ Hành Sơn",
                    Ward = request.Ward ?? "",
                    Address = request.Address,
                    ElectricityPrice = request.ElectricityPrice,
                    WaterPrice = request.WaterPrice,
                    InternetPrice = request.InternetPrice,
                    GarbagePrice = request.GarbagePrice,
                    ThumbnailUrl = string.IsNullOrWhiteSpace(request.ImageUrl)
                        ? "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80"
                        : request.ImageUrl,
                    CreatedAt = DateTime.UtcNow
                };

                await _buildingRepository.AddAsync(building);
                await _unitOfWork.SaveChangesAsync();

                var roomType = request.SelectedType switch
                {
                    "studio" => RoomType.Studio,
                    "mini-apartment" => RoomType.MiniApartment,
                    "independent" => RoomType.Apartment,
                    _ => RoomType.BoardingHouse
                };

                if (request.SelectedType == "independent")
                {
                    var floor = new Floor
                    {
                        BuildingId = building.Id,
                        FloorNumber = 1,
                        Description = "Căn hộ độc lập lẻ"
                    };
                    building.Floors.Add(floor);
                    await _unitOfWork.SaveChangesAsync();

                    var room = new Room
                    {
                        FloorId = floor.Id,
                        RoomNumber = request.Name,
                        RoomType = roomType,
                        MaxCapacity = request.MaxPeople,
                        SurfaceArea = request.DefaultArea,
                        BasePrice = request.BasePrice,
                        Description = request.Description ?? $"Căn hộ lẻ {request.Name}",
                        IsFurnished = true,
                        Status = RoomStatus.Available,
                        LandlordId = ownerId,
                        Title = $"Căn hộ độc lập {request.Name}",
                        IsPublished = true,
                        CreatedAt = DateTime.UtcNow
                    };
                    floor.Rooms.Add(room);
                }
                else
                {
                    var numFloors = request.NumFloors > 0 ? request.NumFloors : 1;
                    var roomsCountPerFloor = request.RoomsCountPerFloor;

                    for (int f = 1; f <= numFloors; f++)
                    {
                        var floor = new Floor
                        {
                            BuildingId = building.Id,
                            FloorNumber = f,
                            Description = $"Tầng {f}"
                        };
                        building.Floors.Add(floor);
                        await _unitOfWork.SaveChangesAsync();

                        int numRooms = request.NumRoomsPerFloor > 0 ? request.NumRoomsPerFloor : 1;
                        if (roomsCountPerFloor != null && roomsCountPerFloor.Count >= f)
                        {
                            numRooms = roomsCountPerFloor[f - 1] > 0 ? roomsCountPerFloor[f - 1] : 1;
                        }

                        var rooms = new List<Room>();
                        for (int r = 0; r < numRooms; r++)
                        {
                            var roomIndex = request.StartNum + r;
                            var indexStr = roomIndex < 10 ? $"0{roomIndex}" : $"{roomIndex}";
                            var roomNumber = request.NumberingRule switch
                            {
                                "prefix" => $"{request.PrefixText}{f}{indexStr}",
                                "manual" => $"P-{f}-{indexStr}",
                                _ => $"{f}{indexStr}"
                            };

                            var customRoom = request.CustomRooms?.FirstOrDefault(cr => 
                                cr.RoomNumber.Equals(roomNumber, StringComparison.OrdinalIgnoreCase) && 
                                cr.FloorNumber == f);

                            var room = new Room
                            {
                                FloorId = floor.Id,
                                RoomNumber = roomNumber,
                                RoomType = roomType,
                                MaxCapacity = customRoom?.MaxCapacity ?? request.MaxPeople,
                                SurfaceArea = customRoom?.SurfaceArea ?? request.DefaultArea,
                                BasePrice = customRoom?.BasePrice ?? request.BasePrice,
                                Description = request.Description ?? $"Phòng tiện nghi {roomNumber}",
                                IsFurnished = true,
                                Status = RoomStatus.Available,
                                LandlordId = ownerId,
                                Title = $"Phòng {roomNumber} tại {request.Name}",
                                IsPublished = true,
                                CreatedAt = DateTime.UtcNow
                            };
                            rooms.Add(room);
                        }
                        await _roomRepository.AddRangeAsync(rooms);
                    }
                }

                await _unitOfWork.SaveChangesAsync();
                await _unitOfWork.CommitTransactionAsync();
                return true;
            }
            catch (Exception)
            {
                await _unitOfWork.RollbackTransactionAsync();
                throw;
            }
        }
    }
}
