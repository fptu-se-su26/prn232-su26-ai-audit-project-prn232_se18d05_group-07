using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Common.Interfaces;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence.Repositories
{
    public class ConversationRepository : IConversationRepository
    {
        private readonly ApplicationDbContext _context;

        public ConversationRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Conversation?> GetByIdAsync(long id)
        {
            return await _context.Conversations
                .Include(c => c.Owner)
                .Include(c => c.Tenant)
                .FirstOrDefaultAsync(c => c.Id == id);
        }

        public async Task<Conversation?> GetByParticipantsAsync(string ownerId, string tenantId)
        {
            return await _context.Conversations
                .Include(c => c.Owner)
                .Include(c => c.Tenant)
                .FirstOrDefaultAsync(c => (c.OwnerId == ownerId && c.TenantId == tenantId) || (c.OwnerId == tenantId && c.TenantId == ownerId));
        }

        public async Task<List<Conversation>> GetAllForUserAsync(string userId)
        {
            return await _context.Conversations
                .Include(c => c.Owner)
                .Include(c => c.Tenant)
                .Include(c => c.Messages)
                .Where(c => c.OwnerId == userId || c.TenantId == userId)
                .OrderByDescending(c => c.UpdatedAt)
                .ToListAsync();
        }

        public async Task<Conversation> AddAsync(Conversation conversation)
        {
            _context.Conversations.Add(conversation);
            await _context.SaveChangesAsync();
            return conversation;
        }

        public async Task UpdateAsync(Conversation conversation)
        {
            _context.Conversations.Update(conversation);
            await _context.SaveChangesAsync();
        }
    }
}
