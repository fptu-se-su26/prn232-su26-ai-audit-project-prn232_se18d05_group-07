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
        Task<UnitDetailDto?> GetUnitDetailAsync(int roomId, string ownerId);
        Task<bool> UpdateUnitStatusAsync(int roomId, string status, string ownerId);
        Task<bool> UpdateUnitNotesAsync(int roomId, string notes, string ownerId);
        Task<bool> UpdateUnitDetailsAsync(int roomId, UpdateUnitDetailsRequest request, string ownerId);
    }
}
