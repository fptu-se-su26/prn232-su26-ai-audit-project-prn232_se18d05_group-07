using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Runtime.CompilerServices;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Application.Common.DTOs.Assistant;
using Application.Common.Interfaces;
using Domain.Entities;
using Domain.Enums;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace Infrastructure.Services
{
    /// <summary>
    /// Trợ lý AI tìm phòng — RAG hybrid.
    /// Extract (LLM) → Retrieve (structured → semantic → relaxed) → Generate (LLM grounded).
    /// Phase 2: streaming SSE, nhớ hội thoại (kế thừa filter), semantic embeddings, cá nhân hóa theo SearchHistory.
    /// </summary>
    public class RoomAssistantService : IRoomAssistantService
    {
        private const string TextModel = "llama-3.3-70b-versatile";
        private const string GroqEndpoint = "https://api.groq.com/openai/v1/chat/completions";
        private const int TopN = 5;
        private const int SemanticPoolCap = 40;
        private const string FallbackImage = "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80";

        private static readonly TimeSpan EmbeddingTtl = TimeSpan.FromHours(6);

        // Log SearchHistory bằng camelCase để BuildUserPreferenceHintAsync đọc lại đúng key.
        private static readonly JsonSerializerOptions LogJson = new() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

        private readonly ApplicationDbContext _context;
        private readonly HttpClient _httpClient;
        private readonly IEmbeddingService _embeddings;
        private readonly IMemoryCache _cache;
        private readonly string _apiKey;
        private readonly ILogger<RoomAssistantService> _logger;

        public RoomAssistantService(
            ApplicationDbContext context,
            HttpClient httpClient,
            IEmbeddingService embeddings,
            IMemoryCache cache,
            IConfiguration configuration,
            ILogger<RoomAssistantService> logger)
        {
            _context = context;
            _httpClient = httpClient;
            _embeddings = embeddings;
            _cache = cache;
            _apiKey = configuration["GroqSettings:ApiKey"] ?? "";
            _logger = logger;
        }

        private bool LlmAvailable => !string.IsNullOrWhiteSpace(_apiKey);

        // ============================================================
        // NON-STREAMING
        // ============================================================
        public async Task<AssistantResponse> SearchAsync(AssistantRequest request, string? userId)
        {
            var message = (request.Message ?? "").Trim();
            var prep = await PrepareAsync(request, userId, CancellationToken.None);

            string reply;
            List<string> suggestions;
            if (LlmAvailable)
            {
                try
                {
                    (reply, suggestions) = await GenerateReplyJsonAsync(message, prep, request.History);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Assistant generate step failed. Using deterministic reply.");
                    (reply, suggestions) = DeterministicReply(prep);
                }
            }
            else
            {
                (reply, suggestions) = DeterministicReply(prep);
            }

            await TryLogSearchHistoryAsync(userId, message, prep.Filter);

            return new AssistantResponse
            {
                Reply = reply,
                Intent = prep.Filter.Intent,
                AppliedFilters = prep.Filter,
                Rooms = prep.Rooms,
                Suggestions = suggestions
            };
        }

        // ============================================================
        // STREAMING (SSE)
        // ============================================================
        public async IAsyncEnumerable<AssistantStreamEvent> SearchStreamAsync(
            AssistantRequest request, string? userId, [EnumeratorCancellation] CancellationToken ct = default)
        {
            var message = (request.Message ?? "").Trim();
            var prep = await PrepareAsync(request, userId, ct);

            // 1) meta trước — frontend render thẻ phòng ngay trong khi chữ đang chảy.
            yield return AssistantStreamEvent.Meta(prep.Filter.Intent, prep.Filter, prep.Rooms);

            // 2) stream phần chữ trả lời.
            var full = new StringBuilder();
            if (LlmAvailable)
            {
                var messages = BuildGenerateMessages(message, prep, request.History, jsonMode: false);
                var failed = false;
                await foreach (var delta in CallGroqStreamAsync(messages, ct))
                {
                    if (delta.Failed) { failed = true; break; }
                    if (string.IsNullOrEmpty(delta.Text)) continue;
                    full.Append(delta.Text);
                    yield return AssistantStreamEvent.TokenEvent(delta.Text);
                }

                if (failed && full.Length == 0)
                {
                    var (fallbackReply, _) = DeterministicReply(prep);
                    full.Append(fallbackReply);
                    yield return AssistantStreamEvent.TokenEvent(fallbackReply);
                }
            }
            else
            {
                var (reply, _) = DeterministicReply(prep);
                full.Append(reply);
                yield return AssistantStreamEvent.TokenEvent(reply);
            }

            // 3) done — suggestions (deterministic + cá nhân hóa để không tốn thêm 1 call LLM).
            await TryLogSearchHistoryAsync(userId, message, prep.Filter);
            yield return AssistantStreamEvent.Done(BuildSuggestions(prep));
        }

        // ============================================================
        // SHARED PREPARE: Extract + Retrieve + personalization
        // ============================================================
        private sealed class Prepared
        {
            public ExtractedFilter Filter { get; init; } = new();
            public List<AssistantRoom> Rooms { get; init; } = new();
            public string RetrievalMode { get; init; } = "empty"; // strict | semantic | relaxed | empty
            public string? PersonalizationHint { get; init; }
        }

        private async Task<Prepared> PrepareAsync(AssistantRequest request, string? userId, CancellationToken ct)
        {
            var message = (request.Message ?? "").Trim();

            try
            {
                var hint = await BuildUserPreferenceHintAsync(userId, ct);

                ExtractedFilter filter;
                if (LlmAvailable)
                {
                    try
                    {
                        filter = await ExtractFilterAsync(message, request.History, request.PreviousFilters, hint, ct);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Assistant extract step failed. Falling back to keyword filter.");
                        filter = KeywordFallbackFilter(message);
                    }
                }
                else
                {
                    filter = KeywordFallbackFilter(message);
                }

                var rooms = new List<AssistantRoom>();
                var mode = "empty";
                if (filter.Intent is "search" or "question")
                    (rooms, mode) = await RetrieveAsync(filter, message, ct);

                return new Prepared { Filter = filter, Rooms = rooms, RetrievalMode = mode, PersonalizationHint = hint };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Assistant prepare failed unexpectedly. Returning safe fallback.");
                return new Prepared { Filter = KeywordFallbackFilter(message) };
            }
        }

        // ============================================================
        // BƯỚC 1 — EXTRACT
        // ============================================================
        private async Task<ExtractedFilter> ExtractFilterAsync(
            string message, List<ChatTurn>? history, ExtractedFilter? previous, string? personalizationHint, CancellationToken ct)
        {
            var systemPrompt = new StringBuilder(@"Bạn là bộ trích xuất truy vấn cho nền tảng thuê phòng trọ RoomHub tại Việt Nam.
Đọc câu của người dùng (và ngữ cảnh) rồi CHỈ trả về JSON đúng schema:
{
  ""intent"": ""search|question|greeting|out_of_scope"",
  ""district"": string|null,
  ""minPrice"": number|null,
  ""maxPrice"": number|null,
  ""minArea"": number|null,
  ""maxArea"": number|null,
  ""roomType"": ""Phòng trọ|Studio|Căn hộ mini|Căn hộ""|null,
  ""amenities"": [string],
  ""maxPeople"": number|null,
  ""keywords"": string|null,
  ""sortBy"": ""priceAsc|priceDesc""|null
}
Quy tắc:
- Giá VNĐ/tháng. ""3 triệu""=3000000, ""1tr5""=1500000. ""dưới X""→maxPrice=X. ""trên X""→minPrice=X. ""khoảng X""→minPrice≈0.8X, maxPrice≈1.2X.
- Diện tích m². ""cho N người""→maxPeople=N.
- amenities: tiện nghi/nhu cầu nhắc tới (vd ""gác lửng"",""máy lạnh"",""thú cưng"",""ban công"",""wifi"",""để xe"").
- district: chỉ tên quận/huyện/khu vực. Nếu chỉ nhắc tên trường, để null và đưa vào keywords.
- keywords: mô tả tự do còn lại.
- intent=""greeting"" nếu chỉ chào; ""out_of_scope"" nếu không liên quan thuê phòng; ""question"" nếu hỏi về phòng/khu vực; còn lại ""search"".
- Field không xác định để null (amenities để []). KHÔNG bịa số liệu.");

            if (previous != null)
            {
                systemPrompt.Append(@"

BỘ LỌC LƯỢT TRƯỚC: ").Append(JsonSerializer.Serialize(previous)).Append(@"
Nếu câu hiện tại là TINH CHỈNH (vd ""rẻ hơn"",""gần hơn"",""rộng hơn"",""còn phòng nào khác""), hãy KẾ THỪA tiêu chí lượt trước và chỉ đổi phần được nhắc. Nếu là tìm kiếm MỚI hoàn toàn thì bỏ qua bộ lọc trước.");
            }

            if (!string.IsNullOrWhiteSpace(personalizationHint))
            {
                systemPrompt.Append(@"

SỞ THÍCH NGƯỜI DÙNG (tham khảo, ưu tiên yêu cầu hiện tại hơn): ").Append(personalizationHint)
                    .Append(@"
Chỉ dùng sở thích này để suy đoán khi câu hiện tại KHÔNG nói rõ khu vực/tầm giá.");
            }

            var messages = new List<object> { new { role = "system", content = systemPrompt.ToString() } };
            if (history != null)
                foreach (var turn in history.TakeLast(8))
                    messages.Add(new { role = turn.Role == "assistant" ? "assistant" : "user", content = turn.Content ?? "" });
            messages.Add(new { role = "user", content = message });

            var content = await CallGroqJsonAsync(messages, ct);
            using var doc = JsonDocument.Parse(content);
            var root = doc.RootElement;

            var filter = new ExtractedFilter
            {
                Intent = GetString(root, "intent") ?? "search",
                District = GetString(root, "district"),
                MinPrice = GetDecimal(root, "minPrice"),
                MaxPrice = GetDecimal(root, "maxPrice"),
                MinArea = GetDecimal(root, "minArea"),
                MaxArea = GetDecimal(root, "maxArea"),
                RoomType = GetString(root, "roomType"),
                MaxPeople = (int?)GetDecimal(root, "maxPeople"),
                Keywords = GetString(root, "keywords"),
                SortBy = NormalizeSort(GetString(root, "sortBy")),
                Amenities = GetStringList(root, "amenities")
            };

            if (filter.Intent is not ("search" or "question" or "greeting" or "out_of_scope"))
                filter.Intent = "search";

            return filter;
        }

        // ============================================================
        // BƯỚC 2 — RETRIEVE (strict → semantic → relaxed)
        // ============================================================
        private async Task<(List<AssistantRoom> rooms, string mode)> RetrieveAsync(
            ExtractedFilter filter, string message, CancellationToken ct)
        {
            var strict = await RunQueryAsync(filter, applyAmenities: true, applyKeywords: true, ct);
            if (strict.Count > 0) return (strict, "strict");

            // Semantic: giữ ràng buộc cứng (giá/diện tích/quận/loại/số người), xếp hạng theo ngữ nghĩa.
            if (_embeddings.IsAvailable)
            {
                var semantic = await SemanticRetrieveAsync(filter, message, ct);
                if (semantic.Count > 0) return (semantic, "semantic");
            }

            var relaxed = await RunQueryAsync(filter, applyAmenities: false, applyKeywords: false, ct);
            return relaxed.Count > 0 ? (relaxed, "relaxed") : (relaxed, "empty");
        }

        private IQueryable<Room> BaseApprovedQuery() => _context.Rooms
            .Include(r => r.Floor).ThenInclude(f => f.Building)
            .Include(r => r.RoomPhotos)
            .Include(r => r.RoomAmenities).ThenInclude(ra => ra.Amenity)
            .Where(r => !r.IsDeleted && r.HasListing && r.IsPublished
                        && r.ModerationStatus == ModerationStatus.Approved);

        private IQueryable<Room> ApplyHardFilters(IQueryable<Room> query, ExtractedFilter filter)
        {
            if (!string.IsNullOrWhiteSpace(filter.District))
            {
                var d = filter.District.ToLower().Trim();
                query = query.Where(r => r.Floor.Building.District.ToLower().Contains(d));
            }
            if (filter.MinPrice.HasValue) query = query.Where(r => r.BasePrice >= filter.MinPrice.Value);
            if (filter.MaxPrice.HasValue) query = query.Where(r => r.BasePrice <= filter.MaxPrice.Value);
            if (filter.MinArea.HasValue) query = query.Where(r => r.SurfaceArea >= filter.MinArea.Value);
            if (filter.MaxArea.HasValue) query = query.Where(r => r.SurfaceArea <= filter.MaxArea.Value);

            var parsedType = ParseRoomType(filter.RoomType);
            if (parsedType.HasValue) query = query.Where(r => r.RoomType == parsedType.Value);
            if (filter.MaxPeople.HasValue) query = query.Where(r => r.MaxCapacity >= filter.MaxPeople.Value);
            return query;
        }

        private async Task<List<AssistantRoom>> RunQueryAsync(
            ExtractedFilter filter, bool applyAmenities, bool applyKeywords, CancellationToken ct)
        {
            var query = ApplyHardFilters(BaseApprovedQuery(), filter);

            if (applyAmenities && filter.Amenities.Count > 0)
            {
                foreach (var amenity in filter.Amenities)
                {
                    var am = amenity.ToLower().Trim();
                    if (am.Length == 0) continue;
                    query = query.Where(r => r.RoomAmenities.Any(ra => ra.Amenity.Name.ToLower().Contains(am)));
                }
            }

            if (applyKeywords && !string.IsNullOrWhiteSpace(filter.Keywords))
            {
                var kw = filter.Keywords.ToLower().Trim();
                query = query.Where(r =>
                    r.Title.ToLower().Contains(kw) ||
                    (r.Description != null && r.Description.ToLower().Contains(kw)) ||
                    r.Floor.Building.Name.ToLower().Contains(kw) ||
                    r.Floor.Building.Address.ToLower().Contains(kw));
            }

            IOrderedQueryable<Room> ordered = filter.SortBy switch
            {
                "priceAsc" => query.OrderBy(r => r.BasePrice).ThenByDescending(r => r.ListingScore),
                "priceDesc" => query.OrderByDescending(r => r.BasePrice).ThenByDescending(r => r.ListingScore),
                _ => query.OrderByDescending(r => r.ListingScore).ThenByDescending(r => r.CreatedAt)
            };

            var rooms = await ordered.Take(TopN).ToListAsync(ct);
            return rooms.Select(ToAssistantRoom).ToList();
        }

        // ---------- SEMANTIC ----------
        private async Task<List<AssistantRoom>> SemanticRetrieveAsync(ExtractedFilter filter, string message, CancellationToken ct)
        {
            // Ứng viên: qua ràng buộc cứng, bỏ amenities/keywords (semantic sẽ lo phần đó).
            var candidates = await ApplyHardFilters(BaseApprovedQuery(), filter)
                .OrderByDescending(r => r.ListingScore)
                .Take(SemanticPoolCap)
                .ToListAsync(ct);

            if (candidates.Count == 0) return new List<AssistantRoom>();

            var queryText = string.Join(" ", new[] { message, filter.Keywords, string.Join(" ", filter.Amenities) }
                .Where(s => !string.IsNullOrWhiteSpace(s)));
            var queryVec = await _embeddings.EmbedAsync(queryText, ct);
            if (queryVec == null) return new List<AssistantRoom>();

            var vectors = await GetRoomEmbeddingsAsync(candidates, ct);

            var ranked = candidates
                .Select((r, i) => (room: r, score: vectors[i] == null ? -1f : Cosine(queryVec, vectors[i]!)))
                .Where(x => x.score > 0)
                .OrderByDescending(x => x.score)
                .Take(TopN)
                .Select(x => ToAssistantRoom(x.room))
                .ToList();

            return ranked;
        }

        private async Task<float[]?[]> GetRoomEmbeddingsAsync(List<Room> rooms, CancellationToken ct)
        {
            var result = new float[]?[rooms.Count];
            var missingIdx = new List<int>();
            var missingText = new List<string>();

            for (var i = 0; i < rooms.Count; i++)
            {
                var text = RoomEmbedText(rooms[i]);
                var key = $"emb:room:{rooms[i].Id}:{ShortHash(text)}";
                if (_cache.TryGetValue(key, out float[]? cached) && cached != null)
                {
                    result[i] = cached;
                }
                else
                {
                    missingIdx.Add(i);
                    missingText.Add(text);
                }
            }

            if (missingText.Count > 0)
            {
                var embedded = await _embeddings.EmbedBatchAsync(missingText, ct);
                for (var j = 0; j < missingIdx.Count; j++)
                {
                    var vec = j < embedded.Count ? embedded[j] : null;
                    var idx = missingIdx[j];
                    result[idx] = vec;
                    if (vec != null)
                    {
                        var key = $"emb:room:{rooms[idx].Id}:{ShortHash(missingText[j])}";
                        _cache.Set(key, vec, new MemoryCacheEntryOptions { SlidingExpiration = EmbeddingTtl });
                    }
                }
            }

            return result;
        }

        private static string RoomEmbedText(Room r)
        {
            var amenities = string.Join(", ", r.RoomAmenities.Select(ra => ra.Amenity.Name));
            return $"{r.Title}. {r.Description}. Loại: {RoomTypeLabel(r.RoomType)}. " +
                   $"Tiện nghi: {amenities}. Khu vực: {r.Floor.Building.District}, {r.Floor.Building.City}. " +
                   $"Giá {r.BasePrice:N0} VNĐ/tháng, {r.SurfaceArea ?? 25} m², tối đa {r.MaxCapacity} người.";
        }

        private static float Cosine(float[] a, float[] b)
        {
            var n = Math.Min(a.Length, b.Length);
            double dot = 0, na = 0, nb = 0;
            for (var i = 0; i < n; i++) { dot += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i]; }
            if (na == 0 || nb == 0) return 0;
            return (float)(dot / (Math.Sqrt(na) * Math.Sqrt(nb)));
        }

        // ============================================================
        // BƯỚC 3 — GENERATE
        // ============================================================
        private List<object> BuildGenerateMessages(string message, Prepared prep, List<ChatTurn>? history, bool jsonMode)
        {
            var roomsContext = JsonSerializer.Serialize(prep.Rooms.Select(r => new
            {
                r.Id, r.Title, r.Type, r.District, r.Price, r.Area, r.MaxPeople, r.Amenities
            }));

            var modeNote = prep.RetrievalMode switch
            {
                "semantic" => "Kết quả chọn theo mức độ liên quan ngữ nghĩa (gần đúng nhu cầu), có thể không khớp từng từ khóa.",
                "relaxed" => "Kết quả đã nới lỏng một số tiêu chí (vd tiện nghi) — hãy nói rõ đây là các phòng gần khớp.",
                "empty" => "Không có phòng nào khớp.",
                _ => "Kết quả khớp tiêu chí người dùng."
            };

            var sys = new StringBuilder($@"Bạn là trợ lý tư vấn thuê phòng của RoomHub. Trả lời tiếng Việt, thân thiện, súc tích.
QUY TẮC BẮT BUỘC:
- CHỈ nói về các phòng trong DANH SÁCH PHÒNG được cung cấp. TUYỆT ĐỐI không bịa thêm phòng, giá, địa chỉ hay số điện thoại.
- Tư vấn tự nhiên, có thể so sánh 2-3 lựa chọn nổi bật và nêu lý do; không liệt kê lại toàn bộ dữ liệu thô.
- Nếu danh sách rỗng: nói chưa tìm thấy phòng khớp và gợi ý nới tiêu chí.
- intent=""greeting"": chào lại ngắn gọn, mời mô tả nhu cầu. intent=""out_of_scope"": lịch sự nói chỉ hỗ trợ tìm phòng RoomHub.
- {modeNote}
- Không dùng bảng markdown; có thể dùng gạch đầu dòng ngắn.");

            if (!string.IsNullOrWhiteSpace(prep.PersonalizationHint))
                sys.Append(@"
- Người dùng có sở thích: ").Append(prep.PersonalizationHint).Append(" — có thể cá nhân hóa nhẹ nhàng, đừng gượng ép.");

            if (jsonMode)
                sys.Append(@"

Trả về JSON: { ""reply"": ""..."", ""suggestions"": [""...""] }  (suggestions: 2-4 câu hỏi tiếp theo ngắn gọn).");
            else
                sys.Append(@"

Chỉ trả về phần văn bản trả lời (không JSON, không tiêu đề).");

            var messages = new List<object> { new { role = "system", content = sys.ToString() } };
            if (history != null)
                foreach (var turn in history.TakeLast(6))
                    messages.Add(new { role = turn.Role == "assistant" ? "assistant" : "user", content = turn.Content ?? "" });

            messages.Add(new
            {
                role = "user",
                content = $"Ý định: {prep.Filter.Intent}\nCâu người dùng: {message}\nDANH SÁCH PHÒNG ({prep.Rooms.Count}): {roomsContext}"
            });
            return messages;
        }

        private async Task<(string reply, List<string> suggestions)> GenerateReplyJsonAsync(
            string message, Prepared prep, List<ChatTurn>? history)
        {
            var messages = BuildGenerateMessages(message, prep, history, jsonMode: true);
            var content = await CallGroqJsonAsync(messages, CancellationToken.None);
            using var doc = JsonDocument.Parse(content);
            var root = doc.RootElement;

            var reply = GetString(root, "reply") ?? DeterministicReply(prep).reply;
            var suggestions = GetStringList(root, "suggestions");
            if (suggestions.Count == 0) suggestions = BuildSuggestions(prep);
            return (reply, suggestions);
        }

        // ============================================================
        // FALLBACK không dùng LLM
        // ============================================================
        private static ExtractedFilter KeywordFallbackFilter(string message) => new()
        {
            Intent = string.IsNullOrWhiteSpace(message) ? "greeting" : "search",
            Keywords = string.IsNullOrWhiteSpace(message) ? null : message
        };

        private static (string reply, List<string> suggestions) DeterministicReply(Prepared prep)
        {
            var filter = prep.Filter;
            if (filter.Intent == "greeting")
                return ("Xin chào! Mình là trợ lý tìm phòng của RoomHub. Bạn muốn thuê phòng khu vực nào, tầm giá bao nhiêu?",
                        BuildSuggestions(prep));
            if (filter.Intent == "out_of_scope")
                return ("Mình chỉ hỗ trợ tìm phòng trọ trên RoomHub thôi. Bạn cần tìm phòng ở khu vực nào không?",
                        BuildSuggestions(prep));
            if (prep.Rooms.Count == 0)
                return ("Mình chưa tìm thấy phòng nào khớp tiêu chí. Bạn thử nới ngân sách, đổi khu vực hoặc bớt tiện nghi nhé.",
                        BuildSuggestions(prep));

            var lead = prep.RetrievalMode is "relaxed" or "semantic"
                ? $"Chưa có phòng khớp hết tiêu chí, nhưng mình tìm được {prep.Rooms.Count} phòng gần đúng:"
                : $"Mình tìm được {prep.Rooms.Count} phòng phù hợp:";
            var lines = prep.Rooms.Select(r => $"• {r.Title} — {r.Price:N0}đ/tháng, {r.Area:N0}m², {r.District}");
            return (lead + "\n" + string.Join("\n", lines), BuildSuggestions(prep));
        }

        private static List<string> BuildSuggestions(Prepared prep)
        {
            var s = new List<string>();
            if (prep.Rooms.Count > 0) s.Add("Phòng nào rẻ nhất?");
            if (prep.Filter.MaxPrice.HasValue) s.Add("Có phòng rẻ hơn không?");
            if (string.IsNullOrWhiteSpace(prep.Filter.District)) s.Add("Chỉ xem khu trung tâm");
            s.Add("Xem phòng có máy lạnh");
            s.Add("Phòng cho 2 người");
            return s.Distinct().Take(4).ToList();
        }

        // ============================================================
        // PERSONALIZATION (SearchHistory)
        // ============================================================
        private async Task<string?> BuildUserPreferenceHintAsync(string? userId, CancellationToken ct)
        {
            if (string.IsNullOrWhiteSpace(userId)) return null;
            try
            {
                var rows = await _context.SearchHistories
                    .Where(s => s.UserId == userId && s.SearchQuery != null)
                    .OrderByDescending(s => s.Timestamp)
                    .Take(15)
                    .Select(s => s.SearchQuery!)
                    .ToListAsync(ct);

                if (rows.Count == 0) return null;

                var districts = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);
                var roomTypes = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);
                var prices = new List<decimal>();

                foreach (var raw in rows)
                {
                    try
                    {
                        using var doc = JsonDocument.Parse(raw);
                        var root = doc.RootElement;
                        var f = root.TryGetProperty("filter", out var fEl) ? fEl : root;

                        var d = GetString(f, "district");
                        if (!string.IsNullOrWhiteSpace(d)) districts[d] = districts.GetValueOrDefault(d) + 1;

                        var rt = GetString(f, "roomType");
                        if (!string.IsNullOrWhiteSpace(rt)) roomTypes[rt] = roomTypes.GetValueOrDefault(rt) + 1;

                        var mp = GetDecimal(f, "maxPrice");
                        if (mp.HasValue && mp.Value > 0) prices.Add(mp.Value);
                    }
                    catch { /* bỏ qua dòng log không đúng định dạng */ }
                }

                var parts = new List<string>();
                var topDistrict = districts.OrderByDescending(x => x.Value).Select(x => x.Key).FirstOrDefault();
                if (topDistrict != null) parts.Add($"thường tìm ở {topDistrict}");
                var topType = roomTypes.OrderByDescending(x => x.Value).Select(x => x.Key).FirstOrDefault();
                if (topType != null) parts.Add($"loại {topType}");
                if (prices.Count > 0) parts.Add($"tầm giá ~{prices.Average():N0}đ");

                return parts.Count > 0 ? string.Join(", ", parts) : null;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Build user preference hint failed (non-blocking).");
                return null;
            }
        }

        // ============================================================
        // LOG
        // ============================================================
        private async Task TryLogSearchHistoryAsync(string? userId, string message, ExtractedFilter filter)
        {
            if (string.IsNullOrWhiteSpace(userId)) return;
            try
            {
                var payload = JsonSerializer.Serialize(new { message, filter }, LogJson);
                _context.SearchHistories.Add(new SearchHistory
                {
                    UserId = userId,
                    SearchQuery = payload,
                    Timestamp = DateTime.UtcNow
                });
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to log assistant search history (non-blocking).");
            }
        }

        // ============================================================
        // Groq calls
        // ============================================================
        private async Task<string> CallGroqJsonAsync(List<object> messages, CancellationToken ct)
        {
            var payload = new
            {
                model = TextModel,
                response_format = new { type = "json_object" },
                messages,
                temperature = 0.1
            };

            using var requestMessage = new HttpRequestMessage(HttpMethod.Post, GroqEndpoint);
            requestMessage.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);
            requestMessage.Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");

            using var response = await _httpClient.SendAsync(requestMessage, ct);
            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync(ct);
                throw new Exception($"Groq API {response.StatusCode}: {errorContent}");
            }

            var responseJson = await response.Content.ReadAsStringAsync(ct);
            using var doc = JsonDocument.Parse(responseJson);
            return doc.RootElement.GetProperty("choices")[0].GetProperty("message").GetProperty("content").GetString()
                   ?? throw new Exception("Empty Groq response");
        }

        private readonly struct GroqDelta
        {
            public string? Text { get; init; }
            public bool Failed { get; init; }
            public static GroqDelta Chunk(string t) => new() { Text = t };
            public static GroqDelta Fail() => new() { Failed = true };
        }

        private async IAsyncEnumerable<GroqDelta> CallGroqStreamAsync(
            List<object> messages, [EnumeratorCancellation] CancellationToken ct)
        {
            var payload = new { model = TextModel, messages, temperature = 0.3, stream = true };

            using var request = new HttpRequestMessage(HttpMethod.Post, GroqEndpoint);
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);
            request.Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");

            HttpResponseMessage? response = null;
            Stream? stream = null;
            var ok = true;
            try
            {
                response = await _httpClient.SendAsync(request, HttpCompletionOption.ResponseHeadersRead, ct);
                if (!response.IsSuccessStatusCode)
                {
                    var err = await response.Content.ReadAsStringAsync(ct);
                    _logger.LogError("Groq stream HTTP {Status}: {Err}", response.StatusCode, err);
                    ok = false;
                }
                else
                {
                    stream = await response.Content.ReadAsStreamAsync(ct);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Groq stream connect failed.");
                ok = false;
            }

            if (!ok || stream == null)
            {
                response?.Dispose();
                yield return GroqDelta.Fail();
                yield break;
            }

            using (response)
            using (stream)
            using (var reader = new StreamReader(stream))
            {
                while (!reader.EndOfStream)
                {
                    if (ct.IsCancellationRequested) yield break;

                    string? line;
                    var readOk = true;
                    try { line = await reader.ReadLineAsync(ct); }
                    catch { line = null; readOk = false; }

                    if (!readOk) { yield return GroqDelta.Fail(); yield break; }
                    if (line == null) break;
                    if (!line.StartsWith("data:")) continue;

                    var data = line.Substring(5).Trim();
                    if (data.Length == 0) continue;
                    if (data == "[DONE]") yield break;

                    string? text = null;
                    try
                    {
                        using var doc = JsonDocument.Parse(data);
                        var choices = doc.RootElement.GetProperty("choices");
                        if (choices.GetArrayLength() > 0 &&
                            choices[0].TryGetProperty("delta", out var delta) &&
                            delta.TryGetProperty("content", out var c) &&
                            c.ValueKind == JsonValueKind.String)
                        {
                            text = c.GetString();
                        }
                    }
                    catch { /* bỏ qua mảnh JSON không parse được */ }

                    if (!string.IsNullOrEmpty(text)) yield return GroqDelta.Chunk(text);
                }
            }
        }

        // ============================================================
        // Helpers
        // ============================================================
        private static AssistantRoom ToAssistantRoom(Room r) => new()
        {
            Id = r.Id,
            Title = r.Title,
            Type = RoomTypeLabel(r.RoomType),
            District = r.Floor.Building.District,
            Location = $"{r.Floor.Building.Address}, {r.Floor.Building.Ward}, {r.Floor.Building.District}, {r.Floor.Building.City}",
            Price = (double)r.BasePrice,
            Area = (double)(r.SurfaceArea ?? 25),
            MaxPeople = r.MaxCapacity,
            Image = r.RoomPhotos.OrderBy(p => p.DisplayOrder).Select(p => p.Url).FirstOrDefault() ?? FallbackImage,
            Amenities = r.RoomAmenities.Select(ra => ra.Amenity.Name).ToList()
        };

        private static RoomType? ParseRoomType(string? label) => label switch
        {
            "Phòng trọ" => RoomType.BoardingHouse,
            "Studio" => RoomType.Studio,
            "Căn hộ mini" => RoomType.MiniApartment,
            "Căn hộ" => RoomType.Apartment,
            _ => null
        };

        private static string RoomTypeLabel(RoomType type) => type switch
        {
            RoomType.Studio => "Studio",
            RoomType.MiniApartment => "Căn hộ mini",
            RoomType.Apartment => "Căn hộ",
            _ => "Phòng trọ"
        };

        private static string? NormalizeSort(string? sort) => sort is "priceAsc" or "priceDesc" ? sort : null;

        private static string ShortHash(string text)
        {
            var bytes = SHA1.HashData(Encoding.UTF8.GetBytes(text));
            return Convert.ToHexString(bytes, 0, 6);
        }

        private static string? GetString(JsonElement root, string name) =>
            root.TryGetProperty(name, out var el) && el.ValueKind == JsonValueKind.String ? el.GetString() : null;

        private static decimal? GetDecimal(JsonElement root, string name)
        {
            if (!root.TryGetProperty(name, out var el)) return null;
            if (el.ValueKind == JsonValueKind.Number && el.TryGetDecimal(out var d)) return d;
            if (el.ValueKind == JsonValueKind.String && decimal.TryParse(el.GetString(), out var ds)) return ds;
            return null;
        }

        private static List<string> GetStringList(JsonElement root, string name)
        {
            var list = new List<string>();
            if (root.TryGetProperty(name, out var el) && el.ValueKind == JsonValueKind.Array)
                foreach (var item in el.EnumerateArray())
                    if (item.ValueKind == JsonValueKind.String)
                    {
                        var v = item.GetString();
                        if (!string.IsNullOrWhiteSpace(v)) list.Add(v.Trim());
                    }
            return list;
        }
    }
}
