using System.Collections.Generic;
using System.Threading.Tasks;
using Application.Common.DTOs.Maintenance;

namespace Application.Common.Interfaces
{
    public interface IMaintenanceTicketService
    {
        // Người thuê tạo yêu cầu bảo trì cho phòng đang thuê. Trả về DTO vừa tạo.
        Task<MaintenanceTicketDto> CreateTicketAsync(string tenantId, CreateMaintenanceTicketRequest request);

        // Danh sách yêu cầu bảo trì của người thuê hiện tại (mới nhất trước).
        Task<List<MaintenanceTicketDto>> GetMyTicketsAsync(string tenantId);

        // Người thuê hủy/xóa yêu cầu của chính mình khi chưa được xử lý. false nếu không tồn tại/không sở hữu/đã xử lý.
        Task<bool> CancelTicketAsync(int id, string tenantId);
    }
}
