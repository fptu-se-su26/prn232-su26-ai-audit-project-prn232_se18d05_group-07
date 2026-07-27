using System.Threading;
using System.Threading.Tasks;

namespace Application.Common.Interfaces
{
    /// <summary>
    /// Nhắc hợp đồng sắp hết hạn.
    ///
    /// QUAN TRỌNG: dịch vụ này CHỈ ĐỌC bảng Contract. Nó KHÔNG bao giờ ghi
    /// <c>Contract.Status</c>. Lý do: <c>ContractStatus.Active</c> đang được lọc ở khoảng
    /// 12 nơi (quyền chat, quyền gửi yêu cầu dịch vụ, quyền đánh giá...), và
    /// <c>Renewed</c>/<c>Expired</c> tuy chưa bao giờ được ghi nhưng vẫn ĐANG ĐƯỢC ĐỌC ở
    /// <c>ReviewRepository</c>. Việc tự động đổi trạng thái được tách sang một Issue riêng.
    /// </summary>
    public interface IContractReminderService
    {
        /// <summary>Quét hợp đồng sắp hết hạn và tạo thông báo. Trả về số thông báo đã tạo.</summary>
        Task<int> SendExpiryRemindersAsync(CancellationToken ct = default);
    }
}
