using Application.Common.Interfaces;
using Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence.Repositories;

public sealed class ChatAccessRepository(ApplicationDbContext context) : IChatAccessRepository
{
    public Task<bool> CanTenantContactOwnerAsync(string tenantId, string ownerId, int roomId)
    {
        return context.Rooms.AnyAsync(room =>
            room.Id == roomId
            && !room.IsDeleted
            && room.LandlordId == ownerId
            && (
                (room.HasListing && room.IsPublished && !room.HiddenByOwner)
                || room.Contracts.Any(contract =>
                    contract.TenantId == tenantId
                    && (contract.Status == ContractStatus.Active || contract.Status == ContractStatus.Pending))
            ));
    }
}
