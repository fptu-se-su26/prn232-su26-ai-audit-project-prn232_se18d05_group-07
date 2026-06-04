using System.Collections.Generic;
using System.Threading.Tasks;
using Application.Common.DTOs.Listings;

namespace Application.Common.Interfaces
{
    public interface IListingService
    {
        Task<List<ListingDto>> GetOwnerListingsAsync(string ownerId);
        Task<bool> UpdateListingAsync(int roomId, UpdateListingRequest request, string ownerId);
        Task<bool> TogglePublishStatusAsync(int roomId, bool isPublished, string ownerId);
    }
}
