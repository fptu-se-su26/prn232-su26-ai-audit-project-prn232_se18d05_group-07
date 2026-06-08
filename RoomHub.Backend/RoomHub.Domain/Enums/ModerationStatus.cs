namespace Domain.Enums
{
    public enum ModerationStatus
    {
        Pending = 0,    // Đang chờ kiểm duyệt
        Approved = 1,   // Đã được duyệt và cho phép hiển thị
        Rejected = 2,   // Bị từ chối do vi phạm quy tắc đăng tin
        Flagged = 3     // Nghi vấn vi phạm (Chuyển Admin duyệt thủ công)
    }
}
