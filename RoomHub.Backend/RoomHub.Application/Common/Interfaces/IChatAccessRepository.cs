namespace Application.Common.Interfaces;

public interface IChatAccessRepository
{
    Task<bool> CanTenantContactOwnerAsync(string tenantId, string ownerId, int roomId);
}
