using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Application.Common.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace Infrastructure.Services
{
    /// <summary>
    /// Sinh embedding bằng Gemini (text-embedding-004). Tái sử dụng key GeminiSettings sẵn có.
    /// Suy biến an toàn: mọi lỗi trả null → tầng gọi tự bỏ qua nhánh semantic.
    /// </summary>
    public class GeminiEmbeddingService : IEmbeddingService
    {
        private const string Model = "text-embedding-004";
        private const string BaseUrl = "https://generativelanguage.googleapis.com/v1beta/models";

        private readonly HttpClient _httpClient;
        private readonly string _apiKey;
        private readonly ILogger<GeminiEmbeddingService> _logger;

        public GeminiEmbeddingService(HttpClient httpClient, IConfiguration configuration, ILogger<GeminiEmbeddingService> logger)
        {
            _httpClient = httpClient;
            _apiKey = configuration["GeminiSettings:ApiKey"] ?? "";
            _logger = logger;
        }

        public bool IsAvailable => !string.IsNullOrWhiteSpace(_apiKey);

        public async Task<float[]?> EmbedAsync(string text, CancellationToken ct = default)
        {
            if (!IsAvailable || string.IsNullOrWhiteSpace(text)) return null;

            try
            {
                var payload = new
                {
                    model = $"models/{Model}",
                    content = new { parts = new[] { new { text } } }
                };

                var url = $"{BaseUrl}/{Model}:embedContent?key={_apiKey}";
                var resp = await PostAsync(url, payload, ct);
                if (resp == null) return null;

                using var doc = JsonDocument.Parse(resp);
                return ReadValues(doc.RootElement.GetProperty("embedding"));
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Gemini embed (single) failed.");
                return null;
            }
        }

        public async Task<IReadOnlyList<float[]?>> EmbedBatchAsync(IReadOnlyList<string> texts, CancellationToken ct = default)
        {
            var result = new float[]?[texts.Count];
            if (!IsAvailable || texts.Count == 0) return result;

            try
            {
                var requests = new List<object>(texts.Count);
                foreach (var t in texts)
                {
                    requests.Add(new
                    {
                        model = $"models/{Model}",
                        content = new { parts = new[] { new { text = string.IsNullOrWhiteSpace(t) ? " " : t } } }
                    });
                }

                var url = $"{BaseUrl}/{Model}:batchEmbedContents?key={_apiKey}";
                var resp = await PostAsync(url, new { requests }, ct);
                if (resp == null) return result;

                using var doc = JsonDocument.Parse(resp);
                if (doc.RootElement.TryGetProperty("embeddings", out var arr) && arr.ValueKind == JsonValueKind.Array)
                {
                    var i = 0;
                    foreach (var emb in arr.EnumerateArray())
                    {
                        if (i >= result.Length) break;
                        result[i++] = ReadValues(emb);
                    }
                }
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Gemini embed (batch) failed.");
                return result;
            }
        }

        private async Task<string?> PostAsync(string url, object payload, CancellationToken ct)
        {
            using var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
            using var resp = await _httpClient.PostAsync(url, content, ct);
            if (!resp.IsSuccessStatusCode)
            {
                var err = await resp.Content.ReadAsStringAsync(ct);
                _logger.LogWarning("Gemini embed HTTP {Status}: {Err}", resp.StatusCode, err);
                return null;
            }
            return await resp.Content.ReadAsStringAsync(ct);
        }

        private static float[]? ReadValues(JsonElement embedding)
        {
            if (!embedding.TryGetProperty("values", out var values) || values.ValueKind != JsonValueKind.Array)
                return null;

            var list = new List<float>(values.GetArrayLength());
            foreach (var v in values.EnumerateArray())
            {
                if (v.ValueKind == JsonValueKind.Number) list.Add(v.GetSingle());
            }
            return list.Count > 0 ? list.ToArray() : null;
        }
    }
}
