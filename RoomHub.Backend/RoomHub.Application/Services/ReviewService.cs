using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Common.DTOs.Reviews;
using Application.Common.Interfaces;
using Domain.Entities;

namespace Application.Services
{
    public class ReviewService : IReviewService
    {
        private readonly IReviewRepository _reviewRepository;
        private readonly IUnitOfWork _unitOfWork;

        public ReviewService(IReviewRepository reviewRepository, IUnitOfWork unitOfWork)
        {
            _reviewRepository = reviewRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task<ReviewDto> CreateReviewAsync(string tenantId, CreateReviewRequest request)
        {
            if (request.Rating < 1 || request.Rating > 5)
                throw new ArgumentException("Số sao đánh giá phải nằm trong khoảng 1 đến 5.");

            var room = await _reviewRepository.GetRoomAsync(request.RoomId);
            if (room == null)
                throw new ArgumentException("Không tìm thấy phòng cần đánh giá.");

            if (await _reviewRepository.HasTenantReviewedRoomAsync(tenantId, request.RoomId))
                throw new InvalidOperationException("Bạn đã đánh giá phòng này rồi.");

            var review = new Review
            {
                TenantId = tenantId,
                RoomId = request.RoomId,
                OwnerId = room.LandlordId,
                Rating = (byte)request.Rating,
                Comment = string.IsNullOrWhiteSpace(request.Comment) ? null : request.Comment.Trim(),
                IsModerated = false,
                CreatedAt = DateTime.UtcNow
            };

            await _reviewRepository.AddAsync(review);
            await _unitOfWork.SaveChangesAsync();

            // Nạp lại kèm navigation để trả về tên người đánh giá và tiêu đề phòng.
            var created = await _reviewRepository.GetByIdAsync(review.Id);
            return MapToDto(created!);
        }

        public async Task<RoomReviewSummaryDto> GetRoomReviewsAsync(int roomId)
        {
            var reviews = await _reviewRepository.GetByRoomIdAsync(roomId);
            var rated = reviews.Where(r => r.Rating.HasValue).ToList();

            return new RoomReviewSummaryDto
            {
                RoomId = roomId,
                TotalReviews = reviews.Count,
                AverageRating = rated.Count > 0
                    ? Math.Round(rated.Average(r => r.Rating!.Value), 1)
                    : 0,
                Reviews = reviews.Select(MapToDto).ToList()
            };
        }

        public async Task<List<ReviewDto>> GetMyReviewsAsync(string tenantId)
        {
            var reviews = await _reviewRepository.GetByTenantIdAsync(tenantId);
            return reviews.Select(MapToDto).ToList();
        }

        public async Task<bool> DeleteReviewAsync(int id, string tenantId)
        {
            var review = await _reviewRepository.GetByIdAsync(id);
            if (review == null || review.TenantId != tenantId)
                return false;

            await _reviewRepository.DeleteAsync(review);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        private static ReviewDto MapToDto(Review r)
        {
            return new ReviewDto
            {
                Id = r.Id,
                RoomId = r.RoomId,
                RoomTitle = r.Room?.Title,
                TenantId = r.TenantId,
                TenantName = r.Tenant?.FullName ?? "Người thuê",
                OwnerId = r.OwnerId,
                Rating = r.Rating,
                Comment = r.Comment,
                CreatedAt = r.CreatedAt
            };
        }
    }
}
