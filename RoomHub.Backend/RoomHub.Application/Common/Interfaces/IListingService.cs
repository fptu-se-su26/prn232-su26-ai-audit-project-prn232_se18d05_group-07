using System.Collections.Generic;
using System.Threading.Tasks;
using Application.Common.DTOs.Listings;

namespace Application.Common.Interfaces
{
    public interface IListingService
    {
        Task<List<ListingDto>> GetOwnerListingsAsync(string ownerId);
        Task<ListingDto?> GetListingByIdAsync(int roomId, string ownerId);
        Task<ListingUpdateResult?> UpdateListingAsync(int roomId, UpdateListingRequest request, string ownerId);
        Task<ListingUpdateResult?> TogglePublishStatusAsync(int roomId, bool isPublished, string ownerId);
        Task<StepValidationResult> ValidateContentAsync(ValidateContentRequest request);
        Task<bool> DeleteListingAsync(int roomId, string ownerId);
        Task<DuplicateListingResult> DuplicateListingAsync(int roomId, string ownerId, DuplicateListingRequest? request);
    }
}
