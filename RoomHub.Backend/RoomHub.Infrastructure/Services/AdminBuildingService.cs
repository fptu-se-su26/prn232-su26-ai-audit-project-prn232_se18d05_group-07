using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Common.DTOs.Admin;
using Application.Common.Interfaces;
using Domain.Enums;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Services
{
    public class AdminBuildingService : IAdminBuildingService
    {
        private readonly ApplicationDbContext _context;

        public AdminBuildingService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<AdminBuildingDto>> GetAllBuildingsAsync()
        {
            var rawData = await _context.Buildings
                .AsNoTracking()
                .Where(b => !b.IsDeleted)
                .OrderByDescending(b => b.CreatedAt)
                .Select(b => new
                {
                    b.Id,
                    b.Name,
                    b.Address,
                    b.District,
                    b.City,
                    b.Ward,
                    b.OwnerId,
                    OwnerName = b.Owner != null && !string.IsNullOrWhiteSpace(b.Owner.FullName)
                        ? b.Owner.FullName
                        : (b.Owner != null && !string.IsNullOrWhiteSpace(b.Owner.Email) ? b.Owner.Email : "Chủ nhà"),
                    OwnerEmail = b.Owner != null ? b.Owner.Email : null,
                    OwnerPhone = b.Owner != null ? b.Owner.PhoneNumber : null,
                    TotalRooms = b.Floors.SelectMany(f => f.Rooms).Count(r => !r.IsDeleted),
                    OccupiedRooms = b.Floors.SelectMany(f => f.Rooms).Count(r => !r.IsDeleted && (r.Status == RoomStatus.Occupied || r.Status == RoomStatus.Deposited)),
                    MaintenanceRooms = b.Floors.SelectMany(f => f.Rooms).Count(r => !r.IsDeleted && (r.Status == RoomStatus.Maintenance || r.Status == RoomStatus.UnderMaintenance)),
                    b.ElectricityPrice,
                    b.WaterPrice,
                    b.WaterBillingType,
                    b.InternetPrice,
                    b.GarbagePrice,
                    b.ThumbnailUrl,
                    b.IsLocked,
                    b.LockReason,
                    b.CreatedAt
                })
                .ToListAsync();

            return rawData.Select(b => new AdminBuildingDto
            {
                Id = b.Id,
                Name = b.Name ?? "Tòa nhà",
                Address = b.Address ?? "",
                District = string.IsNullOrWhiteSpace(b.District) ? (b.City ?? "Đà Nẵng") : b.District,
                City = b.City ?? "Đà Nẵng",
                Ward = b.Ward ?? "",
                OwnerId = b.OwnerId ?? "",
                OwnerName = b.OwnerName,
                OwnerEmail = b.OwnerEmail ?? "Chưa cập nhật",
                OwnerPhone = b.OwnerPhone ?? "Chưa cập nhật",
                TotalRooms = b.TotalRooms,
                OccupiedRooms = b.OccupiedRooms,
                MaintenanceRooms = b.MaintenanceRooms,
                VacantRooms = Math.Max(0, b.TotalRooms - b.OccupiedRooms - b.MaintenanceRooms),
                ElectricityPrice = b.ElectricityPrice,
                WaterPrice = b.WaterPrice,
                WaterBillingType = b.WaterBillingType ?? "PerCubicMeter",
                InternetPrice = b.InternetPrice,
                GarbagePrice = b.GarbagePrice,
                ThumbnailUrl = string.IsNullOrWhiteSpace(b.ThumbnailUrl)
                    ? "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80"
                    : b.ThumbnailUrl,
                IsLocked = b.IsLocked,
                LockReason = b.LockReason,
                CreatedAt = b.CreatedAt.ToString("dd/MM/yyyy")
            }).ToList();
        }

        public async Task<bool> ToggleLockBuildingAsync(int buildingId, string? reason)
        {
            var building = await _context.Buildings
                .Include(b => b.Floors)
                    .ThenInclude(f => f.Rooms)
                .FirstOrDefaultAsync(b => b.Id == buildingId && !b.IsDeleted);

            if (building == null) return false;

            building.IsLocked = !building.IsLocked;
            building.LockReason = building.IsLocked ? (string.IsNullOrWhiteSpace(reason) ? "Vi phạm quy định nền tảng" : reason) : null;
            building.UpdatedAt = DateTime.UtcNow;

            // Cascade lock/unlock status to rooms under this building
            foreach (var floor in building.Floors)
            {
                foreach (var room in floor.Rooms)
                {
                    if (building.IsLocked)
                    {
                        room.HiddenByOwner = true;
                        room.IsPublished = false;
                    }
                    else
                    {
                        room.HiddenByOwner = false;
                        room.IsPublished = true;
                    }
                    room.UpdatedAt = DateTime.UtcNow;
                }
            }

            // Create Notification for Landlord
            var notification = new Domain.Entities.Notification
            {
                UserId = building.OwnerId,
                Type = building.IsLocked ? "BuildingLocked" : "BuildingUnlocked",
                Title = building.IsLocked 
                    ? $"🚫 Tòa nhà \"{building.Name}\" đã bị tạm khóa" 
                    : $"🟢 Tòa nhà \"{building.Name}\" đã được mở khóa",
                Content = building.IsLocked
                    ? $"Tòa nhà \"{building.Name}\" của bạn đã bị Quản trị viên tạm khóa. Lý do: {building.LockReason}. Tất cả bài đăng/phòng trọ thuộc tòa nhà này tạm thời bị ẩn khỏi hệ thống tìm kiếm."
                    : $"Tòa nhà \"{building.Name}\" của bạn đã được Quản trị viên mở khóa hoạt động trở lại.",
                LinkedId = building.Id,
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };
            _context.Notifications.Add(notification);

            await _context.SaveChangesAsync();
            return true;
        }
    }
}
