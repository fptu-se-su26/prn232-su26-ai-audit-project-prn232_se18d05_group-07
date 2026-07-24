using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Application.Common.DTOs.Assistant;

namespace Application.Common.Interfaces
{
    /// <summary>
    /// Trợ lý AI tìm phòng bằng ngôn ngữ tự nhiên (RAG hybrid).
    /// </summary>
    public interface IRoomAssistantService
    {
        /// <param name="request">Câu chat + lịch sử hội thoại + bộ lọc lượt trước.</param>
        /// <param name="userId">Id người dùng nếu đã đăng nhập (null nếu ẩn danh).</param>
        Task<AssistantResponse> SearchAsync(AssistantRequest request, string? userId);

        /// <summary>
        /// Phiên bản streaming (Phase 2): phát meta → token → done qua SSE.
        /// </summary>
        IAsyncEnumerable<AssistantStreamEvent> SearchStreamAsync(
            AssistantRequest request, string? userId, CancellationToken ct = default);
    }
}
