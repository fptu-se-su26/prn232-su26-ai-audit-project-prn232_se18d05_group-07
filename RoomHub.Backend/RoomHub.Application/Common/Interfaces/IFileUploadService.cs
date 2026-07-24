using System.IO;
using System.Threading.Tasks;

namespace Application.Common.Interfaces
{
    public interface IFileUploadService
    {
        /// <summary>
        /// Uploads an image to Cloudinary if configured, otherwise saves it locally under
        /// wwwroot/uploads and returns an absolute URL. Validates size and actual image content
        /// (magic bytes), not just the caller-supplied file name/extension.
        /// </summary>
        Task<string> UploadImageAsync(Stream fileStream, string originalFileName, string folder, string localBaseUrl);
    }
}
