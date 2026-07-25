using System.Collections.Generic;
using System.Threading.Tasks;
using Application.Common.DTOs.Services;

namespace Application.Common.Interfaces
{
    public interface IServiceCatalogService
    {
        Task<List<ServiceDto>> GetAllAsync();
        Task<ServiceDto> CreateAsync(CreateServiceRequest request);
        Task<ServiceDto?> UpdateAsync(int id, UpdateServiceRequest request);
        Task<bool> DeleteAsync(int id);
    }
}
