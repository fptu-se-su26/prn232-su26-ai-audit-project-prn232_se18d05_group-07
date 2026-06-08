using System.Net.Http;
using Microsoft.Extensions.Logging;

namespace Infrastructure.Services
{
    internal class LoadedImage
    {
        public string Url { get; set; } = "";
        public byte[] Bytes { get; set; } = Array.Empty<byte>();
        public string MimeType { get; set; } = "image/jpeg";
        public string Base64 => Convert.ToBase64String(Bytes);
    }

    internal static class ModerationImageLoader
    {
        private const int MaxImages = 3;
        private const int MaxBytesPerImage = 4 * 1024 * 1024;

        public static async Task<List<LoadedImage>> LoadAsync(
            HttpClient httpClient, IEnumerable<string> imageUrls, ILogger logger)
        {
            var results = new List<LoadedImage>();

            foreach (var url in imageUrls)
            {
                if (results.Count >= MaxImages) break;
                if (!IsValidUrl(url)) continue;

                try
                {
                    var bytes = await httpClient.GetByteArrayAsync(url);
                    if (bytes.Length == 0 || bytes.Length > MaxBytesPerImage)
                    {
                        logger.LogWarning("Image {Url} skipped: size {Size} bytes", url, bytes.Length);
                        continue;
                    }

                    results.Add(new LoadedImage
                    {
                        Url = url,
                        Bytes = bytes,
                        MimeType = DetectMimeType(url)
                    });
                }
                catch (Exception ex)
                {
                    logger.LogWarning("Could not download image {Url}: {Message}", url, ex.Message);
                }
            }

            return results;
        }

        public static List<string> GetValidUrls(IEnumerable<string> imageUrls) =>
            imageUrls.Where(IsValidUrl).Take(MaxImages).ToList();

        private static bool IsValidUrl(string? url) =>
            !string.IsNullOrWhiteSpace(url)
            && (url.StartsWith("http://", StringComparison.OrdinalIgnoreCase)
                || url.StartsWith("https://", StringComparison.OrdinalIgnoreCase))
            && !url.Contains("localhost", StringComparison.OrdinalIgnoreCase);

        public static string DetectMimeType(string url)
        {
            var lower = url.ToLowerInvariant();
            if (lower.Contains(".png")) return "image/png";
            if (lower.Contains(".webp")) return "image/webp";
            if (lower.Contains(".gif")) return "image/gif";
            return "image/jpeg";
        }
    }
}
