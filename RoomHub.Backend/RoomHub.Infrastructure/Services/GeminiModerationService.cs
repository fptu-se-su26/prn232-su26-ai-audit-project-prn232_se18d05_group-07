using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Application.Common.Interfaces;
using Domain.Enums;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace Infrastructure.Services
{
    public class GeminiModerationService
    {
        private const string VisionModel = "gemini-2.0-flash";

        private readonly HttpClient _httpClient;
        private readonly string _apiKey;
        private readonly ILogger<GeminiModerationService> _logger;

        public GeminiModerationService(HttpClient httpClient, IConfiguration configuration, ILogger<GeminiModerationService> logger)
        {
            _httpClient = httpClient;
            _apiKey = configuration["GeminiSettings:ApiKey"] ?? "";
            _logger = logger;
        }

        public async Task<ModerationResult> ModerateImagesAsync(List<string> imageUrls)
        {
            if (string.IsNullOrWhiteSpace(_apiKey))
            {
                return TechnicalFailure("Chưa cấu hình Gemini API Key");
            }

            if (imageUrls == null || imageUrls.Count == 0)
            {
                return new ModerationResult
                {
                    Status = ModerationStatus.Rejected,
                    Reason = "Tin đăng không có ảnh minh họa phòng trọ.",
                };
            }

            try
            {
                var loadedImages = await ModerationImageLoader.LoadAsync(_httpClient, imageUrls, _logger);
                if (loadedImages.Count == 0)
                {
                    return new ModerationResult
                    {
                        Status = ModerationStatus.Rejected,
                        Reason = "Không tải được ảnh để kiểm duyệt. Vui lòng tải ảnh thật của phòng trọ.",
                    };
                }

                var partsList = new List<object>
                {
                    new { text = @"Kiểm duyệt ảnh tin cho thuê phòng trọ Việt Nam.
Trả về JSON: {""isViolation"": boolean, ""remarks"": ""tiếng Việt"", ""detectedType"": ""room|anime|person|food|landscape|screenshot|other""}

isViolation=true nếu BẤT KỲ ảnh là anime/hoạt hình/meme/AI art/selfie không có phòng/đồ ăn/xe/screenshot/watermark SĐT.
isViolation=false chỉ khi ảnh thật của phòng ngủ, bếp, WC, ban công, mặt tiền nhà trọ." }
                };

                foreach (var img in loadedImages)
                {
                    partsList.Add(new
                    {
                        inlineData = new { mimeType = img.MimeType, data = img.Base64 }
                    });
                }

                var requestUrl = $"https://generativelanguage.googleapis.com/v1beta/models/{VisionModel}:generateContent?key={_apiKey}";
                var payload = new
                {
                    contents = new[] { new { parts = partsList } },
                    generationConfig = new { responseMimeType = "application/json", temperature = 0.1 }
                };

                var response = await _httpClient.PostAsync(
                    requestUrl,
                    new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json"));

                if (!response.IsSuccessStatusCode)
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    _logger.LogError("Gemini API error: {Status} - {Content}", response.StatusCode, errorContent);
                    throw new Exception($"Gemini API {response.StatusCode}");
                }

                var responseJson = await response.Content.ReadAsStringAsync();
                using var doc = JsonDocument.Parse(responseJson);
                var textResponse = doc.RootElement
                    .GetProperty("candidates")[0]
                    .GetProperty("content")
                    .GetProperty("parts")[0]
                    .GetProperty("text")
                    .GetString() ?? "{}";

                using var contentDoc = JsonDocument.Parse(textResponse);
                var root = contentDoc.RootElement;
                var isViolation = root.TryGetProperty("isViolation", out var v) && v.GetBoolean();
                var remarks = root.TryGetProperty("remarks", out var r) ? r.GetString() ?? "" : "";
                var detectedType = root.TryGetProperty("detectedType", out var t) ? t.GetString() ?? "other" : "other";

                if (!isViolation && detectedType is "anime" or "person" or "food" or "landscape" or "screenshot" or "other")
                {
                    isViolation = true;
                    remarks = $"Ảnh không phù hợp tin cho thuê (loại: {detectedType}). {remarks}";
                }

                return new ModerationResult
                {
                    Status = isViolation ? ModerationStatus.Rejected : ModerationStatus.Approved,
                    Reason = isViolation
                        ? (string.IsNullOrWhiteSpace(remarks) ? ModerationMessageCatalog.ForImageInvalid() : remarks)
                        : "Ảnh phù hợp tiêu chuẩn tin cho thuê"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Gemini vision moderation failed.");
                return TechnicalFailure($"Lỗi kiểm duyệt hình ảnh (Gemini): {ex.Message}");
            }
        }

        private static ModerationResult TechnicalFailure(string internalReason) => new()
        {
            Status = ModerationStatus.Flagged,
            Reason = internalReason
        };
    }
}
