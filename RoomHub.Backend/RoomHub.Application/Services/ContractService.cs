using System;
using System.Linq;
using System.Threading.Tasks;
using Application.Common.DTOs.Contracts;
using Application.Common.Interfaces;
using Domain.Entities;
using Domain.Enums;
using Microsoft.AspNetCore.Identity;

namespace Application.Services
{
    public class ContractService : IContractService
    {
        private readonly IContractRepository _contractRepository;
        private readonly IRoomRepository _roomRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly UserManager<ApplicationUser> _userManager;

        public ContractService(
            IContractRepository contractRepository,
            IRoomRepository roomRepository,
            IUnitOfWork unitOfWork,
            UserManager<ApplicationUser> userManager)
        {
            _contractRepository = contractRepository;
            _roomRepository = roomRepository;
            _unitOfWork = unitOfWork;
            _userManager = userManager;
        }

        public async Task<TenantSearchResultDto?> SearchTenantAsync(string query)
        {
            if (string.IsNullOrWhiteSpace(query))
                return null;

            var trimmedQuery = query.Trim();

            // Find user by Email or PhoneNumber via Repository to keep EF Core out of Application
            var user = await _contractRepository.GetTenantByContactAsync(trimmedQuery);

            if (user == null || user.IsDeleted)
                return null;

            // Check if user has "Tenant" role
            var isTenant = await _userManager.IsInRoleAsync(user, "Tenant");
            if (!isTenant)
                return null;

            return new TenantSearchResultDto
            {
                UserId = user.Id,
                FullName = user.FullName,
                Email = user.Email ?? "",
                Phone = user.PhoneNumber ?? "",
                Cccd = user.TenantProfile?.CCCDNumber ?? "",
                Address = user.Address ?? ""
            };
        }

        public async Task<bool> CreateContractAsync(CreateContractRequest request, string ownerId)
        {
            var room = await _roomRepository.GetRoomWithDetailsAsync(request.RoomId);
            if (room == null || room.Floor.Building.OwnerId != ownerId)
                throw new Exception("Không tìm thấy phòng này hoặc bạn không có quyền truy cập.");

            if (room.Status == RoomStatus.Occupied)
                throw new Exception("Phòng trọ này đang có người thuê.");

            await _unitOfWork.BeginTransactionAsync();
            try
            {
                // Link account if email or phone matches a RoomHub account
                ApplicationUser? linkedTenant = null;
                string? contactToSearch = request.TenantEmailOrPhone;
                if (string.IsNullOrWhiteSpace(contactToSearch))
                {
                    contactToSearch = !string.IsNullOrWhiteSpace(request.TemporaryTenantEmail)
                        ? request.TemporaryTenantEmail
                        : request.TemporaryTenantPhone;
                }

                if (!string.IsNullOrWhiteSpace(contactToSearch))
                {
                    var result = await SearchTenantAsync(contactToSearch);
                    if (result != null)
                    {
                        linkedTenant = await _userManager.FindByIdAsync(result.UserId);
                    }
                }

                // Create Contract
                var contract = new Contract
                {
                    RoomId = room.Id,
                    TenantId = linkedTenant?.Id,
                    OwnerId = ownerId,
                    TemporaryTenantName = linkedTenant?.FullName ?? request.TemporaryTenantName,
                    TemporaryTenantPhone = linkedTenant?.PhoneNumber ?? request.TemporaryTenantPhone,
                    TemporaryTenantEmail = linkedTenant?.Email ?? request.TemporaryTenantEmail,
                    StartDate = request.StartDate,
                    EndDate = request.EndDate,
                    RentAmount = request.RentAmount,
                    DepositAmount = request.DepositAmount,
                    Terms = request.Terms,
                    Status = ContractStatus.Active,
                    CreatedAt = DateTime.UtcNow
                };

                await _contractRepository.AddAsync(contract);

                // Update Room operational status
                room.Status = RoomStatus.Occupied;
                await _roomRepository.UpdateAsync(room);

                // No separate Deposit entity creation since Deposit is for reservation booking hold.
                // Contract.DepositAmount stores the lease deposit.

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

        public async Task<bool> TerminateContractAsync(int roomId, TerminateContractRequest request, string ownerId)
        {
            var room = await _roomRepository.GetRoomWithDetailsAsync(roomId);
            if (room == null || room.Floor.Building.OwnerId != ownerId)
                throw new Exception("Không tìm thấy phòng này hoặc bạn không có quyền truy cập.");

            var activeContract = room.Contracts.FirstOrDefault(c => c.Status == ContractStatus.Active && !c.IsDeleted);
            if (activeContract == null)
                throw new Exception("Phòng trọ này hiện đang trống hoặc không có hợp đồng hoạt động.");

            await _unitOfWork.BeginTransactionAsync();
            try
            {
                // Terminate Contract
                activeContract.Status = ContractStatus.Terminated;
                activeContract.EndDate = request.EndDate;
                activeContract.RefundAmount = request.RefundAmount;
                activeContract.PenaltyAmount = request.PenaltyAmount;
                activeContract.Terms += $"\n[Thanh lý] Lý do: {request.Reason}. Kết thúc vào {request.EndDate:dd/MM/yyyy}.";
                activeContract.UpdatedAt = DateTime.UtcNow;

                await _contractRepository.UpdateAsync(activeContract);

                // Update Room operational status back to Available
                room.Status = RoomStatus.Available;
                await _roomRepository.UpdateAsync(room);

                // Deposit updates are done on Contract.RefundAmount and Contract.PenaltyAmount directly.

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

        public async Task<TenantRoomDto?> GetActiveRoomForTenantAsync(string tenantId)
        {
            var contract = await _contractRepository.GetActiveContractByTenantIdAsync(tenantId);
            if (contract == null)
                return null;

            var room = contract.Room;
            var building = room.Floor.Building;
            var owner = contract.Owner;

            return new TenantRoomDto
            {
                RoomId = room.Id,
                RoomNumber = room.RoomNumber,
                BuildingName = building.Name,
                BuildingAddress = building.Address,
                RoomType = room.RoomType switch
                {
                    RoomType.Studio => "Studio",
                    RoomType.MiniApartment => "Căn hộ mini",
                    RoomType.Apartment => "Căn hộ",
                    _ => "Phòng trọ"
                },
                SurfaceArea = room.SurfaceArea ?? 25,
                MaxCapacity = room.MaxCapacity,
                IsFurnished = room.IsFurnished,
                ElectricityPrice = room.ElectricityPrice ?? building.ElectricityPrice,
                WaterPrice = room.WaterPrice ?? building.WaterPrice,
                InternetPrice = room.InternetPrice ?? building.InternetPrice,
                GarbagePrice = room.GarbagePrice ?? building.GarbagePrice,
                RentAmount = contract.RentAmount,
                DepositAmount = contract.DepositAmount,
                StartDate = contract.StartDate,
                EndDate = contract.EndDate,
                Status = "Còn hiệu lực",
                OwnerName = owner.FullName,
                OwnerPhone = owner.PhoneNumber ?? "",
                OwnerEmail = owner.Email ?? "",
                OwnerAvatar = owner.AvatarUrl,
                RoomImage = room.RoomPhotos.OrderBy(p => p.DisplayOrder).Select(p => p.Url).FirstOrDefault() 
                            ?? building.ThumbnailUrl 
                            ?? "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1400&q=80"
            };
        }
    }
}
