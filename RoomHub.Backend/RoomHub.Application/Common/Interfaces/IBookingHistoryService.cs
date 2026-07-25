using System.Collections.Generic;
using System.Threading.Tasks;
using Application.Common.DTOs.BookingHistory;

namespace Application.Common.Interfaces
{
    public interface IBookingHistoryService
    {
        // Ghi lại việc người thuê xem một phòng. Nếu đã xem trước đó thì cập nhật thời điểm mới nhất.
        Task<BookingHistoryDto> LogViewAsync(string tenantId, LogRoomViewRequest request);

        // Lịch sử xem phòng của người thuê hiện tại (mới nhất trước).
        Task<List<BookingHistoryDto>> GetMyHistoryAsync(string tenantId);

        // Xóa 1 mục. false nếu không tồn tại/không sở hữu.
        Task<bool> DeleteAsync(long id, string tenantId);

        // Xóa toàn bộ lịch sử xem phòng của người thuê hiện tại.
        Task ClearAsync(string tenantId);
    }
}
