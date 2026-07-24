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
                CreatedAt = b.CreatedAt.ToString("dd/MM/yyyy")
            }).ToList();
        }
    }
}
