using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Common.DTOs.SearchHistory;
using Application.Common.Interfaces;
using Domain.Entities;

namespace Application.Services
{
    public class SearchHistoryService : ISearchHistoryService
    {
        private readonly ISearchHistoryRepository _searchHistoryRepository;
        private readonly IUnitOfWork _unitOfWork;

        public SearchHistoryService(ISearchHistoryRepository searchHistoryRepository, IUnitOfWork unitOfWork)
        {
            _searchHistoryRepository = searchHistoryRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task<SearchHistoryDto> LogAsync(string userId, LogSearchRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.SearchQuery) && request.ViewedRoomId == null)
                throw new ArgumentException("Không có nội dung tìm kiếm để ghi lại.");

            var entry = new SearchHistory
            {
                UserId = userId,
                SearchQuery = string.IsNullOrWhiteSpace(request.SearchQuery) ? null : request.SearchQuery.Trim(),
                ViewedRoomId = request.ViewedRoomId,
                Timestamp = DateTime.UtcNow
            };

            await _searchHistoryRepository.AddAsync(entry);
            await _unitOfWork.SaveChangesAsync();

            return MapToDto(entry);
        }

        public async Task<List<SearchHistoryDto>> GetMyHistoryAsync(string userId)
        {
            var items = await _searchHistoryRepository.GetByUserIdAsync(userId);
            return items.Select(MapToDto).ToList();
        }

        public async Task<bool> DeleteAsync(long id, string userId)
        {
            var entry = await _searchHistoryRepository.GetByIdAsync(id);
            if (entry == null || entry.UserId != userId)
                return false;

            await _searchHistoryRepository.DeleteAsync(entry);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        public async Task ClearAsync(string userId)
        {
            await _searchHistoryRepository.ClearByUserIdAsync(userId);
            await _unitOfWork.SaveChangesAsync();
        }

        private static SearchHistoryDto MapToDto(SearchHistory s)
        {
            return new SearchHistoryDto
            {
                Id = s.Id,
                SearchQuery = s.SearchQuery,
                ViewedRoomId = s.ViewedRoomId,
                ViewedRoomTitle = s.ViewedRoom?.Title,
                Timestamp = s.Timestamp
            };
        }
    }
}
