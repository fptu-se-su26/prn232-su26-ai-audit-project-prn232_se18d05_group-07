using Application.Common.DTOs.Reviews;
using Application.Common.Interfaces;
using Application.Services;
using Domain.Entities;
using Domain.Enums;
using Xunit;

namespace RoomHub.Application.Tests;

public sealed class ReviewModerationBypassTests
{
    [Fact]
    public async Task UpdateReviewAsync_HiddenReview_MovesToPendingAndRecordsEvidence()
    {
        var repository = new FakeReviewRepository(ReviewModerationStatus.Hidden);
        var unitOfWork = new FakeUnitOfWork();
        var service = new ReviewService(repository, unitOfWork);

        var result = await service.UpdateReviewAsync(7, "tenant-a", new UpdateReviewRequest
        {
            Rating = 4,
            Comment = "Updated review"
        });

        Assert.NotNull(result);
        Assert.Equal(nameof(ReviewModerationStatus.Pending), result.ModerationStatus);
        Assert.Single(repository.Revisions);
        Assert.Equal(ReviewModerationStatus.Hidden, repository.Revisions[0].PreviousModerationStatus);
        Assert.Equal(ReviewModerationStatus.Pending, repository.Revisions[0].NewModerationStatus);
        Assert.Single(repository.AuditLogs);
        Assert.Single(repository.Notifications);
        Assert.Equal(1, unitOfWork.SaveCount);
    }

    [Fact]
    public async Task UpdateReviewAsync_RemovedReview_IsRejectedWithoutSaving()
    {
        var repository = new FakeReviewRepository(ReviewModerationStatus.Removed);
        var unitOfWork = new FakeUnitOfWork();
        var service = new ReviewService(repository, unitOfWork);

        await Assert.ThrowsAsync<InvalidOperationException>(() => service.UpdateReviewAsync(
            7,
            "tenant-a",
            new UpdateReviewRequest { Rating = 5, Comment = "Trying to restore" }));

        Assert.Empty(repository.Revisions);
        Assert.Empty(repository.AuditLogs);
        Assert.Equal(0, unitOfWork.SaveCount);
    }

    [Theory]
    [InlineData(ReviewModerationStatus.Visible)]
    [InlineData(ReviewModerationStatus.Pending)]
    public async Task UpdateReviewAsync_AllowedStatus_PreservesModerationState(ReviewModerationStatus status)
    {
        var repository = new FakeReviewRepository(status);
        var service = new ReviewService(repository, new FakeUnitOfWork());

        var result = await service.UpdateReviewAsync(7, "tenant-a", new UpdateReviewRequest
        {
            Rating = 3,
            Comment = "Edited"
        });

        Assert.NotNull(result);
        Assert.Equal(status.ToString(), result.ModerationStatus);
        Assert.Single(repository.Revisions);
        Assert.Empty(repository.Notifications);
    }

    [Fact]
    public async Task UpdateReviewAsync_DifferentTenant_ReturnsNotFoundWithoutHistory()
    {
        var repository = new FakeReviewRepository(ReviewModerationStatus.Visible);
        var unitOfWork = new FakeUnitOfWork();
        var service = new ReviewService(repository, unitOfWork);

        var result = await service.UpdateReviewAsync(7, "tenant-b", new UpdateReviewRequest
        {
            Rating = 3,
            Comment = "Unauthorized edit"
        });

        Assert.Null(result);
        Assert.Empty(repository.Revisions);
        Assert.Equal(0, unitOfWork.SaveCount);
    }

    [Fact]
    public async Task ReportAsync_UnknownReasonCode_IsRejected()
    {
        var repository = new FakeReviewRepository(ReviewModerationStatus.Visible);
        var service = new ReviewService(repository, new FakeUnitOfWork());

        await Assert.ThrowsAsync<ArgumentException>(() => service.ReportAsync(
            7,
            "reporter-a",
            new CreateReviewReportRequest { ReasonCode = "InjectedReason" }));

        Assert.Empty(repository.Reports);
    }

    [Fact]
    public async Task ReportAsync_OtherWithoutDescription_IsRejected()
    {
        var repository = new FakeReviewRepository(ReviewModerationStatus.Visible);
        var service = new ReviewService(repository, new FakeUnitOfWork());

        await Assert.ThrowsAsync<ArgumentException>(() => service.ReportAsync(
            7,
            "reporter-a",
            new CreateReviewReportRequest { ReasonCode = "Other", Description = " " }));

        Assert.Empty(repository.Reports);
    }

    [Fact]
    public async Task ReportAsync_KnownReason_IsCanonicalizedAndSaved()
    {
        var repository = new FakeReviewRepository(ReviewModerationStatus.Visible);
        var unitOfWork = new FakeUnitOfWork();
        var service = new ReviewService(repository, unitOfWork);

        await service.ReportAsync(
            7,
            "reporter-a",
            new CreateReviewReportRequest { ReasonCode = " falseinformation ", Description = "Incorrect claim" });

        var report = Assert.Single(repository.Reports);
        Assert.Equal("FalseInformation", report.ReasonCode);
        Assert.Equal(1, unitOfWork.SaveCount);
    }

    private sealed class FakeReviewRepository : IReviewRepository
    {
        private readonly Review review;

        public FakeReviewRepository(ReviewModerationStatus status)
        {
            review = new Review
            {
                Id = 7,
                TenantId = "tenant-a",
                Rating = 2,
                Comment = "Original",
                ModerationStatus = status,
                Tenant = new ApplicationUser { Id = "tenant-a", FullName = "Tenant A" }
            };
        }

        public List<ReviewRevision> Revisions { get; } = [];
        public List<AuditLog> AuditLogs { get; } = [];
        public List<Notification> Notifications { get; } = [];
        public List<ReviewViolation> Reports { get; } = [];

        public Task<Review?> GetByIdAsync(int id) => Task.FromResult<Review?>(id == review.Id ? review : null);
        public Task<List<Review>> GetByRoomIdAsync(int roomId) => Task.FromResult(new List<Review>());
        public Task<List<Review>> GetByTenantIdAsync(string tenantId) => Task.FromResult(new List<Review>());
        public Task<bool> HasTenantReviewedRoomAsync(string tenantId, int roomId) => Task.FromResult(false);
        public Task<Room?> GetRoomAsync(int roomId) => Task.FromResult<Room?>(null);
        public Task<Contract?> GetEligibleContractAsync(string tenantId, int roomId, DateTime now) => Task.FromResult<Contract?>(null);
        public Task<ApplicationUser?> GetUserAsync(string userId) => Task.FromResult<ApplicationUser?>(new ApplicationUser { Id = userId });
        public Task<int> GetReviewEligibilityDaysAsync() => Task.FromResult(90);
        public Task<bool> HasPendingReportAsync(int reviewId, string reporterId) => Task.FromResult(false);
        public Task AddReportAsync(ReviewViolation report)
        {
            Reports.Add(report);
            return Task.CompletedTask;
        }
        public Task AddAsync(Review review) => Task.CompletedTask;
        public Task UpdateAsync(Review review) => Task.CompletedTask;
        public Task DeleteAsync(Review review) => Task.CompletedTask;

        public Task AddRevisionAsync(ReviewRevision revision)
        {
            Revisions.Add(revision);
            return Task.CompletedTask;
        }

        public Task AddAuditLogAsync(AuditLog auditLog)
        {
            AuditLogs.Add(auditLog);
            return Task.CompletedTask;
        }

        public Task AddNotificationAsync(Notification notification)
        {
            Notifications.Add(notification);
            return Task.CompletedTask;
        }
    }

    private sealed class FakeUnitOfWork : IUnitOfWork
    {
        public int SaveCount { get; private set; }
        public Task<int> SaveChangesAsync()
        {
            SaveCount++;
            return Task.FromResult(1);
        }

        public Task BeginTransactionAsync() => Task.CompletedTask;
        public Task CommitTransactionAsync() => Task.CompletedTask;
        public Task RollbackTransactionAsync() => Task.CompletedTask;
        public void Dispose() { }
    }
}
