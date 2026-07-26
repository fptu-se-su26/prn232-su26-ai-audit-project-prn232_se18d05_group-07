using System.Collections.Generic;

namespace Application.Common.DTOs.Recommendations
{
    /// <summary>
    /// Cách danh sách gợi ý được tạo ra — dùng để hiển thị tiêu đề phù hợp ở giao diện.
    /// </summary>
    public static class RecommendationStrategy
    {
        /// <summary>Dựa trên phòng đã lưu và đã xem của chính người dùng.</summary>
        public const string Personalized = "personalized";

        /// <summary>Chưa đăng nhập hoặc chưa có lịch sử — trả tin nổi bật.</summary>
        public const string Featured = "featured";

        /// <summary>Phòng tương tự một phòng cụ thể.</summary>
        public const string Similar = "similar";
    }

    public class RecommendedRoomDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = null!;
        public string Type { get; set; } = null!;
        public string District { get; set; } = null!;
        public string Location { get; set; } = null!;
        public double Price { get; set; }
        public double Area { get; set; }
        public int MaxPeople { get; set; }
        public string Image { get; set; } = null!;
        public List<string> Amenities { get; set; } = new();

        /// <summary>Điểm khớp 0–100, chỉ để xếp hạng và gỡ lỗi.</summary>
        public int MatchScore { get; set; }

        /// <summary>Lý do hiển thị cho người dùng, ví dụ "Cùng khu vực Hải Châu".</summary>
        public string Reason { get; set; } = "";
    }

    public class RecommendationListDto
    {
        public List<RecommendedRoomDto> Items { get; set; } = new();

        /// <summary>Một trong các hằng số <see cref="RecommendationStrategy"/>.</summary>
        public string Strategy { get; set; } = RecommendationStrategy.Featured;

        /// <summary>Câu dẫn gợi ý cho giao diện, ví dụ "Dựa trên phòng bạn đã lưu".</summary>
        public string Title { get; set; } = "";
    }
}
