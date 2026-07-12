using System.Collections.Generic;
using System.Threading.Tasks;
using Application.Common.DTOs.SearchHistory;

namespace Application.Common.Interfaces
{
    public interface ISearchHistoryService
    {
        // Ghi lại một lượt tìm kiếm của người thuê. Trả về DTO vừa tạo.
        Task<SearchHistoryDto> LogAsync(string userId, LogSearchRequest request);

        // Lịch sử tìm kiếm của người thuê hiện tại (mới nhất trước).
        Task<List<SearchHistoryDto>> GetMyHistoryAsync(string userId);

        // Xóa 1 mục lịch sử của chính mình. false nếu không tồn tại/không sở hữu.
        Task<bool> DeleteAsync(long id, string userId);

        // Xóa toàn bộ lịch sử của người thuê hiện tại.
        Task ClearAsync(string userId);
    }
}
