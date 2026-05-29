using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class Message
    {
        public long Id { get; set; }
        public string SenderId { get; set; } = null!;
        public string ReceiverId { get; set; } = null!;
        public string? Content { get; set; }
        public string? Images { get; set; }
        public int? LinkedRoomId { get; set; }
        public int? LinkedContractId { get; set; }
        public bool IsModerated { get; set; }
        public string? ModerationReason { get; set; }
        public DateTime SentAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public virtual ApplicationUser Sender { get; set; } = null!;
        public virtual ApplicationUser Receiver { get; set; } = null!;
        public virtual Room? LinkedRoom { get; set; }
        public virtual Contract? LinkedContract { get; set; }
    }
}
