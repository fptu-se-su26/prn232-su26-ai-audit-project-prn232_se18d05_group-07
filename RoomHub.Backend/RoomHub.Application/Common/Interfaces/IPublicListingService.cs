using System.Threading.Tasks;
using Application.Common.DTOs.Listings;

namespace Application.Common.Interfaces
{
    public interface IPublicListingService
    {
        Task<PublicListingPageDto> SearchListingsAsync(PublicListingFilterRequest filter);
        Task<PublicListingDetailDto?> GetListingDetailAsync(int id);
    }
}
