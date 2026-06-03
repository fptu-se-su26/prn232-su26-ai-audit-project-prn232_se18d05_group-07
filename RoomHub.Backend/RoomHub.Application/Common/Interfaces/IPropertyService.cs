using System.Collections.Generic;
using System.Threading.Tasks;
using Application.Common.DTOs.Properties;

namespace Application.Common.Interfaces
{
    public interface IPropertyService
    {
        Task<List<PropertyDto>> GetPropertiesByOwnerAsync(string ownerId);
        Task<PropertyDetailDto?> GetPropertyDetailWithOwnerAsync(int propertyId, string ownerId);
        Task<bool> CreatePropertyWithOwnerAsync(CreatePropertyRequestDto request, string ownerId);
    }
}
