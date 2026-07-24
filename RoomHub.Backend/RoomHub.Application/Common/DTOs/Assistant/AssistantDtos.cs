using System.Collections.Generic;

namespace Application.Common.DTOs.Assistant
{
    /// <summary>
    /// Một lượt hội thoại trước đó (để giữ ngữ cảnh nhiều lượt).
    /// </summary>
    public class ChatTurn
    {
        public string Role { get; set; } = "user";   // "user" | "assistant"
        public string Content { get; set; } = "";
    }

    /// <summary>
    /// Yêu cầu từ widget chat. Cho phép ẩn danh.
    /// </summary>
    public class AssistantRequest
    {
        public string Message { get; set; } = "";
        public List<ChatTurn>? History { get; set; }

        /// <summary>
        /// Bộ lọc đã áp dụng ở lượt trước (client giữ) — để trợ lý kế thừa ngữ cảnh
        /// khi người dùng tinh chỉnh ("rẻ hơn", "gần hơn"...). Phase 2 — nhớ hội thoại.
        /// </summary>
        public ExtractedFilter? PreviousFilters { get; set; }
    }

    /// <summary>
    /// Bộ lọc có cấu trúc do LLM trích xuất từ câu chat (Bước 1 của pipeline RAG).
    /// </summary>
    public class ExtractedFilter
    {
        // "search" | "question" | "greeting" | "out_of_scope"
        public string Intent { get; set; } = "search";
        public string? District { get; set; }
        public decimal? MinPrice { get; set; }
        public decimal? MaxPrice { get; set; }
        public decimal? MinArea { get; set; }
        public decimal? MaxArea { get; set; }
        public string? RoomType { get; set; }
        public List<string> Amenities { get; set; } = new();
        public int? MaxPeople { get; set; }
        public string? Keywords { get; set; }
        public string? SortBy { get; set; }   // "priceAsc" | "priceDesc" | null
    }

    /// <summary>
    /// Thẻ phòng trả về cho widget (đồng bộ format với PublicListingsController).
    /// </summary>
    public class AssistantRoom
    {
        public int Id { get; set; }
        public string Title { get; set; } = "";
        public string Type { get; set; } = "";
        public string District { get; set; } = "";
        public string Location { get; set; } = "";
        public double Price { get; set; }
        public double Area { get; set; }
        public int MaxPeople { get; set; }
        public string Image { get; set; } = "";
        public List<string> Amenities { get; set; } = new();
    }

    /// <summary>
    /// Phản hồi hoàn chỉnh trả cho frontend.
    /// </summary>
    public class AssistantResponse
    {
        public string Reply { get; set; } = "";
        public string Intent { get; set; } = "search";
        public ExtractedFilter AppliedFilters { get; set; } = new();
        public List<AssistantRoom> Rooms { get; set; } = new();
        public List<string> Suggestions { get; set; } = new();
    }

    /// <summary>
    /// Một sự kiện trong luồng SSE của trợ lý (Phase 2 — streaming).
    /// type: "meta" (intent + filters + rooms) → "token" (mảnh chữ) → "done" (suggestions) | "error".
    /// </summary>
    public class AssistantStreamEvent
    {
        public string Type { get; set; } = "";
        public string? Intent { get; set; }
        public ExtractedFilter? AppliedFilters { get; set; }
        public List<AssistantRoom>? Rooms { get; set; }
        public string? Token { get; set; }
        public List<string>? Suggestions { get; set; }
        public string? Message { get; set; }

        public static AssistantStreamEvent Meta(string intent, ExtractedFilter filters, List<AssistantRoom> rooms) =>
            new() { Type = "meta", Intent = intent, AppliedFilters = filters, Rooms = rooms };

        public static AssistantStreamEvent TokenEvent(string token) =>
            new() { Type = "token", Token = token };

        public static AssistantStreamEvent Done(List<string> suggestions) =>
            new() { Type = "done", Suggestions = suggestions };

        public static AssistantStreamEvent Error(string message) =>
            new() { Type = "error", Message = message };
    }
}
