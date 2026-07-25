using System.Collections.Generic;
using System.Threading.Tasks;
using Application.Common.DTOs.Services;

namespace Application.Common.Interfaces
{
    public interface IServiceRequestService
    {
        // Người thuê tạo yêu cầu dịch vụ (gắn với hợp đồng đang hiệu lực).
        Task<ServiceRequestDto> CreateAsync(string tenantId, CreateServiceRequestRequest request);

        // Yêu cầu dịch vụ của người thuê hiện tại.
        Task<List<ServiceRequestDto>> GetMyAsync(string tenantId);

        // Người thuê hủy yêu cầu của mình khi còn chờ xử lý.
        Task<bool> CancelAsync(int id, string tenantId);

        // Danh sách yêu cầu dịch vụ từ khách thuê của một chủ trọ.
        Task<List<ServiceRequestDto>> GetForOwnerAsync(string ownerId);

        // Chủ trọ cập nhật trạng thái (và số tiền) yêu cầu của khách thuê mình.
        Task<ServiceRequestDto?> UpdateStatusAsync(int id, string ownerId, UpdateServiceRequestStatusRequest request);
    }
}
