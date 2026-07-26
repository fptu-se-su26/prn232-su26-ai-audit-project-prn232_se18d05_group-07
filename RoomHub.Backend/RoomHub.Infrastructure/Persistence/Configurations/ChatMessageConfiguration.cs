using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations
{
    public class ChatMessageConfiguration : IEntityTypeConfiguration<ChatMessage>
    {
        public void Configure(EntityTypeBuilder<ChatMessage> builder)
        {
            builder.ToTable("ChatMessages");

            builder.HasKey(m => m.Id);

            builder.Property(m => m.SenderId)
                .IsRequired();

            builder.Property(m => m.ReceiverId)
                .IsRequired();

            builder.Property(m => m.MessageText)
                .IsRequired()
                .HasMaxLength(2000);

            builder.Property(m => m.AttachmentUrl).HasMaxLength(1000);
            builder.Property(m => m.AttachmentName).HasMaxLength(255);
            builder.Property(m => m.AttachmentContentType).HasMaxLength(100);

            builder.Property(m => m.ClientMessageId)
                .HasMaxLength(36);

            builder.HasIndex(m => new { m.SenderId, m.ClientMessageId })
                .IsUnique()
                .HasFilter("[ClientMessageId] IS NOT NULL");

            builder.HasIndex(m => new { m.ConversationId, m.ReceiverId, m.IsRead });

            // Relationships
            builder.HasOne(m => m.Conversation)
                .WithMany(c => c.Messages)
                .HasForeignKey(m => m.ConversationId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(m => m.Sender)
                .WithMany()
                .HasForeignKey(m => m.SenderId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(m => m.Receiver)
                .WithMany()
                .HasForeignKey(m => m.ReceiverId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
