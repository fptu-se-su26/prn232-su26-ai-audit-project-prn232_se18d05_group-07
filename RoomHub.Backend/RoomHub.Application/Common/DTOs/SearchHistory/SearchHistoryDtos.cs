using System;

namespace Application.Common.DTOs.SearchHistory
{
    // Request người thuê gửi lên khi thực hiện một lượt tìm kiếm.
    // SearchQuery là chuỗi JSON mô tả từ khóa + bộ lọc; ViewedRoomId (tùy chọn) nếu log việc xem 1 phòng.
    public class LogSearchRequest
    {
        public string? SearchQuery { get; set; }
        public int? ViewedRoomId { get; set; }
    }

    // Một dòng lịch sử tìm kiếm trả về cho client.
    public class SearchHistoryDto
    {
        public long Id { get; set; }
        public string? SearchQuery { get; set; }
        public int? ViewedRoomId { get; set; }
        public string? ViewedRoomTitle { get; set; }
        public DateTime Timestamp { get; set; }
    }
}
