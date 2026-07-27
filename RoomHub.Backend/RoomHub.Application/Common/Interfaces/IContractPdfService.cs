using System.Threading;
using System.Threading.Tasks;

namespace Application.Common.Interfaces
{
    /// <summary>
    /// Xuất hợp đồng thuê ra PDF. Thuần đọc — không thay đổi hợp đồng.
    ///
    /// Có ba cách xác định hợp đồng vì hai màn hình gọi tới đây không nắm ContractId:
    /// người thuê chỉ biết "phòng của tôi", chủ trọ chỉ biết "phòng số mấy".
    /// </summary>
    public interface IContractPdfService
    {
        /// <summary>
        /// Sinh PDF theo mã hợp đồng. Chỉ chủ trọ sở hữu hoặc chính người thuê của hợp đồng
        /// đó mới được phép; trường hợp khác ném <see cref="System.UnauthorizedAccessException"/>.
        /// </summary>
        Task<(byte[] Content, string FileName)> GenerateAsync(int contractId, string userId, CancellationToken ct = default);

        /// <summary>Sinh PDF cho hợp đồng đang hiệu lực của người thuê đang đăng nhập.</summary>
        Task<(byte[] Content, string FileName)> GenerateForTenantAsync(string tenantId, CancellationToken ct = default);

        /// <summary>Sinh PDF cho hợp đồng đang hiệu lực của một phòng thuộc chủ trọ đang đăng nhập.</summary>
        Task<(byte[] Content, string FileName)> GenerateForRoomAsync(int roomId, string ownerId, CancellationToken ct = default);
    }
}
