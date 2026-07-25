using System;

namespace Application.Common.DTOs.Maintenance
{
    // Request người thuê gửi khi tạo một yêu cầu bảo trì cho phòng đang thuê.
    public class CreateMaintenanceTicketRequest
    {
        public string Title { get; set; } = null!;
        public string? Description { get; set; }
    }

    // Một yêu cầu bảo trì trả về cho client.
    public class MaintenanceTicketDto
    {
        public int Id { get; set; }
        public int RoomId { get; set; }
        public string? RoomTitle { get; set; }
        public string Title { get; set; } = null!;
        public string? Description { get; set; }
        public string Status { get; set; } = null!;   // Open | InProgress | Resolved
        public DateTime CreatedAt { get; set; }
        public DateTime? ResolvedAt { get; set; }
    }
}
