using System;

namespace Domain.Entities
{
    /// <summary>
    /// Ghi nhận một lần đã nhắc hợp đồng sắp hết hạn, để không gửi trùng cùng một mốc.
    /// Chỉ dùng cho việc nhắc nhở — KHÔNG liên quan đến trạng thái hợp đồng.
    /// </summary>
    public class ContractReminderLog
    {
        public long Id { get; set; }
        public int ContractId { get; set; }

        /// <summary>Mốc nhắc tính theo số ngày còn lại: 30, 15 hoặc 7.</summary>
        public int MilestoneDays { get; set; }

        public DateTime SentAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public virtual Contract Contract { get; set; } = null!;
    }
}
