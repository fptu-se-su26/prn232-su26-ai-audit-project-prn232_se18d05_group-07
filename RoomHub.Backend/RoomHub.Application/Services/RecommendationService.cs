using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Application.Common.DTOs.Listings;
using Application.Common.DTOs.Recommendations;
using Application.Common.Interfaces;
using Domain.Entities;
using Domain.Enums;

namespace Application.Services
{
    /// <summary>
    /// Gợi ý phòng bằng chấm điểm tất định trên dữ liệu có cấu trúc
    /// (quận, giá, loại phòng, diện tích, tiện nghi).
    ///
    /// Cố ý KHÔNG dùng embedding: "phòng tương tự" là bài toán trên thuộc tính có cấu trúc,
    /// không phải văn bản tự do. Cách này tốn 0 token, chạy nhanh và test được offline.
    /// Embedding vẫn dành cho trợ lý AI tìm kiếm bằng câu tự nhiên.
    /// </summary>
    public class RecommendationService : IRecommendationService
    {
        private const string DefaultThumbnail =
            "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80";

        // PageSize của SearchPublicListingsAsync bị clamp tối đa 50.
        private const int CandidatePageSize = 50;
        private const int MaxPreferredDistricts = 3;
        private const int MaxTake = 24;

        // Trọng số khi tính "phòng tương tự" — tổng đúng 100.
        private const int SimilarDistrictWeight = 35;
        private const int SimilarPriceWeight = 30;
        private const int SimilarTypeWeight = 15;
        private const int SimilarAreaWeight = 10;
        private const int SimilarAmenityWeight = 10;

        // Trọng số khi tính "gợi ý cho bạn" — tổng đúng 100.
        private const int ProfileDistrictWeight = 40;
        private const int ProfilePriceWeight = 30;
        private const int ProfileTypeWeight = 15;
        private const int ProfileAreaWeight = 15;

        // Phòng đã lưu là tín hiệu mạnh hơn hẳn phòng chỉ lướt qua.
        private const int FavoriteWeight = 3;
        private const int ViewedWeight = 1;

        private readonly IRoomRepository _roomRepository;
        private readonly IFavoriteRoomRepository _favoriteRepository;
        private readonly ISearchHistoryRepository _searchHistoryRepository;

        public RecommendationService(
            IRoomRepository roomRepository,
            IFavoriteRoomRepository favoriteRepository,
            ISearchHistoryRepository searchHistoryRepository)
        {
            _roomRepository = roomRepository;
            _favoriteRepository = favoriteRepository;
            _searchHistoryRepository = searchHistoryRepository;
        }

        // ==========================================
        // GỢI Ý CHO BẠN
        // ==========================================
        public async Task<RecommendationListDto> GetForYouAsync(string? userId, int take, CancellationToken ct = default)
        {
            take = Math.Clamp(take, 1, MaxTake);

            if (string.IsNullOrWhiteSpace(userId))
                return await FeaturedAsync(take, excludeIds: null);

            var profile = await BuildProfileAsync(userId, ct);
            if (profile == null)
                return await FeaturedAsync(take, excludeIds: null);

            var candidates = await GatherCandidatesAsync(profile.Districts, ct);
            var scored = candidates
                .Where(r => !profile.SeenRoomIds.Contains(r.Id))
                .Select(r => Score(r, profile))
                .Where(x => x.Score > 0)
                .OrderByDescending(x => x.Score)
                .ThenByDescending(x => x.Room.ListingScore)
                .Take(take)
                .Select(x => Map(x.Room, x.Score, x.Reason))
                .ToList();

            // Khẩu vị quá hẹp hoặc đã xem hết — vẫn phải trả về thứ gì đó.
            if (scored.Count == 0)
                return await FeaturedAsync(take, profile.SeenRoomIds);

            return new RecommendationListDto
            {
                Items = scored,
                Strategy = RecommendationStrategy.Personalized,
                Title = "Gợi ý cho bạn"
            };
        }

        // ==========================================
        // PHÒNG TƯƠNG TỰ
        // ==========================================
        public async Task<RecommendationListDto> GetSimilarAsync(int roomId, int take, CancellationToken ct = default)
        {
            take = Math.Clamp(take, 1, MaxTake);

            var anchor = await _roomRepository.GetPublicListingDetailAsync(roomId);
            if (anchor == null || !IsVisible(anchor))
                return await FeaturedAsync(take, new HashSet<int> { roomId });

            var district = anchor.Floor?.Building?.District;
            var candidates = await GatherCandidatesAsync(
                district == null ? new List<string>() : new List<string> { district }, ct);

            var scored = candidates
                .Where(r => r.Id != roomId)
                .Select(r => ScoreAgainstAnchor(r, anchor))
                .Where(x => x.Score > 0)
                .OrderByDescending(x => x.Score)
                .ThenByDescending(x => x.Room.ListingScore)
                .Take(take)
                .Select(x => Map(x.Room, x.Score, x.Reason))
                .ToList();

            return new RecommendationListDto
            {
                Items = scored,
                Strategy = RecommendationStrategy.Similar,
                Title = "Phòng tương tự"
            };
        }

        // ==========================================
        // Khẩu vị người dùng
        // ==========================================
        private sealed class TasteProfile
        {
            public List<string> Districts { get; init; } = new();
            public decimal MedianPrice { get; init; }
            public decimal MedianArea { get; init; }
            public HashSet<RoomType> Types { get; init; } = new();
            public HashSet<int> SeenRoomIds { get; init; } = new();
        }

        /// <summary>
        /// Dựng khẩu vị từ phòng đã lưu và phòng đã xem. Trả null nếu chưa có dữ liệu nào.
        /// </summary>
        private async Task<TasteProfile?> BuildProfileAsync(string userId, CancellationToken ct)
        {
            // GetPageAsync có Include Room → Floor → Building nên lấy được quận.
            var (favorites, _) = await _favoriteRepository.GetPageAsync(userId, 1, CandidatePageSize, ct);
            var history = await _searchHistoryRepository.GetByUserIdAsync(userId);

            var seen = new HashSet<int>(favorites.Select(f => f.RoomId));
            var weighted = new List<(Room Room, int Weight)>();

            foreach (var favorite in favorites.Where(f => f.Room != null))
                weighted.Add((favorite.Room, FavoriteWeight));

            // SearchHistoryRepository chỉ Include ViewedRoom (không kèm Floor/Building),
            // nên phòng đã xem chỉ đóng góp giá / loại / diện tích, không đóng góp quận.
            foreach (var entry in history.Where(h => h.ViewedRoom != null).Take(CandidatePageSize))
            {
                seen.Add(entry.ViewedRoom!.Id);
                weighted.Add((entry.ViewedRoom!, ViewedWeight));
            }

            if (weighted.Count == 0) return null;

            var districts = weighted
                .Where(w => w.Room.Floor?.Building?.District != null)
                .GroupBy(w => w.Room.Floor!.Building!.District!)
                .Select(g => (District: g.Key, Weight: g.Sum(x => x.Weight)))
                .OrderByDescending(x => x.Weight)
                .Take(MaxPreferredDistricts)
                .Select(x => x.District)
                .ToList();

            return new TasteProfile
            {
                Districts = districts,
                MedianPrice = WeightedMedian(weighted.Select(w => (w.Room.BasePrice, w.Weight))),
                MedianArea = WeightedMedian(weighted.Select(w => (w.Room.SurfaceArea ?? 25m, w.Weight))),
                Types = weighted.Select(w => w.Room.RoomType).ToHashSet(),
                SeenRoomIds = seen
            };
        }

        // ==========================================
        // Chấm điểm
        // ==========================================
        private static (Room Room, int Score, string Reason) Score(Room room, TasteProfile profile)
        {
            var parts = new List<(int Points, string Reason)>();
            var district = room.Floor?.Building?.District;

            if (district != null && profile.Districts.Contains(district))
                parts.Add((ProfileDistrictWeight, $"Cùng khu vực {district}"));

            var priceScore = (int)Math.Round(ProfilePriceWeight * Proximity(room.BasePrice, profile.MedianPrice));
            if (priceScore > 0) parts.Add((priceScore, "Đúng tầm giá bạn quan tâm"));

            if (profile.Types.Contains(room.RoomType))
                parts.Add((ProfileTypeWeight, $"Loại phòng bạn hay xem: {TypeLabel(room.RoomType)}"));

            var areaScore = (int)Math.Round(ProfileAreaWeight * Proximity(room.SurfaceArea ?? 25m, profile.MedianArea));
            if (areaScore > 0) parts.Add((areaScore, "Diện tích tương đương"));

            return (room, parts.Sum(p => p.Points), BestReason(parts));
        }

        private static (Room Room, int Score, string Reason) ScoreAgainstAnchor(Room room, Room anchor)
        {
            var parts = new List<(int Points, string Reason)>();

            var district = room.Floor?.Building?.District;
            var anchorDistrict = anchor.Floor?.Building?.District;
            var anchorCity = anchor.Floor?.Building?.City;

            if (district != null && district == anchorDistrict)
                parts.Add((SimilarDistrictWeight, $"Cùng khu vực {district}"));
            else if (room.Floor?.Building?.City != null && room.Floor.Building.City == anchorCity)
                parts.Add((SimilarDistrictWeight / 3, "Cùng thành phố"));

            var priceScore = (int)Math.Round(SimilarPriceWeight * Proximity(room.BasePrice, anchor.BasePrice));
            if (priceScore > 0) parts.Add((priceScore, "Giá tương đương"));

            if (room.RoomType == anchor.RoomType)
                parts.Add((SimilarTypeWeight, $"Cùng loại {TypeLabel(room.RoomType)}"));

            var areaScore = (int)Math.Round(
                SimilarAreaWeight * Proximity(room.SurfaceArea ?? 25m, anchor.SurfaceArea ?? 25m));
            if (areaScore > 0) parts.Add((areaScore, "Diện tích tương đương"));

            var anchorAmenities = AmenityNames(anchor);
            if (anchorAmenities.Count > 0)
            {
                var shared = AmenityNames(room).Count(anchorAmenities.Contains);
                var amenityScore = (int)Math.Round(SimilarAmenityWeight * (shared / (double)anchorAmenities.Count));
                if (amenityScore > 0) parts.Add((amenityScore, $"Có {shared} tiện nghi giống"));
            }

            return (room, parts.Sum(p => p.Points), BestReason(parts));
        }

        /// <summary>
        /// Độ gần giữa hai giá trị, 1 là trùng khớp và 0 khi lệch từ 50% trở lên.
        /// </summary>
        private static double Proximity(decimal value, decimal reference)
        {
            if (reference <= 0) return 0;
            var delta = Math.Abs((double)(value - reference) / (double)reference);
            return delta >= 0.5 ? 0 : 1 - delta / 0.5;
        }

        private static string BestReason(List<(int Points, string Reason)> parts) =>
            parts.Count == 0 ? "" : parts.OrderByDescending(p => p.Points).First().Reason;

        private static decimal WeightedMedian(IEnumerable<(decimal Value, int Weight)> values)
        {
            var expanded = values
                .SelectMany(v => Enumerable.Repeat(v.Value, Math.Max(1, v.Weight)))
                .OrderBy(v => v)
                .ToList();

            return expanded.Count == 0 ? 0 : expanded[expanded.Count / 2];
        }

        // ==========================================
        // Lấy ứng viên
        // ==========================================

        /// <summary>
        /// Gom ứng viên qua API tìm kiếm công khai sẵn có. PageSize bị clamp ở 50 nên
        /// gọi theo từng quận ưa thích, cộng thêm một lượt không lọc để mở rộng vùng phủ.
        /// </summary>
        private async Task<List<Room>> GatherCandidatesAsync(List<string> districts, CancellationToken ct)
        {
            var byId = new Dictionary<int, Room>();

            foreach (var district in districts.Take(MaxPreferredDistricts))
                await CollectAsync(byId, district);

            if (byId.Count < CandidatePageSize)
                await CollectAsync(byId, null);

            return byId.Values.Where(IsVisible).ToList();
        }

        private async Task CollectAsync(Dictionary<int, Room> sink, string? district)
        {
            var (rooms, _) = await _roomRepository.SearchPublicListingsAsync(new PublicListingFilterRequest
            {
                District = district,
                Page = 1,
                PageSize = CandidatePageSize
            });

            foreach (var room in rooms)
                sink.TryAdd(room.Id, room);
        }

        private async Task<RecommendationListDto> FeaturedAsync(int take, HashSet<int>? excludeIds)
        {
            var byId = new Dictionary<int, Room>();
            await CollectAsync(byId, null);

            var items = byId.Values
                .Where(IsVisible)
                .Where(r => excludeIds == null || !excludeIds.Contains(r.Id))
                .OrderByDescending(r => r.ListingScore)
                .ThenByDescending(r => r.CreatedAt)
                .Take(take)
                .Select(r => Map(r, 0, "Tin nổi bật"))
                .ToList();

            return new RecommendationListDto
            {
                Items = items,
                Strategy = RecommendationStrategy.Featured,
                Title = "Tin nổi bật"
            };
        }

        // ==========================================
        // Helpers
        // ==========================================
        private static bool IsVisible(Room room) =>
            !room.IsDeleted
            && room.HasListing
            && room.IsPublished
            && !room.HiddenByOwner
            && room.ModerationStatus == ModerationStatus.Approved;

        private static HashSet<string> AmenityNames(Room room) =>
            room.RoomAmenities
                .Where(ra => ra.Amenity != null)
                .Select(ra => ra.Amenity.Name)
                .ToHashSet();

        private static RecommendedRoomDto Map(Room room, int score, string reason)
        {
            var building = room.Floor?.Building;
            return new RecommendedRoomDto
            {
                Id = room.Id,
                Title = room.Title,
                Type = TypeLabel(room.RoomType),
                District = building?.District ?? "",
                Location = building == null
                    ? ""
                    : $"{building.Ward}, {building.District}, {building.City}",
                Price = (double)room.BasePrice,
                Area = (double)(room.SurfaceArea ?? 25m),
                MaxPeople = room.MaxCapacity,
                Image = room.RoomPhotos.OrderBy(p => p.DisplayOrder).Select(p => p.Url).FirstOrDefault()
                        ?? DefaultThumbnail,
                Amenities = room.RoomAmenities.Where(ra => ra.Amenity != null)
                                              .Select(ra => ra.Amenity.Name)
                                              .ToList(),
                MatchScore = Math.Clamp(score, 0, 100),
                Reason = reason
            };
        }

        private static string TypeLabel(RoomType type) => type switch
        {
            RoomType.Studio => "Studio",
            RoomType.MiniApartment => "Căn hộ mini",
            RoomType.Apartment => "Căn hộ",
            _ => "Phòng trọ"
        };
    }
}
