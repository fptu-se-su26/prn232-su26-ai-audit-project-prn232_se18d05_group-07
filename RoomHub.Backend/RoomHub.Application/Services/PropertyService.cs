using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Common.DTOs.Properties;
using Application.Common.Interfaces;
using Domain.Entities;
using Domain.Enums;
using Domain.Common;
using Microsoft.AspNetCore.Identity;

namespace Application.Services
{
    public class PropertyService : IPropertyService
    {
        private readonly IBuildingRepository _buildingRepository;
        private readonly IRoomRepository _roomRepository;
        private readonly IInvoiceRepository _invoiceRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly UserManager<ApplicationUser> _userManager;

        public PropertyService(
            IBuildingRepository buildingRepository,
            IRoomRepository roomRepository,
            IInvoiceRepository invoiceRepository,
            IUnitOfWork unitOfWork,
            UserManager<ApplicationUser> userManager)
        {
            _buildingRepository = buildingRepository;
            _roomRepository = roomRepository;
            _invoiceRepository = invoiceRepository;
            _unitOfWork = unitOfWork;
            _userManager = userManager;
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
                    WaterBillingType = b.WaterBillingType,
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
                var activeContract = room.Contracts.FirstOrDefault(c => (c.Status == ContractStatus.Active || c.Status == ContractStatus.Pending) && !c.IsDeleted);

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
                    RoomStatus.PendingApproval => "Chờ xác nhận",
                    _ => "Còn trống"
                };

                decimal oldElectricity = 0;
                decimal oldWater = 0;
                if (activeContract != null)
                {
                    var latestElecReading = activeContract.UtilityReadings
                        .Where(ur => ur.UtilityType == UtilityType.Electricity)
                        .OrderByDescending(ur => ur.ReadingDate)
                        .FirstOrDefault();
                    if (latestElecReading != null)
                    {
                        oldElectricity = latestElecReading.NewIndex ?? 0;
                    }

                    var latestWaterReading = activeContract.UtilityReadings
                        .Where(ur => ur.UtilityType == UtilityType.Water)
                        .OrderByDescending(ur => ur.ReadingDate)
                        .FirstOrDefault();
                    if (latestWaterReading != null)
                    {
                        oldWater = latestWaterReading.NewIndex ?? 0;
                    }
                }

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
                    OutstandingBillAmount = outstandingBillAmount,
                    OldElectricity = oldElectricity,
                    OldWater = oldWater,
                    ElectricityPrice = room.ElectricityPrice ?? building.ElectricityPrice,
                    WaterPrice = room.WaterPrice ?? building.WaterPrice,
                    WaterBillingType = room.WaterBillingType ?? building.WaterBillingType,
                    MaxCapacity = room.MaxCapacity,
                    InternetPrice = room.InternetPrice ?? building.InternetPrice,
                    GarbagePrice = room.GarbagePrice ?? building.GarbagePrice
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
                WaterBillingType = building.WaterBillingType,
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

        private static string GetPlanName(SubscriptionPlan plan) => plan switch
        {
            SubscriptionPlan.Free => "Starter (Miễn phí)",
            SubscriptionPlan.Monthly => "Pro (Tháng)",
            SubscriptionPlan.Yearly => "Pro (Năm)",
            _ => plan.ToString()
        };

        public async Task<bool> CreatePropertyWithOwnerAsync(CreatePropertyRequestDto request, string ownerId)
        {
            var user = await _userManager.FindByIdAsync(ownerId);
            if (user == null)
            {
                throw new InvalidOperationException("Không tìm thấy thông tin tài khoản chủ nhà.");
            }

            // Check plan expiration
            var currentPlan = user.CurrentPlan;
            if (currentPlan != SubscriptionPlan.Free && user.SubscriptionExpiry.HasValue && user.SubscriptionExpiry.Value < DateTime.UtcNow)
            {
                currentPlan = SubscriptionPlan.Free;
            }

            // Check building limit
            var existingBuildings = await _buildingRepository.GetBuildingsByOwnerAsync(ownerId);
            var maxBuildings = SubscriptionLimits.GetMaxBuildings(currentPlan);
            if (existingBuildings.Count >= maxBuildings)
            {
                throw new InvalidOperationException($"Tài khoản của bạn đang sử dụng gói {GetPlanName(currentPlan)}, chỉ được phép quản lý tối đa {maxBuildings} tòa nhà/tài sản. Vui lòng nâng cấp gói cước để tiếp tục.");
            }

            // Check room limit
            var totalExistingRooms = existingBuildings.Sum(b => b.Floors.SelectMany(f => f.Rooms).Count(r => !r.IsDeleted));
            int roomsToCreate = 0;
            if (request.SelectedType == "independent")
            {
                roomsToCreate = 1;
            }
            else
            {
                var numFloors = request.NumFloors > 0 ? request.NumFloors : 1;
                var roomsCountPerFloor = request.RoomsCountPerFloor;
                for (int f = 1; f <= numFloors; f++)
                {
                    int numRooms = request.NumRoomsPerFloor > 0 ? request.NumRoomsPerFloor : 1;
                    if (roomsCountPerFloor != null && roomsCountPerFloor.Count >= f)
                    {
                        numRooms = roomsCountPerFloor[f - 1] > 0 ? roomsCountPerFloor[f - 1] : 1;
                    }
                    roomsToCreate += numRooms;
                }
            }

            var maxRooms = SubscriptionLimits.GetMaxRooms(currentPlan);
            if (totalExistingRooms + roomsToCreate > maxRooms)
            {
                throw new InvalidOperationException($"Tài khoản của bạn đang sử dụng gói {GetPlanName(currentPlan)}, chỉ được phép quản lý tối đa {maxRooms} phòng/căn hộ. Hiện tại bạn đã có {totalExistingRooms} phòng, việc tạo thêm {roomsToCreate} phòng sẽ vượt quá hạn mức gói. Vui lòng nâng cấp gói cước để tiếp tục.");
            }

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
                    WaterBillingType = request.WaterBillingType,
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

                    var titleStr = $"Căn hộ độc lập {request.Name}";
                    if (titleStr.Length > 200) titleStr = titleStr.Substring(0, 200);

                    var room = new Room
                    {
                        FloorId = floor.Id,
                        RoomNumber = request.Name,
                        RoomType = roomType,
                        MaxCapacity = request.MaxPeople,
                        WaterBillingType = request.WaterBillingType,
                        SurfaceArea = request.DefaultArea,
                        BasePrice = request.BasePrice,
                        Description = request.Description ?? $"Căn hộ lẻ {request.Name}",
                        IsFurnished = true,
                        Status = RoomStatus.Available,
                        LandlordId = ownerId,
                        Title = titleStr,
                        IsPublished = false,
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

                            var titleStr = $"Phòng {roomNumber} tại {request.Name}";
                            if (titleStr.Length > 200) titleStr = titleStr.Substring(0, 200);

                            var room = new Room
                            {
                                FloorId = floor.Id,
                                RoomNumber = roomNumber,
                                RoomType = roomType,
                                MaxCapacity = customRoom?.MaxCapacity ?? request.MaxPeople,
                                WaterBillingType = customRoom?.WaterBillingType ?? request.WaterBillingType,
                                SurfaceArea = customRoom?.SurfaceArea ?? request.DefaultArea,
                                BasePrice = customRoom?.BasePrice ?? request.BasePrice,
                                Description = request.Description ?? $"Phòng tiện nghi {roomNumber}",
                                IsFurnished = true,
                                Status = RoomStatus.Available,
                                LandlordId = ownerId,
                                Title = titleStr,
                                IsPublished = false,
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

        public async Task<UnitDetailDto?> GetUnitDetailAsync(int roomId, string ownerId)
        {
            var room = await _roomRepository.GetRoomWithDetailsAsync(roomId);
            if (room == null || room.Floor.Building.OwnerId != ownerId)
                return null;

            var building = room.Floor.Building;
            var activeContract = room.Contracts
                .OrderByDescending(c => c.Id)
                .FirstOrDefault(c => (c.Status == ContractStatus.Active || c.Status == ContractStatus.Pending) && !c.IsDeleted);

            var dto = new UnitDetailDto
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
                Status = room.Status switch
                {
                    RoomStatus.Occupied => "Đang thuê",
                    RoomStatus.Maintenance => "Bảo trì",
                    RoomStatus.UnderMaintenance => "Bảo trì",
                    RoomStatus.PendingApproval => "Chờ xác nhận",
                    _ => "Còn trống"
                },
                BuildingName = building.Name,
                BuildingAddress = building.Address,
                BuildingId = building.Id,
                Description = room.Description ?? "",
                IsFurnished = room.IsFurnished,
                MaxCapacity = room.MaxCapacity,
                ElectricityPrice = room.ElectricityPrice ?? building.ElectricityPrice,
                WaterPrice = room.WaterPrice ?? building.WaterPrice,
                WaterBillingType = room.WaterBillingType ?? building.WaterBillingType,
                InternetPrice = room.InternetPrice ?? building.InternetPrice,
                GarbagePrice = room.GarbagePrice ?? building.GarbagePrice,
                InternalNotes = room.Description ?? "",
                ImageUrls = room.RoomPhotos.OrderBy(p => p.DisplayOrder).Select(p => p.Url).ToList()
            };

            if (activeContract != null)
            {
                var tenantUser = activeContract.Tenant;
                dto.Tenant = new UnitTenantDto
                {
                    Name = activeContract.TemporaryTenantName ?? tenantUser?.FullName ?? "Chưa rõ",
                    Email = activeContract.TemporaryTenantEmail ?? tenantUser?.Email ?? "",
                    Phone = activeContract.TemporaryTenantPhone ?? tenantUser?.PhoneNumber ?? "",
                    Cccd = tenantUser?.TenantProfile?.CCCDNumber ?? "",
                    Address = tenantUser?.Address ?? "",
                    StartDate = activeContract.StartDate.ToString("dd/MM/yyyy"),
                    EndDate = activeContract.EndDate.ToString("dd/MM/yyyy"),
                    Deposit = activeContract.DepositAmount,
                    AgreementPrice = activeContract.RentAmount,
                    PeopleCount = 1, // Defaulting as Contract model has no PeopleCount
                    IsLinkedAccount = tenantUser != null,
                    ContractStatus = activeContract.Status.ToString()
                };

                 foreach (var invoice in activeContract.Invoices.OrderByDescending(i => i.InvoiceDate))
                {
                    dto.Invoices.Add(new UnitInvoiceDto
                    {
                        Id = invoice.Id.ToString(),
                        Month = invoice.InvoiceDate.ToString("MM/yyyy"),
                        RentPrice = activeContract.RentAmount,
                        UtilitiesPrice = invoice.TotalAmount - activeContract.RentAmount,
                        Total = invoice.TotalAmount,
                        Status = invoice.Status switch
                        {
                            InvoiceStatus.Paid => "Đã thanh toán",
                            InvoiceStatus.Unpaid => "Chưa thanh toán",
                            InvoiceStatus.Overdue => "Quá hạn",
                            InvoiceStatus.Pending => "Chờ xử lý",
                            InvoiceStatus.Cancelled => "Đã hủy",
                            _ => "Chưa thanh toán"
                        },
                        DueDate = invoice.DueDate.ToString("dd/MM/yyyy")
                    });
                }
            }

            if (room.IsPublished)
            {
                dto.Listing = new UnitListingDto
                {
                    Id = $"LIST-{room.Id}",
                    Title = room.Title ?? $"Phòng {room.RoomNumber} tại {building.Name}",
                    Price = room.BasePrice,
                    Status = "Đang hiển thị",
                    CreatedDate = room.CreatedAt.ToString("dd/MM/yyyy"),
                    Views = (room.Id * 47) % 180 + 35
                };
            }

            dto.Logs.Add(new UnitActivityLogDto
            {
                Text = $"Khởi tạo thông tin phòng {room.RoomNumber}",
                Time = room.CreatedAt.ToString("dd/MM/yyyy HH:mm")
            });

            if (activeContract != null)
            {
                dto.Logs.Add(new UnitActivityLogDto
                {
                    Text = $"Ký hợp đồng thuê phòng với khách hàng {dto.Tenant?.Name}",
                    Time = activeContract.CreatedAt.ToString("dd/MM/yyyy HH:mm")
                });
            }

            return dto;
        }

        public async Task<bool> UpdateUnitStatusAsync(int roomId, string status, string ownerId)
        {
            var room = await _roomRepository.GetRoomWithDetailsAsync(roomId);
            if (room == null || room.Floor.Building.OwnerId != ownerId)
                return false;

            room.Status = status switch
            {
                "Còn trống" => RoomStatus.Available,
                "Trống" => RoomStatus.Available,
                "Available" => RoomStatus.Available,
                "Đang thuê" => RoomStatus.Occupied,
                "Thuê" => RoomStatus.Occupied,
                "Occupied" => RoomStatus.Occupied,
                "Bảo trì" => RoomStatus.Maintenance,
                "Maintenance" => RoomStatus.Maintenance,
                _ => RoomStatus.Available
            };

            room.UpdatedAt = DateTime.UtcNow;
            await _roomRepository.UpdateAsync(room);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpdateUnitNotesAsync(int roomId, string notes, string ownerId)
        {
            var room = await _roomRepository.GetRoomWithDetailsAsync(roomId);
            if (room == null || room.Floor.Building.OwnerId != ownerId)
                return false;

            room.Description = notes;
            room.UpdatedAt = DateTime.UtcNow;
            await _roomRepository.UpdateAsync(room);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpdateUnitDetailsAsync(int roomId, UpdateUnitDetailsRequest request, string ownerId)
        {
            var room = await _roomRepository.GetRoomWithDetailsAsync(roomId);
            if (room == null || room.Floor.Building.OwnerId != ownerId)
                return false;

            room.MaxCapacity = request.MaxCapacity;
            room.WaterBillingType = request.WaterBillingType;
            room.WaterPrice = request.WaterPrice;
            room.ElectricityPrice = request.ElectricityPrice;
            room.InternetPrice = request.InternetPrice;
            room.GarbagePrice = request.GarbagePrice;
            room.BasePrice = request.Price;
            room.SurfaceArea = request.Area;
            room.UpdatedAt = DateTime.UtcNow;

            await _roomRepository.UpdateAsync(room);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpdatePropertyAsync(int propertyId, UpdatePropertyRequestDto request, string ownerId)
        {
            var building = await _buildingRepository.GetByIdWithOwnerAsync(propertyId, ownerId);
            if (building == null)
                return false;

            building.Name = request.Name;
            building.Address = request.Address;
            if (!string.IsNullOrEmpty(request.District)) building.District = request.District;
            if (!string.IsNullOrEmpty(request.Ward)) building.Ward = request.Ward;
            if (!string.IsNullOrEmpty(request.ImageUrl)) building.ThumbnailUrl = request.ImageUrl;
            building.ElectricityPrice = request.ElectricityPrice;
            building.WaterPrice = request.WaterPrice;
            building.WaterBillingType = request.WaterBillingType;
            building.InternetPrice = request.InternetPrice;
            building.GarbagePrice = request.GarbagePrice;
            building.UpdatedAt = DateTime.UtcNow;

            await _buildingRepository.UpdateAsync(building);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeletePropertyAsync(int propertyId, string ownerId)
        {
            var building = await _buildingRepository.GetByIdWithOwnerAsync(propertyId, ownerId);
            if (building == null)
                return false;

            // Check if there are any occupied rooms or rooms with active/pending contracts
            var hasActiveOccupants = building.Floors.SelectMany(f => f.Rooms)
                .Any(r => !r.IsDeleted && (r.Status == RoomStatus.Occupied || r.Contracts.Any(c => (c.Status == ContractStatus.Active || c.Status == ContractStatus.Pending) && !c.IsDeleted)));

            if (hasActiveOccupants)
            {
                throw new InvalidOperationException("Không thể xóa tòa nhà vì đang có phòng đang được thuê hoặc có hợp đồng còn hiệu lực.");
            }

            // Soft delete building
            building.IsDeleted = true;
            building.UpdatedAt = DateTime.UtcNow;

            // Soft delete rooms
            foreach (var floor in building.Floors)
            {
                foreach (var room in floor.Rooms)
                {
                    room.IsDeleted = true;
                    room.UpdatedAt = DateTime.UtcNow;
                }
            }

            await _buildingRepository.UpdateAsync(building);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        public async Task<bool> AddRoomToPropertyAsync(int propertyId, AddRoomRequestDto request, string ownerId)
        {
            var building = await _buildingRepository.GetByIdWithOwnerAsync(propertyId, ownerId);
            if (building == null)
                return false;

            var user = await _userManager.FindByIdAsync(ownerId);
            if (user == null)
            {
                throw new InvalidOperationException("Không tìm thấy thông tin tài khoản chủ nhà.");
            }

            // Check room limit under current subscription plan
            var existingBuildings = await _buildingRepository.GetBuildingsByOwnerAsync(ownerId);
            var totalExistingRooms = existingBuildings.Sum(b => b.Floors.SelectMany(f => f.Rooms).Count(r => !r.IsDeleted));
            var maxRooms = SubscriptionLimits.GetMaxRooms(user.CurrentPlan);
            if (totalExistingRooms + 1 > maxRooms)
            {
                throw new InvalidOperationException($"Tài khoản của bạn đang sử dụng gói {GetPlanName(user.CurrentPlan)}, chỉ được phép quản lý tối đa {maxRooms} phòng/căn hộ. Vui lòng nâng cấp gói cước để tiếp tục.");
            }

            // Ensure floor exists or create it
            var floor = building.Floors.FirstOrDefault(f => f.FloorNumber == request.FloorNumber);
            if (floor == null)
            {
                floor = new Floor
                {
                    BuildingId = building.Id,
                    FloorNumber = request.FloorNumber,
                    Description = $"Tầng {request.FloorNumber}"
                };
                building.Floors.Add(floor);
                await _unitOfWork.SaveChangesAsync();
            }

            // Ensure room number is unique in this building
            var exists = building.Floors.SelectMany(f => f.Rooms)
                .Any(r => !r.IsDeleted && r.RoomNumber.Equals(request.RoomNumber, StringComparison.OrdinalIgnoreCase));
            if (exists)
            {
                throw new InvalidOperationException($"Số phòng {request.RoomNumber} đã tồn tại trong tòa nhà này.");
            }

            var rType = request.RoomType.ToLower() switch
            {
                "studio" => RoomType.Studio,
                "miniapartment" => RoomType.MiniApartment,
                "mini-apartment" => RoomType.MiniApartment,
                "apartment" => RoomType.Apartment,
                _ => RoomType.BoardingHouse
            };

            var room = new Room
            {
                FloorId = floor.Id,
                RoomNumber = request.RoomNumber,
                RoomType = rType,
                MaxCapacity = request.MaxCapacity,
                WaterBillingType = building.WaterBillingType,
                SurfaceArea = request.SurfaceArea,
                BasePrice = request.BasePrice,
                Description = $"Phòng tiện nghi {request.RoomNumber}",
                IsFurnished = true,
                Status = RoomStatus.Available,
                LandlordId = ownerId,
                Title = $"Phòng {request.RoomNumber} tại {building.Name}",
                IsPublished = false,
                CreatedAt = DateTime.UtcNow
            };

            await _roomRepository.AddAsync(room);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }
    }
}
