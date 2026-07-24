using System;
using System.IO;
using System.Threading.Tasks;
using Application.Common.Interfaces;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;

namespace Infrastructure.Services
{
    public class FileUploadService : IFileUploadService
    {
        private const long MaxSizeBytes = 5 * 1024 * 1024; // 5MB

        private readonly IConfiguration _configuration;
        private readonly IWebHostEnvironment _environment;

        public FileUploadService(IConfiguration configuration, IWebHostEnvironment environment)
        {
            _configuration = configuration;
            _environment = environment;
        }

        public async Task<string> UploadImageAsync(Stream fileStream, string originalFileName, string folder, string localBaseUrl)
        {
            if (fileStream.Length == 0)
                throw new ArgumentException("Tập tin rỗng.");
            if (fileStream.Length > MaxSizeBytes)
                throw new ArgumentException($"Tập tin vượt quá dung lượng cho phép ({MaxSizeBytes / 1024 / 1024}MB).");

            var extension = DetectImageExtensionFromContent(fileStream);
            if (extension == null)
                throw new ArgumentException("Tập tin không phải là hình ảnh hợp lệ (jpg, png, gif, webp).");

            if (IsCloudinaryConfigured(out var cloudName, out var apiKey, out var apiSecret))
            {
                var account = new Account(cloudName, apiKey, apiSecret);
                var cloudinary = new Cloudinary(account);
                var uploadParams = new ImageUploadParams
                {
                    File = new FileDescription($"{Guid.NewGuid():N}{extension}", fileStream),
                    Folder = folder
                };
                var result = await cloudinary.UploadAsync(uploadParams);
                if (result.StatusCode == System.Net.HttpStatusCode.OK)
                    return result.SecureUrl.ToString();

                throw new InvalidOperationException("Tải tập tin lên Cloudinary thất bại.");
            }

            // Local fallback, served by Program.cs's static file middleware at /uploads
            var webRoot = _environment.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            var targetFolder = Path.Combine(webRoot, "uploads", folder);
            Directory.CreateDirectory(targetFolder);

            var fileName = $"{Guid.NewGuid():N}{extension}";
            fileStream.Position = 0;
            using (var output = new FileStream(Path.Combine(targetFolder, fileName), FileMode.Create))
            {
                await fileStream.CopyToAsync(output);
            }

            return $"{localBaseUrl}/uploads/{folder}/{fileName}";
        }

        private bool IsCloudinaryConfigured(out string cloudName, out string apiKey, out string apiSecret)
        {
            cloudName = _configuration["CloudinarySettings:CloudName"] ?? string.Empty;
            apiKey = _configuration["CloudinarySettings:ApiKey"] ?? string.Empty;
            apiSecret = _configuration["CloudinarySettings:ApiSecret"] ?? string.Empty;

            return !string.IsNullOrWhiteSpace(cloudName) && !cloudName.Contains("YOUR_CLOUDINARY") &&
                   !string.IsNullOrWhiteSpace(apiKey) && !apiKey.Contains("YOUR_CLOUDINARY") &&
                   !string.IsNullOrWhiteSpace(apiSecret) && !apiSecret.Contains("YOUR_CLOUDINARY");
        }

        // Sniffs the first few bytes rather than trusting the client-supplied file name/extension.
        private static string? DetectImageExtensionFromContent(Stream stream)
        {
            stream.Position = 0;
            var header = new byte[12];
            var read = stream.Read(header, 0, header.Length);
            stream.Position = 0;

            if (read >= 8 && header[0] == 0x89 && header[1] == 0x50 && header[2] == 0x4E && header[3] == 0x47)
                return ".png";
            if (read >= 3 && header[0] == 0xFF && header[1] == 0xD8 && header[2] == 0xFF)
                return ".jpg";
            if (read >= 6 && header[0] == 0x47 && header[1] == 0x49 && header[2] == 0x46 && header[3] == 0x38)
                return ".gif";
            if (read >= 12 && header[0] == 0x52 && header[1] == 0x49 && header[2] == 0x46 && header[3] == 0x46 &&
                header[8] == 0x57 && header[9] == 0x45 && header[10] == 0x42 && header[11] == 0x50)
                return ".webp";

            return null;
        }
    }
}
