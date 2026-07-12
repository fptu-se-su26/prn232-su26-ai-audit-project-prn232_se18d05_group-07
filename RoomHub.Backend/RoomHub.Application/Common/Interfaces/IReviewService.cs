using System.Collections.Generic;
using System.Threading.Tasks;
using Application.Common.DTOs.Reviews;

namespace Application.Common.Interfaces
{
    public interface IReviewService
    {
        // Người thuê tạo đánh giá cho phòng. Trả về DTO vừa tạo.
        Task<ReviewDto> CreateReviewAsync(string tenantId, CreateReviewRequest request);

        // Tổng hợp đánh giá của một phòng (điểm trung bình + danh sách).
        Task<RoomReviewSummaryDto> GetRoomReviewsAsync(int roomId);

        // Danh sách đánh giá do người thuê hiện tại đã viết.
        Task<List<ReviewDto>> GetMyReviewsAsync(string tenantId);

        // Người thuê sửa đánh giá của chính mình. null nếu không tồn tại/không sở hữu.
        Task<ReviewDto?> UpdateReviewAsync(int id, string tenantId, UpdateReviewRequest request);

        // Người thuê xóa đánh giá của chính mình. false nếu không tồn tại/không sở hữu.
        Task<bool> DeleteReviewAsync(int id, string tenantId);
    }
}
