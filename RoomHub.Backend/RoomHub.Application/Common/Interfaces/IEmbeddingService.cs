using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Application.Common.Interfaces
{
    /// <summary>
    /// Sinh vector embedding cho tìm kiếm ngữ nghĩa (Phase 2 — semantic search).
    /// </summary>
    public interface IEmbeddingService
    {
        /// <summary>Có cấu hình key để dùng được không.</summary>
        bool IsAvailable { get; }

        /// <summary>Embed một đoạn văn bản. Trả null nếu lỗi/không khả dụng.</summary>
        Task<float[]?> EmbedAsync(string text, CancellationToken ct = default);

        /// <summary>Embed nhiều văn bản trong 1 lượt gọi (batch). Mỗi phần tử null nếu lỗi.</summary>
        Task<IReadOnlyList<float[]?>> EmbedBatchAsync(IReadOnlyList<string> texts, CancellationToken ct = default);
    }
}
