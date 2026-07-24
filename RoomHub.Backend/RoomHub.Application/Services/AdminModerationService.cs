using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Common.DTOs.Listings;
using Application.Common.Interfaces;
using Domain.Entities;
using Domain.Enums;

namespace Application.Services
{
    public class AdminModerationService : IAdminModerationService
    {
        private readonly IRoomRepository _roomRepository;
        private readonly INotificationRepository _notificationRepository;
        private readonly IUnitOfWork _unitOfWork;

        public AdminModerationService(IRoomRepository roomRepository, INotificationRepository notificationRepository, IUnitOfWork unitOfWork)
        {
            _roomRepository = roomRepository;
            _notificationRepository = notificationRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task<List<AdminModerationListingDto>> GetFlaggedListingsAsync()
        {
            var rooms = await _roomRepository.GetListingsByModerationStatusAsync(ModerationStatus.Flagged);
            return rooms.Select(MapToDto).ToList();
        }

        public async Task<List<AdminModerationListingDto>> GetAllListingsAsync(string? status = null)
        {
            ModerationStatus? filter = null;
            if (!string.IsNullOrWhiteSpace(status) && status.ToLowerInvariant() != "all")
            {
                if (Enum.TryParse<ModerationStatus>(status, true, out var parsed))
                    filter = parsed;
            }

            var rooms = await _roomRepository.GetListingsByModerationStatusAsync(filter);
            return rooms.Select(MapToDto).ToList();
        }

        public async Task<AdminModerationStatsDto> GetStatsAsync()
        {
            var monthStart = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1, 0, 0, 0, DateTimeKind.Utc);

            return new AdminModerationStatsDto
            {
                FlaggedCount = await _roomRepository.CountListingsByModerationStatusAsync(ModerationStatus.Flagged),
                PendingCount = await _roomRepository.CountListingsByModerationStatusAsync(ModerationStatus.Pending),
                ApprovedThisMonth = await _roomRepository.CountListingsModeratedSinceAsync(ModerationStatus.Approved, monthStart),
                RejectedThisMonth = await _roomRepository.CountListingsModeratedSinceAsync(ModerationStatus.Rejected, monthStart)
            };
        }

        public async Task<AdminModerationActionResult?> ApproveListingAsync(
            int roomId, string adminId, AdminModerationActionRequest request)
        {
            var room = await _roomRepository.GetRoomWithDetailsAsync(roomId);
            if (room == null || !room.HasListing)
                return null;

            if (room.ModerationStatus != ModerationStatus.Flagged && room.ModerationStatus != ModerationStatus.Pending)
            {
                return new AdminModerationActionResult
                {
                    Success = false,
                    Message = "Tin đăng này không ở trạng thái chờ Admin duyệt.",
                    ModerationStatus = room.ModerationStatus.ToString(),
                    IsPublished = room.IsPublished
                };
            }

            var note = string.IsNullOrWhiteSpace(request.Remarks) ? "Admin đã duyệt thủ công." : request.Remarks.Trim();
            room.ModerationStatus = ModerationStatus.Approved;
            room.ModerationRemarks = AppendAuditNote(room.ModerationRemarks, adminId, $"DUYỆT — {note}");
            room.ModeratedAt = DateTime.UtcNow;
            room.IsPublished = request.Publish;
            room.UpdatedAt = DateTime.UtcNow;

            await _roomRepository.UpdateAsync(room);
            await NotifyOwnerAsync(room, approved: true);
            await _unitOfWork.SaveChangesAsync();

            return new AdminModerationActionResult
            {
                Success = true,
                Message = request.Publish
                    ? "Đã duyệt và công bố tin đăng."
                    : "Đã duyệt tin đăng (chưa công bố).",
                ModerationStatus = ModerationStatus.Approved.ToString(),
                IsPublished = room.IsPublished
            };
        }

        public async Task<AdminModerationActionResult?> RejectListingAsync(
            int roomId, string adminId, AdminModerationActionRequest request)
        {
            var room = await _roomRepository.GetRoomWithDetailsAsync(roomId);
            if (room == null || !room.HasListing)
                return null;

            if (room.ModerationStatus != ModerationStatus.Flagged && room.ModerationStatus != ModerationStatus.Pending)
            {
                return new AdminModerationActionResult
                {
                    Success = false,
                    Message = "Tin đăng này không ở trạng thái chờ Admin duyệt.",
                    ModerationStatus = room.ModerationStatus.ToString(),
                    IsPublished = room.IsPublished
                };
            }

            var note = string.IsNullOrWhiteSpace(request.Remarks)
                ? "Admin từ chối — nội dung không đạt tiêu chuẩn."
                : request.Remarks.Trim();

            room.ModerationStatus = ModerationStatus.Rejected;
            room.ModerationRemarks = AppendAuditNote(room.ModerationRemarks, adminId, $"TỪ CHỐI — {note}");
            room.ModeratedAt = DateTime.UtcNow;
            room.IsPublished = false;
            room.UpdatedAt = DateTime.UtcNow;

            await _roomRepository.UpdateAsync(room);
            await NotifyOwnerAsync(room, approved: false);
            await _unitOfWork.SaveChangesAsync();

            return new AdminModerationActionResult
            {
                Success = true,
                Message = "Đã từ chối tin đăng.",
                ModerationStatus = ModerationStatus.Rejected.ToString(),
                IsPublished = false
            };
        }

        private async Task NotifyOwnerAsync(Room room, bool approved)
        {
            var ownerId = room.Floor?.Building?.OwnerId;
            if (string.IsNullOrEmpty(ownerId))
                return;

            var roomLabel = room.Title ?? $"Phòng {room.RoomNumber}";
            var notification = new Notification
            {
                UserId = ownerId,
                Type = approved ? "ListingApproved" : "ListingRejected",
                Title = approved ? "Tin đăng đã được duyệt" : "Tin đăng bị từ chối",
                Content = approved
                    ? $"Tin đăng \"{roomLabel}\" của bạn đã được Admin duyệt{(room.IsPublished ? " và công bố" : "")}."
                    : $"Tin đăng \"{roomLabel}\" của bạn đã bị Admin từ chối. Vui lòng kiểm tra ghi chú kiểm duyệt để chỉnh sửa lại.",
                LinkedId = room.Id,
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };
            await _notificationRepository.AddAsync(notification);
        }

        private static AdminModerationListingDto MapToDto(Room room) => new()
        {
            RoomId = room.Id,
            Title = room.Title ?? "",
            Description = room.Description ?? "",
            Price = room.BasePrice,
            Area = room.SurfaceArea ?? 0,
            OwnerName = room.Floor?.Building?.Owner?.FullName ?? "—",
            OwnerEmail = room.Floor?.Building?.Owner?.Email ?? "",
            BuildingName = room.Floor?.Building?.Name ?? "",
            District = room.Floor?.Building?.District ?? "",
            ImageUrls = room.RoomPhotos.OrderBy(p => p.DisplayOrder).Select(p => p.Url).ToList(),
            ModerationStatus = room.ModerationStatus.ToString(),
            ModerationRemarks = room.ModerationRemarks,
            ListingScore = room.ListingScore,
            IsPublished = room.IsPublished,
            ModeratedAt = room.ModeratedAt,
            SubmittedAt = room.UpdatedAt ?? room.CreatedAt
        };

        private static string AppendAuditNote(string? existing, string adminId, string action)
        {
            var stamp = $"[{DateTime.UtcNow:dd/MM/yyyy HH:mm} | Admin:{adminId}] {action}";
            return string.IsNullOrWhiteSpace(existing) ? stamp : $"{existing}\n{stamp}";
        }
    }
}
