using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Common.DTOs.Listings;
using Application.Common.Interfaces;
using Domain.Entities;
using Domain.Enums;
using Domain.Common;
using Microsoft.AspNetCore.Identity;

namespace Application.Services
{
    public class ListingService : IListingService
    {
        private readonly IBuildingRepository _buildingRepository;
        private readonly IRoomRepository _roomRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IModerationService _moderationService;
        private readonly UserManager<ApplicationUser> _userManager;

        public ListingService(
            IBuildingRepository buildingRepository,
            IRoomRepository roomRepository,
            IUnitOfWork unitOfWork,
            IModerationService moderationService,
            UserManager<ApplicationUser> userManager)
        {
            _buildingRepository = buildingRepository;
            _roomRepository = roomRepository;
            _unitOfWork = unitOfWork;
            _moderationService = moderationService;
            _userManager = userManager;
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
                    listings.Add(MapRoomToDto(room));
                }
            }

            return listings;
        }

        public async Task<ListingDto?> GetListingByIdAsync(int roomId, string ownerId)
        {
            var room = await _roomRepository.GetRoomWithDetailsAsync(roomId);
            if (room == null || room.Floor.Building.OwnerId != ownerId || !room.HasListing)
                return null;

            return MapRoomToDto(room);
        }

        public async Task<bool> DeleteListingAsync(int roomId, string ownerId)
        {
            var room = await _roomRepository.GetRoomWithDetailsAsync(roomId);
            if (room == null || room.Floor.Building.OwnerId != ownerId || !room.HasListing)
                return false;

            room.HasListing = false;
            room.IsPublished = false;
            room.HiddenByOwner = false;
            room.Title = $"Phòng {room.RoomNumber}";
            room.Description = null;
            room.ModerationStatus = ModerationStatus.Pending;
            room.ModerationRemarks = null;
            room.ListingScore = 100;
            room.AIFormattedDescription = null;
            room.ModeratedAt = null;
            room.UpdatedAt = DateTime.UtcNow;
            room.RoomPhotos.Clear();

            await _roomRepository.UpdateAsync(room);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        public async Task<DuplicateListingResult> DuplicateListingAsync(
            int roomId, string ownerId, DuplicateListingRequest? request)
        {
            var source = await _roomRepository.GetRoomWithDetailsAsync(roomId);
            if (source == null || source.Floor.Building.OwnerId != ownerId || !source.HasListing)
            {
                return new DuplicateListingResult
                {
                    Success = false,
                    Message = "Không tìm thấy tin đăng nguồn."
                };
            }

            var buildingId = source.Floor.BuildingId;
            Room? target = null;

            if (request?.TargetRoomId is int targetId)
            {
                target = await _roomRepository.GetRoomWithDetailsAsync(targetId);
                if (target == null || target.Floor.Building.OwnerId != ownerId || target.HasListing)
                {
                    return new DuplicateListingResult
                    {
                        Success = false,
                        Message = "Phòng đích không hợp lệ hoặc đã có tin đăng."
                    };
                }
            }
            else
            {
                target = await _roomRepository.FindVacantRoomInBuildingAsync(buildingId, source.Id);
            }

            if (target == null)
            {
                return new DuplicateListingResult
                {
                    Success = false,
                    Message = "Không có phòng trống trong tòa nhà để nhân bản. Vui lòng tạo phòng mới trước."
                };
            }

            var copyTitle = source.Title.Contains("(Bản sao)", StringComparison.OrdinalIgnoreCase)
                ? source.Title
                : $"{source.Title} (Bản sao)";

            target.HasListing = true;
            target.IsPublished = false;
            target.HiddenByOwner = false;
            target.Title = copyTitle;
            target.Description = source.Description;
            target.BasePrice = source.BasePrice;
            target.SurfaceArea = source.SurfaceArea;
            target.MaxCapacity = source.MaxCapacity;
            target.ModerationStatus = ModerationStatus.Pending;
            target.ModerationRemarks = null;
            target.ListingScore = 100;
            target.AIFormattedDescription = null;
            target.ModeratedAt = null;
            target.CreatedAt = DateTime.UtcNow;
            target.UpdatedAt = DateTime.UtcNow;

            target.RoomPhotos.Clear();
            var order = 0;
            foreach (var photo in source.RoomPhotos.OrderBy(p => p.DisplayOrder))
            {
                target.RoomPhotos.Add(new RoomPhoto
                {
                    Url = photo.Url,
                    PublicId = photo.PublicId,
                    IsMain = order == 0,
                    DisplayOrder = order++,
                    UploadedAt = DateTime.UtcNow
                });
            }

            await _roomRepository.UpdateAsync(target);
            await _unitOfWork.SaveChangesAsync();

            var reloaded = await _roomRepository.GetRoomWithDetailsAsync(target.Id);
            return new DuplicateListingResult
            {
                Success = true,
                Message = $"Đã nhân bản tin sang phòng {target.RoomNumber}. Tin mới đang ở trạng thái nháp.",
                Listing = reloaded != null ? MapRoomToDto(reloaded) : null
            };
        }

        private static ListingDto MapRoomToDto(Room room)
        {
            var building = room.Floor.Building;
            return new ListingDto
            {
                RoomId = room.Id,
                Title = room.Title ?? $"Phòng trọ {room.RoomNumber} tiện ích tại {building.Name}",
                Description = room.Description ?? "",
                Price = room.BasePrice,
                Area = room.SurfaceArea ?? 25,
                Capacity = room.MaxCapacity,
                IsPublished = room.IsPublished,
                IsHidden = room.HiddenByOwner,
                BuildingName = building.Name,
                RoomNumber = room.RoomNumber,
                Views = (room.Id * 47) % 180 + 35,
                CreatedDate = room.CreatedAt.ToString("dd/MM/yyyy"),
                Type = room.RoomType switch
                {
                    RoomType.Studio => "Studio",
                    RoomType.MiniApartment => "Căn hộ mini",
                    RoomType.Apartment => "Căn hộ",
                    _ => "Phòng trọ"
                },
                ImageUrls = room.RoomPhotos.OrderBy(p => p.DisplayOrder).Select(p => p.Url).ToList(),
                ModerationStatus = room.ModerationStatus.ToString(),
                ModerationRemarks = room.ModerationRemarks,
                ListingScore = room.ListingScore,
                AIFormattedDescription = room.AIFormattedDescription
            };
        }

        public async Task<ListingUpdateResult?> UpdateListingAsync(int roomId, UpdateListingRequest request, string ownerId)
        {
            var room = await _roomRepository.GetRoomWithDetailsAsync(roomId);
            if (room == null || room.Floor.Building.OwnerId != ownerId)
                return null;

            await CheckAndIncrementAiAuditLimitAsync(ownerId);

            room.Title = request.Title;
            room.Description = request.Description;
            room.BasePrice = request.Price;
            room.SurfaceArea = request.Area;
            room.MaxCapacity = request.Capacity;
            room.HasListing = true;
            room.UpdatedAt = DateTime.UtcNow;
            room.ModerationStatus = ModerationStatus.Pending;

            room.RoomPhotos.Clear();
            if (request.ImageUrls != null)
            {
                int order = 0;
                foreach (var url in request.ImageUrls)
                {
                    room.RoomPhotos.Add(new RoomPhoto
                    {
                        Url = url,
                        PublicId = url,
                        IsMain = order == 0,
                        DisplayOrder = order++,
                        UploadedAt = DateTime.UtcNow
                    });
                }
            }

            var modResult = await RunModerationAsync(
                request.Title, request.Description, request.ImageUrls ?? new List<string>(), request.Price, request.Area);
            ApplyModerationToRoom(room, modResult, request.IsPublished);

            await _roomRepository.UpdateAsync(room);
            await _unitOfWork.SaveChangesAsync();

            return BuildResult(modResult, room.IsPublished, request.IsPublished);
        }

        public async Task<ListingUpdateResult?> TogglePublishStatusAsync(int roomId, bool isPublished, string ownerId)
        {
            var room = await _roomRepository.GetRoomWithDetailsAsync(roomId);
            if (room == null || room.Floor.Building.OwnerId != ownerId)
                return null;

            room.HasListing = true;
            room.UpdatedAt = DateTime.UtcNow;

            if (!isPublished)
            {
                room.IsPublished = false;
                room.HiddenByOwner = true;
                await _roomRepository.UpdateAsync(room);
                await _unitOfWork.SaveChangesAsync();
                return new ListingUpdateResult
                {
                    Success = true,
                    ModerationStatus = room.ModerationStatus.ToString(),
                    ModerationRemarks = room.ModerationRemarks,
                    ListingScore = room.ListingScore,
                    IsPublished = false,
                    Message = "Ẩn tin thành công."
                };
            }

            if (!room.HasListing || string.IsNullOrWhiteSpace(room.Title))
            {
                return new ListingUpdateResult
                {
                    Success = false,
                    ModerationStatus = room.ModerationStatus.ToString(),
                    ModerationRemarks = "Tin đăng chưa có nội dung. Vui lòng tạo tin trước khi đăng công khai.",
                    ListingScore = room.ListingScore,
                    IsPublished = false,
                    Message = "Tin đăng chưa có nội dung. Vui lòng tạo tin trước khi đăng công khai."
                };
            }

            await CheckAndIncrementAiAuditLimitAsync(ownerId);

            room.ModerationStatus = ModerationStatus.Pending;
            var imageUrls = room.RoomPhotos.OrderBy(p => p.DisplayOrder).Select(p => p.Url).ToList();
            var modResult = await RunModerationAsync(
                room.Title, room.Description ?? "", imageUrls, room.BasePrice, room.SurfaceArea ?? 25);
            ApplyModerationToRoom(room, modResult, requestedPublish: true);

            await _roomRepository.UpdateAsync(room);
            await _unitOfWork.SaveChangesAsync();

            return BuildResult(modResult, room.IsPublished, requestedPublish: true);
        }

        private async Task<ModerationResult> RunModerationAsync(
            string title, string description, List<string> imageUrls, decimal price, decimal area)
        {
            try
            {
                return await _moderationService.ModerateListingAsync(title, description, imageUrls, price, area);
            }
            catch (Exception ex)
            {
                return new ModerationResult
                {
                    Status = ModerationStatus.Flagged,
                    Reason = $"[Hệ thống] Lỗi pipeline: {ex.Message}",
                    UserMessage = "Hệ thống kiểm duyệt tạm thời gặp sự cố. Tin đã chuyển Admin duyệt thủ công.",
                    QualityScore = 50,
                    AutoFormattedText = description
                };
            }
        }

        private static void ApplyModerationToRoom(Room room, ModerationResult modResult, bool requestedPublish)
        {
            room.ModerationStatus = modResult.Status;
            room.ModerationRemarks = modResult.Reason;
            room.ListingScore = modResult.QualityScore;
            room.AIFormattedDescription = modResult.AutoFormattedText;
            room.ModeratedAt = DateTime.UtcNow;

            room.IsPublished = modResult.Status == ModerationStatus.Approved && requestedPublish;
            if (room.IsPublished)
                room.HiddenByOwner = false;
        }

        public async Task<StepValidationResult> ValidateContentAsync(ValidateContentRequest request)
        {
            var modResult = await _moderationService.ModerateContentAsync(
                request.Title,
                request.Description,
                request.Price,
                request.Area);

            var message = !string.IsNullOrWhiteSpace(modResult.UserMessage)
                ? modResult.UserMessage
                : modResult.Reason;

            var aiSkipped = modResult.Reason.Contains("AI sẽ kiểm tra", StringComparison.OrdinalIgnoreCase)
                || modResult.Reason.Contains("bỏ qua AI", StringComparison.OrdinalIgnoreCase);

            return new StepValidationResult
            {
                IsValid = modResult.Status == ModerationStatus.Approved,
                Message = message,
                Field = InferValidationField(modResult.Reason),
                ListingScore = modResult.QualityScore,
                AiSkipped = aiSkipped
            };
        }

        private static string? InferValidationField(string reason)
        {
            if (string.IsNullOrWhiteSpace(reason)) return null;

            var r = reason.ToLowerInvariant();
            if (r.Contains("giá thuê") || r.Contains("giá")) return "rentPrice";
            if (r.Contains("tiêu đề")) return "title";
            if (r.Contains("mô tả")) return "description";
            if (r.Contains("diện tích")) return "area";
            return "description";
        }

        private static ListingUpdateResult BuildResult(ModerationResult modResult, bool actualIsPublished, bool requestedPublish)
        {
            var message = !string.IsNullOrWhiteSpace(modResult.UserMessage)
                ? modResult.UserMessage
                : modResult.Status switch
                {
                    ModerationStatus.Approved => actualIsPublished
                        ? "Tin đăng đã vượt qua kiểm duyệt AI và được công bố."
                        : "Tin đăng đã vượt qua kiểm duyệt AI. Lưu bản nháp thành công.",
                    ModerationStatus.Rejected => "Tin đăng không đạt tiêu chuẩn kiểm duyệt.",
                    ModerationStatus.Flagged => "Tin đăng cần Admin duyệt thủ công.",
                    _ => "Tin đăng đang chờ kiểm duyệt."
                };

            return new ListingUpdateResult
            {
                Success = modResult.Status != ModerationStatus.Rejected,
                ModerationStatus = modResult.Status.ToString(),
                ModerationRemarks = modResult.Reason,
                ListingScore = modResult.QualityScore,
                IsPublished = actualIsPublished,
                Message = message
            };
        }

        private async Task CheckAndIncrementAiAuditLimitAsync(string ownerId)
        {
            var user = await _userManager.FindByIdAsync(ownerId);
            if (user == null)
            {
                throw new InvalidOperationException("Không tìm thấy thông tin tài khoản chủ nhà.");
            }

            var maxAudits = SubscriptionLimits.GetMaxAiAudits(user.CurrentPlan);
            if (maxAudits == int.MaxValue)
            {
                return;
            }

            var now = DateTime.UtcNow;
            if (user.LastAiAuditResetDate == null || 
                user.LastAiAuditResetDate.Value.Month != now.Month || 
                user.LastAiAuditResetDate.Value.Year != now.Year)
            {
                user.MonthlyAiAuditCount = 0;
                user.LastAiAuditResetDate = now;
            }

            if (user.MonthlyAiAuditCount >= maxAudits)
            {
                throw new InvalidOperationException($"Tài khoản gói Starter (Miễn phí) của bạn đã sử dụng hết lượt kiểm duyệt tin đăng bằng AI trong tháng này (tối đa {maxAudits} lần/tháng). Vui lòng nâng cấp lên gói Pro để có lượt dùng không giới hạn.");
            }

            user.MonthlyAiAuditCount++;
            await _userManager.UpdateAsync(user);
        }
    }
}
