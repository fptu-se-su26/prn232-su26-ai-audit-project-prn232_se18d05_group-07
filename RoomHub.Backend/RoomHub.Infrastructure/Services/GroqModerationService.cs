using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Application.Common.Interfaces;
using Domain.Enums;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace Infrastructure.Services
{
    public class GroqModerationService
    {
        private const string TextModel = "llama-3.3-70b-versatile";
        private const string VisionModel = "meta-llama/llama-4-scout-17b-16e-instruct";

        private readonly HttpClient _httpClient;
        private readonly string _apiKey;
        private readonly ILogger<GroqModerationService> _logger;

        public GroqModerationService(HttpClient httpClient, IConfiguration configuration, ILogger<GroqModerationService> logger)
        {
            _httpClient = httpClient;
            _apiKey = configuration["GroqSettings:ApiKey"] ?? "";
            _logger = logger;
        }

        public async Task<ModerationResult> ModerateTextAsync(string title, string description, decimal price, decimal area)
        {
            if (string.IsNullOrWhiteSpace(_apiKey))
            {
                return TechnicalFailure("Chưa cấu hình Groq API Key", description);
            }

            try
            {
                var systemPrompt = @"Bạn là kiểm duyệt viên tin đăng cho thuê phòng trọ tại Việt Nam.
Trả về JSON: {""isViolation"": boolean, ""remarks"": ""giải thích tiếng Việt"", ""qualityScore"": 0-100, ""formattedDescription"": ""mô tả đã chỉnh sửa"", ""amenities"": []}

isViolation=true nếu: có SĐT/email/link liên hệ, spam, lừa đảo, nội dung không liên quan nhà ở, mô tả sơ sài/vô nghĩa.";

                var userContent = $"Tiêu đề: {title}\nMô tả: {description}\nGiá: {price:N0} VNĐ/tháng\nDiện tích: {area} m²";

                var contentString = await CallGroqJsonAsync(TextModel, systemPrompt, userContent);
                using var contentDoc = JsonDocument.Parse(contentString);
                var root = contentDoc.RootElement;

                var isViolation = root.GetProperty("isViolation").GetBoolean();
                var remarks = root.GetProperty("remarks").GetString() ?? "";
                var qualityScore = root.GetProperty("qualityScore").GetInt32();
                var formattedDescription = root.TryGetProperty("formattedDescription", out var fd)
                    ? fd.GetString() ?? description
                    : description;

                var amenities = new List<string>();
                if (root.TryGetProperty("amenities", out var amenitiesProp) && amenitiesProp.ValueKind == JsonValueKind.Array)
                {
                    foreach (var elem in amenitiesProp.EnumerateArray())
                    {
                        var val = elem.GetString();
                        if (!string.IsNullOrEmpty(val)) amenities.Add(val);
                    }
                }

                return new ModerationResult
                {
                    Status = isViolation ? ModerationStatus.Rejected : ModerationStatus.Approved,
                    Reason = remarks,
                    QualityScore = qualityScore,
                    AutoFormattedText = formattedDescription,
                    ExtractedAmenities = amenities
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Groq text moderation failed.");
                return TechnicalFailure($"Lỗi kiểm duyệt văn bản (Groq): {ex.Message}", description);
            }
        }

        public async Task<ModerationResult> ModerateImagesAsync(List<string> imageUrls)
        {
            if (string.IsNullOrWhiteSpace(_apiKey))
            {
                return TechnicalFailure("Chưa cấu hình Groq API Key — ảnh", "");
            }

            var urls = ModerationImageLoader.GetValidUrls(imageUrls);
            if (urls.Count == 0)
            {
                return new ModerationResult
                {
                    Status = ModerationStatus.Rejected,
                    Reason = "Không có ảnh hợp lệ để kiểm duyệt. Vui lòng tải ảnh thật của phòng.",
                };
            }

            var imagePrompt = @"Kiểm duyệt ảnh tin cho thuê phòng trọ. Trả về JSON: {""isViolation"": boolean, ""remarks"": ""tiếng Việt"", ""detectedType"": ""room|anime|person|other""}

isViolation=true nếu ảnh là anime/hoạt hình/meme/selfie không có phòng/đồ ăn/xe/phong cảnh không liên quan.
isViolation=false chỉ khi là ảnh thật của phòng, bếp, WC, ban công, tòa nhà.";

            try
            {
                foreach (var imageUrl in urls)
                {
                    var result = await AnalyzeSingleImageAsync(imageUrl, imagePrompt);
                    if (result.Status != ModerationStatus.Approved)
                        return result;
                }

                return new ModerationResult
                {
                    Status = ModerationStatus.Approved,
                    Reason = "Ảnh phù hợp tiêu chuẩn tin cho thuê",
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Groq vision moderation failed.");
                return TechnicalFailure($"Lỗi kiểm duyệt hình ảnh (Groq Vision): {ex.Message}", "");
            }
        }

        private async Task<ModerationResult> AnalyzeSingleImageAsync(string imageUrl, string prompt)
        {
            var payload = new
            {
                model = VisionModel,
                messages = new[]
                {
                    new
                    {
                        role = "user",
                        content = new object[]
                        {
                            new { type = "text", text = prompt },
                            new { type = "image_url", image_url = new { url = imageUrl } }
                        }
                    }
                },
                temperature = 0.1,
                max_completion_tokens = 512,
                response_format = new { type = "json_object" }
            };

            var requestMessage = new HttpRequestMessage(HttpMethod.Post, "https://api.groq.com/openai/v1/chat/completions");
            requestMessage.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);
            requestMessage.Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");

            var response = await _httpClient.SendAsync(requestMessage);
            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                _logger.LogError("Groq vision error for {Url}: {Status} - {Content}", imageUrl, response.StatusCode, errorContent);
                throw new Exception($"Groq vision failed: {response.StatusCode}");
            }

            var responseJson = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(responseJson);
            var contentString = doc.RootElement
                .GetProperty("choices")[0]
                .GetProperty("message")
                .GetProperty("content")
                .GetString() ?? "{}";

            using var resultDoc = JsonDocument.Parse(contentString);
            var root = resultDoc.RootElement;
            var isViolation = root.TryGetProperty("isViolation", out var v) && v.GetBoolean();
            var remarks = root.TryGetProperty("remarks", out var r) ? r.GetString() ?? "" : "";
            var detectedType = root.TryGetProperty("detectedType", out var t) ? t.GetString() ?? "other" : "other";

            if (!isViolation && detectedType is "anime" or "person" or "other")
                isViolation = true;

            return new ModerationResult
            {
                Status = isViolation ? ModerationStatus.Rejected : ModerationStatus.Approved,
                Reason = isViolation
                    ? (string.IsNullOrWhiteSpace(remarks) ? ModerationMessageCatalog.ForImageInvalid() : remarks)
                    : "Ảnh hợp lệ"
            };
        }

        private async Task<string> CallGroqJsonAsync(string model, string systemPrompt, string userContent)
        {
            var payload = new
            {
                model,
                response_format = new { type = "json_object" },
                messages = new[]
                {
                    new { role = "system", content = systemPrompt },
                    new { role = "user", content = userContent }
                },
                temperature = 0.1
            };

            var requestMessage = new HttpRequestMessage(HttpMethod.Post, "https://api.groq.com/openai/v1/chat/completions");
            requestMessage.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);
            requestMessage.Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");

            var response = await _httpClient.SendAsync(requestMessage);
            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                throw new Exception($"Groq API {response.StatusCode}: {errorContent}");
            }

            var responseJson = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(responseJson);
            return doc.RootElement
                .GetProperty("choices")[0]
                .GetProperty("message")
                .GetProperty("content")
                .GetString() ?? throw new Exception("Empty Groq response");
        }

        private static ModerationResult TechnicalFailure(string internalReason, string description) => new()
        {
            Status = ModerationStatus.Flagged,
            Reason = internalReason,
            QualityScore = 50,
            AutoFormattedText = description,
            ExtractedAmenities = new List<string>()
        };
    }
}
