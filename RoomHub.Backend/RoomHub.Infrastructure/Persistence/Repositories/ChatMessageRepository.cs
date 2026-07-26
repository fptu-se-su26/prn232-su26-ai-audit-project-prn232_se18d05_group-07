using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Common.Interfaces;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence.Repositories
{
    public class ChatMessageRepository : IChatMessageRepository
    {
        private readonly ApplicationDbContext _context;

        public ChatMessageRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<ChatMessage>> GetByConversationIdAsync(long conversationId)
        {
            return await _context.ChatMessages
                .Include(m => m.Sender)
                .Include(m => m.Receiver)
                .Where(m => m.ConversationId == conversationId)
                .OrderBy(m => m.Timestamp)
                .ToListAsync();
        }

        public Task<ChatMessage?> GetByClientMessageIdAsync(string senderId, string clientMessageId)
        {
            return _context.ChatMessages
                .AsNoTracking()
                .SingleOrDefaultAsync(m => m.SenderId == senderId && m.ClientMessageId == clientMessageId);
        }

        public async Task<(ChatMessage Message, bool Created)> AddIdempotentAsync(ChatMessage message)
        {
            _context.ChatMessages.Add(message);
            try
            {
                await _context.SaveChangesAsync();
                return (message, true);
            }
            catch (DbUpdateException)
            {
                _context.Entry(message).State = EntityState.Detached;
                var existing = await GetByClientMessageIdAsync(message.SenderId, message.ClientMessageId!);
                if (existing is null)
                    throw;
                return (existing, false);
            }
        }

        public async Task<List<long>> MarkAsReadAsync(long conversationId, string receiverId)
        {
            var unreadMessages = await _context.ChatMessages
                .Where(m => m.ConversationId == conversationId && m.ReceiverId == receiverId && !m.IsRead)
                .ToListAsync();

            foreach (var message in unreadMessages)
            {
                message.IsRead = true;
            }

            if (unreadMessages.Any())
            {
                await _context.SaveChangesAsync();
            }

            return unreadMessages.Select(message => message.Id).ToList();
        }
    }
}
