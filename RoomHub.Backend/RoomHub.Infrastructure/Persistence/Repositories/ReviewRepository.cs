using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Common.Interfaces;
using Domain.Entities;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Domain.Enums;
using System;

namespace Infrastructure.Persistence.Repositories
{
    public class ReviewRepository : IReviewRepository
    {
        private readonly ApplicationDbContext _context;

        public ReviewRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Review?> GetByIdAsync(int id)
        {
            return await _context.Reviews
                .Include(r => r.Tenant)
                .Include(r => r.Room)
                .FirstOrDefaultAsync(r => r.Id == id);
        }

        public async Task<List<Review>> GetByRoomIdAsync(int roomId)
        {
            return await _context.Reviews
                .Include(r => r.Tenant)
                .Where(r => r.RoomId == roomId && r.ParentReviewId == null && !r.IsDeleted && r.ModerationStatus == ReviewModerationStatus.Visible)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();
        }

        public async Task<List<Review>> GetByTenantIdAsync(string tenantId)
        {
            return await _context.Reviews
                .Include(r => r.Tenant)
                .Include(r => r.Room)
                .Where(r => r.TenantId == tenantId && r.ParentReviewId == null && !r.IsDeleted)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();
        }

        public async Task<bool> HasTenantReviewedRoomAsync(string tenantId, int roomId)
        {
            return await _context.Reviews
                .AnyAsync(r => r.TenantId == tenantId && r.RoomId == roomId && r.ParentReviewId == null && !r.IsDeleted);
        }

        public async Task<Room?> GetRoomAsync(int roomId)
        {
            return await _context.Rooms
                .FirstOrDefaultAsync(r => r.Id == roomId && !r.IsDeleted);
        }

        public async Task AddAsync(Review review)
        {
            await _context.Reviews.AddAsync(review);
        }

        public async Task<int> GetReviewEligibilityDaysAsync() =>
            await _context.SystemSettings.AsNoTracking().Select(x => (int?)x.ReviewEligibilityDaysAfterContract).FirstOrDefaultAsync() ?? 90;

        public Task<ApplicationUser?> GetUserAsync(string userId) => _context.Users.FirstOrDefaultAsync(x => x.Id == userId);

        public async Task<Contract?> GetEligibleContractAsync(string tenantId, int roomId, DateTime now)
        {
            var days = await GetReviewEligibilityDaysAsync();
            var cutoff = now.AddDays(-days);
            return await _context.Contracts.AsNoTracking()
                .Where(c => !c.IsDeleted && c.TenantId == tenantId && c.RoomId == roomId &&
                    (c.Status == ContractStatus.Active || c.Status == ContractStatus.Renewed ||
                     c.Status == ContractStatus.Terminated || c.Status == ContractStatus.Liquidated || c.Status == ContractStatus.Expired) &&
                    (c.Status == ContractStatus.Active || c.Status == ContractStatus.Renewed || c.EndDate >= cutoff))
                .OrderByDescending(c => c.EndDate).FirstOrDefaultAsync();
        }

        public Task<bool> HasPendingReportAsync(int reviewId, string reporterId) =>
            _context.ReviewViolations.AnyAsync(x => x.ReviewId == reviewId && x.ReporterId == reporterId && x.Status == ReviewReportStatus.Pending);

        public async Task AddReportAsync(ReviewViolation report) => await _context.ReviewViolations.AddAsync(report);

        public async Task UpdateAsync(Review review)
        {
            _context.Reviews.Update(review);
            await Task.CompletedTask;
        }

        public async Task DeleteAsync(Review review)
        {
            _context.Reviews.Remove(review);
            await Task.CompletedTask;
        }
    }
}
