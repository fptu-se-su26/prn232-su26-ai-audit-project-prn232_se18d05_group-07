using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Common.DTOs.BookingHistory;
using Application.Common.Interfaces;
using Domain.Entities;

namespace Application.Services
{
    public class BookingHistoryService : IBookingHistoryService
    {
        private readonly IBookingHistoryRepository _repository;
        private readonly IUnitOfWork _unitOfWork;

        public BookingHistoryService(IBookingHistoryRepository repository, IUnitOfWork unitOfWork)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
        }

        public async Task<BookingHistoryDto> LogViewAsync(string tenantId, LogRoomViewRequest request)
        {
            var room = await _repository.GetRoomAsync(request.RoomId);
            if (room == null)
                throw new ArgumentException("Không tìm thấy phòng.");

            // Nếu đã có lịch sử xem phòng này, cập nhật thời điểm và giá mới nhất để tránh trùng lặp.
            var existing = await _repository.GetByTenantAndRoomAsync(tenantId, request.RoomId);
            if (existing != null)
            {
                existing.BookedAt = DateTime.UtcNow;
                existing.PriceAtBooking = room.BasePrice;
                await _repository.UpdateAsync(existing);
                await _unitOfWork.SaveChangesAsync();
                return MapToDto(existing, room.Title);
            }

            var entry = new BookingHistory
            {
                TenantId = tenantId,
                RoomId = room.Id,
                BookedAt = DateTime.UtcNow,
                PriceAtBooking = room.BasePrice
            };
            await _repository.AddAsync(entry);
            await _unitOfWork.SaveChangesAsync();
            return MapToDto(entry, room.Title);
        }

        public async Task<List<BookingHistoryDto>> GetMyHistoryAsync(string tenantId)
        {
            var items = await _repository.GetByTenantIdAsync(tenantId);
            return items.Select(b => MapToDto(b, b.Room?.Title)).ToList();
        }

        public async Task<bool> DeleteAsync(long id, string tenantId)
        {
            var entry = await _repository.GetByIdAsync(id);
            if (entry == null || entry.TenantId != tenantId)
                return false;

            await _repository.DeleteAsync(entry);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        public async Task ClearAsync(string tenantId)
        {
            await _repository.ClearByTenantIdAsync(tenantId);
            await _unitOfWork.SaveChangesAsync();
        }

        private static BookingHistoryDto MapToDto(BookingHistory b, string? roomTitle)
        {
            return new BookingHistoryDto
            {
                Id = b.Id,
                RoomId = b.RoomId,
                RoomTitle = roomTitle,
                PriceAtBooking = b.PriceAtBooking,
                BookedAt = b.BookedAt
            };
        }
    }
}
