using System.Threading.Tasks;
using Application.Common.DTOs.Dashboard;

namespace Application.Common.Interfaces
{
    public interface IDashboardService
    {
        Task<DashboardDto> GetOwnerDashboardDataAsync(string ownerId);
    }
}
