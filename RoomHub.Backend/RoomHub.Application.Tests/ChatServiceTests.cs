using Application.Common.DTOs.Chats;
using Application.Common.Exceptions;
using Application.Common.Interfaces;
using Application.Services;
using Domain.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging.Abstractions;
using RoomHub.API.Middlewares;
using Xunit;

namespace RoomHub.Application.Tests;

public sealed class ChatServiceTests
{
    [Theory]
    [InlineData("")]
    [InlineData("   \r\n\t ")]
    public async Task SendMessage_EmptyContent_IsRejected(string content)
    {
        var context = CreateContext();

        await Assert.ThrowsAsync<ArgumentException>(() => context.Service.SendMessageAsync(
            10, "tenant", new SendMessageRequestDto
            {
                MessageText = content,
                ClientMessageId = Guid.NewGuid().ToString()
            }));
    }

    [Fact]
    public async Task SendMessage_NormalizesWhitespace_AndNotifiesOnceOnRetry()
    {
        var context = CreateContext();
        var clientMessageId = Guid.NewGuid().ToString();
        var request = new SendMessageRequestDto
        {
            MessageText = "  Xin   chào \r\n chủ phòng  ",
            ClientMessageId = clientMessageId
        };

        var first = await context.Service.SendMessageAsync(10, "tenant", request);
        var retry = await context.Service.SendMessageAsync(10, "tenant", request);

        Assert.Equal("Xin chào chủ phòng", first.MessageText);
        Assert.Equal(first.Id, retry.Id);
        Assert.Single(context.Messages.Items);
        Assert.Single(context.Notifier.Created);
    }

    [Fact]
    public async Task SendMessage_SameClientIdWithDifferentContent_IsRejected()
    {
        var context = CreateContext();
        var clientMessageId = Guid.NewGuid().ToString();
        await context.Service.SendMessageAsync(10, "tenant", new SendMessageRequestDto
        {
            MessageText = "Nội dung đầu tiên",
            ClientMessageId = clientMessageId
        });

        await Assert.ThrowsAsync<ArgumentException>(() => context.Service.SendMessageAsync(
            10, "tenant", new SendMessageRequestDto
            {
                MessageText = "Nội dung đã thay đổi",
                ClientMessageId = clientMessageId
            }));

        Assert.Single(context.Messages.Items);
    }

    [Fact]
    public async Task GetMessages_NonParticipant_ThrowsForbidden()
    {
        var context = CreateContext();

        await Assert.ThrowsAsync<ForbiddenException>(() =>
            context.Service.GetMessagesAsync(10, "stranger"));
    }

    [Fact]
    public async Task GetMessages_MissingConversation_ThrowsNotFound()
    {
        var context = CreateContext();

        await Assert.ThrowsAsync<NotFoundException>(() =>
            context.Service.GetMessagesAsync(999, "tenant"));
    }

    [Fact]
    public async Task GetMessages_MarksResponseRead_AndPublishesReceipt()
    {
        var context = CreateContext();
        context.Messages.Items.Add(new ChatMessage
        {
            Id = 7,
            ConversationId = 10,
            SenderId = "owner",
            ReceiverId = "tenant",
            MessageText = "Chào bạn",
            IsRead = false
        });

        var result = await context.Service.GetMessagesAsync(10, "tenant");

        Assert.True(Assert.Single(result).IsRead);
        var receipt = Assert.Single(context.Notifier.Read);
        Assert.Equal("tenant", receipt.ReaderId);
        Assert.Contains(7, receipt.MessageIds);
    }

    [Fact]
    public async Task CreateConversation_InvalidOwnerForRoom_ThrowsForbidden()
    {
        var context = CreateContext(canContact: false);

        await Assert.ThrowsAsync<ForbiddenException>(() =>
            context.Service.CreateOrGetConversationAsync("tenant", "owner", 5));
    }

    [Theory]
    [InlineData("not-found", StatusCodes.Status404NotFound)]
    [InlineData("forbidden", StatusCodes.Status403Forbidden)]
    [InlineData("validation", StatusCodes.Status400BadRequest)]
    public async Task GlobalExceptionMiddleware_MapsChatErrorsToExpectedStatus(
        string errorType,
        int expectedStatus)
    {
        Exception exception = errorType switch
        {
            "not-found" => new NotFoundException("missing"),
            "forbidden" => new ForbiddenException("denied"),
            _ => new ArgumentException("invalid")
        };
        var middleware = new GlobalExceptionMiddleware(
            _ => Task.FromException(exception),
            NullLogger<GlobalExceptionMiddleware>.Instance);
        var context = new DefaultHttpContext();
        context.Response.Body = new MemoryStream();

        await middleware.InvokeAsync(context);

        Assert.Equal(expectedStatus, context.Response.StatusCode);
    }

    private static TestContext CreateContext(bool canContact = true)
    {
        var conversations = new FakeConversationRepository();
        conversations.Items.Add(new Conversation { Id = 10, OwnerId = "owner", TenantId = "tenant" });
        var messages = new FakeMessageRepository();
        var notifier = new FakeNotifier();
        var service = new ChatService(
            conversations, messages, new FakeUnitOfWork(), notifier, new FakeAccessRepository(canContact));
        return new(service, messages, notifier);
    }

    private sealed record TestContext(ChatService Service, FakeMessageRepository Messages, FakeNotifier Notifier);

    private sealed class FakeAccessRepository(bool allowed) : IChatAccessRepository
    {
        public Task<bool> CanTenantContactOwnerAsync(string tenantId, string ownerId, int roomId) =>
            Task.FromResult(allowed);
    }

    private sealed class FakeConversationRepository : IConversationRepository
    {
        public List<Conversation> Items { get; } = [];
        public Task<Conversation?> GetByIdAsync(long id) => Task.FromResult(Items.SingleOrDefault(x => x.Id == id));
        public Task<Conversation?> GetByParticipantsAsync(string ownerId, string tenantId) =>
            Task.FromResult(Items.SingleOrDefault(x => x.OwnerId == ownerId && x.TenantId == tenantId));
        public Task<List<Conversation>> GetAllForUserAsync(string userId) =>
            Task.FromResult(Items.Where(x => x.OwnerId == userId || x.TenantId == userId).ToList());
        public Task<Conversation> AddAsync(Conversation conversation)
        {
            conversation.Id = Items.Count == 0 ? 1 : Items.Max(x => x.Id) + 1;
            Items.Add(conversation);
            return Task.FromResult(conversation);
        }
        public Task UpdateAsync(Conversation conversation) => Task.CompletedTask;
    }

    private sealed class FakeMessageRepository : IChatMessageRepository
    {
        public List<ChatMessage> Items { get; } = [];
        public Task<List<ChatMessage>> GetByConversationIdAsync(long conversationId) =>
            Task.FromResult(Items.Where(x => x.ConversationId == conversationId).ToList());
        public Task<ChatMessage?> GetByClientMessageIdAsync(string senderId, string clientMessageId) =>
            Task.FromResult(Items.SingleOrDefault(x =>
                x.SenderId == senderId && x.ClientMessageId == clientMessageId));
        public Task<(ChatMessage Message, bool Created)> AddIdempotentAsync(ChatMessage message)
        {
            var existing = Items.SingleOrDefault(x =>
                x.SenderId == message.SenderId && x.ClientMessageId == message.ClientMessageId);
            if (existing is not null)
                return Task.FromResult((existing, false));
            message.Id = Items.Count == 0 ? 1 : Items.Max(x => x.Id) + 1;
            Items.Add(message);
            return Task.FromResult((message, true));
        }
        public Task<List<long>> MarkAsReadAsync(long conversationId, string receiverId)
        {
            var unread = Items.Where(x =>
                x.ConversationId == conversationId && x.ReceiverId == receiverId && !x.IsRead).ToList();
            unread.ForEach(x => x.IsRead = true);
            return Task.FromResult(unread.Select(x => x.Id).ToList());
        }
    }

    private sealed class FakeNotifier : IChatNotifier
    {
        public List<ChatMessageDto> Created { get; } = [];
        public List<(long ConversationId, string ReaderId, IReadOnlyCollection<long> MessageIds)> Read { get; } = [];
        public Task NotifyMessageCreatedAsync(ChatMessageDto message)
        {
            Created.Add(message);
            return Task.CompletedTask;
        }
        public Task NotifyMessagesReadAsync(long conversationId, string readerId, string ownerId, string tenantId, IReadOnlyCollection<long> messageIds, DateTime readAt)
        {
            Read.Add((conversationId, readerId, messageIds));
            return Task.CompletedTask;
        }
    }

    private sealed class FakeUnitOfWork : IUnitOfWork
    {
        public void Dispose() { }
        public Task<int> SaveChangesAsync() => Task.FromResult(1);
        public Task BeginTransactionAsync() => Task.CompletedTask;
        public Task CommitTransactionAsync() => Task.CompletedTask;
        public Task RollbackTransactionAsync() => Task.CompletedTask;
    }
}
