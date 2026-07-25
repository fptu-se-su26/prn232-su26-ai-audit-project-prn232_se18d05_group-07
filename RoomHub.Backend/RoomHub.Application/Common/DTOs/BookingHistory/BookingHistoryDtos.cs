using System;

namespace Application.Common.DTOs.BookingHistory
{
    // Request người thuê gửi khi xem chi tiết một phòng (ghi vào lịch sử xem phòng).
    public class LogRoomViewRequest
    {
        public int RoomId { get; set; }
    }

    // Một dòng lịch sử xem phòng trả về cho client.
    public class BookingHistoryDto
    {
        public long Id { get; set; }
        public int RoomId { get; set; }
        public string? RoomTitle { get; set; }
        public decimal? PriceAtBooking { get; set; }
        public DateTime BookedAt { get; set; }
    }
}
