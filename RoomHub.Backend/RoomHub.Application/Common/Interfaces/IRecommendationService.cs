using System.Threading;
using System.Threading.Tasks;
using Application.Common.DTOs.Recommendations;

namespace Application.Common.Interfaces
{
    /// <summary>
    /// Gợi ý phòng dựa trên dữ liệu hành vi đã thu thập sẵn (phòng đã lưu, phòng đã xem).
    /// Thuần đọc — không ghi dữ liệu, không gọi AI, không tốn token.
    /// </summary>
    public interface IRecommendationService
    {
        /// <summary>
        /// Gợi ý cho một người dùng. <paramref name="userId"/> null nghĩa là khách vãng lai —
        /// khi đó trả về tin nổi bật thay vì lỗi.
        /// </summary>
        Task<RecommendationListDto> GetForYouAsync(string? userId, int take, CancellationToken ct = default);

        /// <summary>Phòng tương tự một phòng cụ thể. Không bao giờ chứa chính phòng đó.</summary>
        Task<RecommendationListDto> GetSimilarAsync(int roomId, int take, CancellationToken ct = default);
    }
}
