using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Persistence.Configurations
{
    public class MessageConfiguration : IEntityTypeConfiguration<Message>
    {
        public void Configure(EntityTypeBuilder<Message> builder)
        {
            builder.ToTable("Messages");
            builder.HasKey(m => m.Id);

            builder.Property(m => m.IsModerated).HasDefaultValue(false);
            builder.Property(m => m.ModerationReason).HasMaxLength(256);
            builder.Property(m => m.SentAt).HasDefaultValueSql("GETUTCDATE()");

            builder.HasOne(m => m.Sender)
                .WithMany(u => u.SentMessages)
                .HasForeignKey(m => m.SenderId)
                .OnDelete(DeleteBehavior.NoAction);

            builder.HasOne(m => m.Receiver)
                .WithMany(u => u.ReceivedMessages)
                .HasForeignKey(m => m.ReceiverId)
                .OnDelete(DeleteBehavior.NoAction);

            builder.HasOne(m => m.LinkedRoom)
                .WithMany(r => r.Messages)
                .HasForeignKey(m => m.LinkedRoomId)
                .OnDelete(DeleteBehavior.NoAction);

            builder.HasOne(m => m.LinkedContract)
                .WithMany(c => c.Messages)
                .HasForeignKey(m => m.LinkedContractId)
                .OnDelete(DeleteBehavior.NoAction);

            builder.HasIndex(m => m.LinkedRoomId)
                .HasDatabaseName("IX_Messages_LinkedRoomId");

            builder.HasIndex(m => m.LinkedContractId)
                .HasDatabaseName("IX_Messages_LinkedContractId");
        }
    }
}
