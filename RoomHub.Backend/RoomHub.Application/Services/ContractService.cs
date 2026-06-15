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
        private readonly INotificationRepository _notificationRepository;
        private readonly IEmailService _emailService;

        public ContractService(
            IContractRepository contractRepository,
            IRoomRepository roomRepository,
            IUnitOfWork unitOfWork,
            UserManager<ApplicationUser> userManager,
            INotificationRepository notificationRepository,
            IEmailService emailService)
        {
            _contractRepository = contractRepository;
            _roomRepository = roomRepository;
            _unitOfWork = unitOfWork;
            _userManager = userManager;
            _notificationRepository = notificationRepository;
            _emailService = emailService;
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
                    Status = linkedTenant != null ? ContractStatus.Pending : ContractStatus.Active,
                    CreatedAt = DateTime.UtcNow
                };

                await _contractRepository.AddAsync(contract);

                // Update Room operational status
                room.Status = linkedTenant != null ? RoomStatus.PendingApproval : RoomStatus.Occupied;
                await _roomRepository.UpdateAsync(room);

                // No separate Deposit entity creation since Deposit is for reservation booking hold.
                // Contract.DepositAmount stores the lease deposit.

                await _unitOfWork.SaveChangesAsync();

                // Gửi thông báo đến Tenant nếu có tài khoản liên kết
                var ownerUser = await _userManager.FindByIdAsync(ownerId);
                var ownerName = ownerUser?.FullName ?? "Chủ nhà";

                if (linkedTenant != null)
                {
                    var notification = new Notification
                    {
                        UserId = linkedTenant.Id,
                        Type = "RoomInvitation",
                        Title = "Lời mời nhận phòng",
                        Content = $"Chủ nhà {ownerName} đã thêm bạn vào phòng {room.RoomNumber} thuộc tòa nhà {room.Floor.Building.Name}.",
                        LinkedId = contract.Id,
                        IsRead = false,
                        CreatedAt = DateTime.UtcNow
                    };
                    await _notificationRepository.AddAsync(notification);
                    await _unitOfWork.SaveChangesAsync();

                    if (!string.IsNullOrEmpty(linkedTenant.Email))
                    {
                        await _emailService.SendEmailAsync(
                            linkedTenant.Email,
                            "RoomHub - Lời mời nhận phòng dịch vụ",
                            $"Xin chào {linkedTenant.FullName},<br/><br/>" +
                            $"Chủ nhà <b>{ownerName}</b> đã thêm bạn vào phòng <b>{room.RoomNumber}</b> thuộc tòa nhà <b>{room.Floor.Building.Name}</b> trên hệ thống RoomHub.<br/>" +
                            $"Vui lòng đăng nhập vào tài khoản Khách thuê trên hệ thống RoomHub để xem chi tiết hợp đồng và xác nhận nhận phòng.<br/><br/>" +
                            $"Trân trọng,<br/>RoomHub Platform.",
                            true
                        );
                    }
                }
                else if (!string.IsNullOrEmpty(request.TemporaryTenantEmail))
                {
                    await _emailService.SendEmailAsync(
                        request.TemporaryTenantEmail,
                        "RoomHub - Thông báo nhận phòng thành công",
                        $"Xin chào {request.TemporaryTenantName ?? "Khách thuê"},<br/><br/>" +
                        $"Chủ nhà <b>{ownerName}</b> đã thêm bạn vào phòng <b>{room.RoomNumber}</b> thuộc tòa nhà <b>{room.Floor.Building.Name}</b> trên hệ thống RoomHub.<br/>" +
                        $"Hợp đồng thuê phòng của bạn đã được kích hoạt. Vui lòng liên hệ với chủ nhà để nhận chìa khóa phòng và ký kết văn bản bàn giao.<br/><br/>" +
                        $"Trân trọng,<br/>RoomHub Platform.",
                        true
                    );
                }

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

            var activeContract = room.Contracts.FirstOrDefault(c => (c.Status == ContractStatus.Active || c.Status == ContractStatus.Pending) && !c.IsDeleted);
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
                Status = contract.Status switch
                {
                    ContractStatus.Pending => "Chờ xác nhận",
                    ContractStatus.Active => "Còn hiệu lực",
                    _ => contract.Status.ToString()
                },
                IsPending = contract.Status == ContractStatus.Pending,
                OwnerName = owner.FullName,
                OwnerPhone = owner.PhoneNumber ?? "",
                OwnerEmail = owner.Email ?? "",
                OwnerAvatar = owner.AvatarUrl,
                RoomImage = room.RoomPhotos.OrderBy(p => p.DisplayOrder).Select(p => p.Url).FirstOrDefault()
                            ?? building.ThumbnailUrl
                            ?? "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1400&q=80",
                SignaturePath = contract.SignaturePath
            };
        }

        public async Task<bool> SignContractAsync(string tenantId, string signatureUrl)
        {
            if (string.IsNullOrWhiteSpace(signatureUrl))
                throw new Exception("Chữ ký không hợp lệ.");

            var contract = await _contractRepository.GetActiveContractByTenantIdAsync(tenantId);
            if (contract == null || (contract.Status != ContractStatus.Pending && contract.Status != ContractStatus.Active))
                throw new Exception("Không tìm thấy hợp đồng để ký.");

            contract.SignaturePath = signatureUrl;
            contract.UpdatedAt = DateTime.UtcNow;
            await _contractRepository.UpdateAsync(contract);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        public async Task<bool> AcceptContractAsync(string tenantId)
        {
            var contract = await _contractRepository.GetActiveContractByTenantIdAsync(tenantId);
            if (contract == null || contract.Status != ContractStatus.Pending)
                throw new Exception("Không tìm thấy yêu cầu nhận phòng chờ xác nhận nào.");

            await _unitOfWork.BeginTransactionAsync();
            try
            {
                contract.Status = ContractStatus.Active;
                contract.UpdatedAt = DateTime.UtcNow;
                await _contractRepository.UpdateAsync(contract);

                var room = await _roomRepository.GetByIdAsync(contract.RoomId);
                if (room != null)
                {
                    room.Status = RoomStatus.Occupied;
                    room.UpdatedAt = DateTime.UtcNow;
                    await _roomRepository.UpdateAsync(room);
                }

                await _unitOfWork.SaveChangesAsync();

                // Tạo thông báo phản hồi cho Chủ nhà
                var tenantUser = await _userManager.FindByIdAsync(tenantId);
                var tenantName = tenantUser?.FullName ?? "Khách thuê";
                var notification = new Notification
                {
                    UserId = contract.OwnerId,
                    Type = "ContractResponse",
                    Title = "Lời mời nhận phòng được chấp nhận",
                    Content = $"Khách thuê {tenantName} đã chấp nhận lời mời nhận phòng {contract.Room.RoomNumber} của tòa nhà {contract.Room.Floor.Building.Name}.",
                    LinkedId = contract.Id,
                    IsRead = false,
                    CreatedAt = DateTime.UtcNow
                };
                await _notificationRepository.AddAsync(notification);

                var ownerUser = await _userManager.FindByIdAsync(contract.OwnerId);
                if (ownerUser != null && !string.IsNullOrEmpty(ownerUser.Email))
                {
                    await _emailService.SendEmailAsync(
                        ownerUser.Email,
                        "RoomHub - Lời mời nhận phòng được chấp nhận",
                        $"Xin chào {ownerUser.FullName},<br/><br/>" +
                        $"Khách thuê <b>{tenantName}</b> đã chính thức chấp nhận lời mời nhận phòng <b>{contract.Room.RoomNumber}</b> thuộc tòa nhà <b>{contract.Room.Floor.Building.Name}</b>.<br/>" +
                        $"Hợp đồng hiện đã được chuyển sang trạng thái hoạt động (Active). Bạn có thể truy cập Bảng điều khiển dành cho Chủ nhà để theo dõi dịch vụ.<br/><br/>" +
                        $"Trân trọng,<br/>RoomHub Platform.",
                        true
                    );
                }

                // Đánh dấu thông báo mời nhận phòng cũ là đã đọc
                var inviteNotif = await _notificationRepository.GetInvitationNotificationAsync(tenantId, contract.Id);
                if (inviteNotif != null)
                {
                    inviteNotif.IsRead = true;
                    inviteNotif.Type = "RoomInvitationAccepted";
                    inviteNotif.Content = $"Bạn đã đồng ý nhận phòng {contract.Room.RoomNumber} thuộc tòa nhà {contract.Room.Floor.Building.Name}.";
                    await _notificationRepository.UpdateAsync(inviteNotif);
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

        public async Task<bool> RejectContractAsync(string tenantId)
        {
            var contract = await _contractRepository.GetActiveContractByTenantIdAsync(tenantId);
            if (contract == null || contract.Status != ContractStatus.Pending)
                throw new Exception("Không tìm thấy yêu cầu nhận phòng chờ xác nhận nào.");

            await _unitOfWork.BeginTransactionAsync();
            try
            {
                contract.IsDeleted = true;
                contract.Status = ContractStatus.Terminated;
                contract.UpdatedAt = DateTime.UtcNow;
                await _contractRepository.UpdateAsync(contract);

                var room = await _roomRepository.GetByIdAsync(contract.RoomId);
                if (room != null)
                {
                    room.Status = RoomStatus.Available;
                    room.UpdatedAt = DateTime.UtcNow;
                    await _roomRepository.UpdateAsync(room);
                }

                await _unitOfWork.SaveChangesAsync();

                // Tạo thông báo phản hồi cho Chủ nhà
                var tenantUser = await _userManager.FindByIdAsync(tenantId);
                var tenantName = tenantUser?.FullName ?? "Khách thuê";
                var notification = new Notification
                {
                    UserId = contract.OwnerId,
                    Type = "ContractResponse",
                    Title = "Lời mời nhận phòng bị từ chối",
                    Content = $"Khách thuê {tenantName} đã từ chối lời mời nhận phòng {contract.Room.RoomNumber} của tòa nhà {contract.Room.Floor.Building.Name}.",
                    LinkedId = contract.Id,
                    IsRead = false,
                    CreatedAt = DateTime.UtcNow
                };
                await _notificationRepository.AddAsync(notification);

                var ownerUser = await _userManager.FindByIdAsync(contract.OwnerId);
                if (ownerUser != null && !string.IsNullOrEmpty(ownerUser.Email))
                {
                    await _emailService.SendEmailAsync(
                        ownerUser.Email,
                        "RoomHub - Lời mời nhận phòng bị từ chối",
                        $"Xin chào {ownerUser.FullName},<br/><br/>" +
                        $"Khách thuê <b>{tenantName}</b> đã từ chối lời mời nhận phòng <b>{contract.Room.RoomNumber}</b> thuộc tòa nhà <b>{contract.Room.Floor.Building.Name}</b>.<br/>" +
                        $"Hợp đồng của phòng này đã được hệ thống hủy bỏ để bạn có thể tiếp tục cho thuê hoặc gửi lời mời mới.<br/><br/>" +
                        $"Trân trọng,<br/>RoomHub Platform.",
                        true
                    );
                }

                // Đánh dấu thông báo mời nhận phòng cũ là đã đọc
                var inviteNotif = await _notificationRepository.GetInvitationNotificationAsync(tenantId, contract.Id);
                if (inviteNotif != null)
                {
                    inviteNotif.IsRead = true;
                    inviteNotif.Type = "RoomInvitationRejected";
                    inviteNotif.Content = $"Bạn đã từ chối lời mời nhận phòng {contract.Room.RoomNumber} thuộc tòa nhà {contract.Room.Floor.Building.Name}.";
                    await _notificationRepository.UpdateAsync(inviteNotif);
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

        public async Task<System.Collections.Generic.List<OwnerTenantDto>> GetTenantsForOwnerAsync(string ownerId)
        {
            var contracts = await _contractRepository.GetContractsByOwnerAsync(ownerId);
            return contracts
                .Where(c => (c.Status == ContractStatus.Active || c.Status == ContractStatus.Pending) && !c.IsDeleted)
                .Select(c => new OwnerTenantDto
                {
                    ContractId = c.Id,
                    RoomId = c.RoomId,
                    RoomNumber = c.Room.RoomNumber,
                    BuildingId = c.Room.Floor.Building.Id,
                    BuildingName = c.Room.Floor.Building.Name,
                    TenantId = c.TenantId,
                    TenantName = c.TemporaryTenantName ?? c.Tenant?.FullName ?? "Khách thuê",
                    TenantPhone = c.TemporaryTenantPhone ?? c.Tenant?.PhoneNumber ?? "",
                    TenantEmail = c.TemporaryTenantEmail ?? c.Tenant?.Email ?? "",
                    TenantAvatar = c.Tenant?.AvatarUrl,
                    StartDate = c.StartDate,
                    EndDate = c.EndDate,
                    RentAmount = c.RentAmount,
                    DepositAmount = c.DepositAmount,
                    ContractStatus = c.Status switch
                    {
                        ContractStatus.Pending => "Chờ xác nhận",
                        ContractStatus.Active => "Đang thuê",
                        _ => c.Status.ToString()
                    },
                    IsOnline = c.TenantId != null
                })
                .OrderBy(t => t.BuildingName)
                .ThenBy(t => t.RoomNumber)
                .ToList();
        }
    }
}
