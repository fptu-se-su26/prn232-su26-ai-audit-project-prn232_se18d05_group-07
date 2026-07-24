using System;
using System.IO;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Application.Common.DTOs.Properties;
using Application.Common.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace RoomHub.API.Controllers
{
    [Authorize(Roles = "PropertyOwner")]
    [ApiController]
    [Route("api/owner/properties")]
    public class PropertiesController : ControllerBase
    {
        private readonly IPropertyService _propertyService;
        private readonly IFileUploadService _fileUploadService;

        public PropertiesController(IPropertyService propertyService, IFileUploadService fileUploadService)
        {
            _propertyService = propertyService;
            _fileUploadService = fileUploadService;
        }

        // ==========================================
        // 1. GET ALL PROPERTIES FOR LOGGED-IN OWNER
        // ==========================================
        [HttpGet]
        public async Task<IActionResult> GetProperties()
        {
            var ownerId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(ownerId))
                return Unauthorized(new { message = "Không xác định danh tính chủ nhà." });

            var result = await _propertyService.GetPropertiesByOwnerAsync(ownerId);
            return Ok(result);
        }

        // ==========================================
        // 2. GET SINGLE PROPERTY DETAIL WITH FLOORS/ROOMS GRID
        // ==========================================
        [HttpGet("{id}")]
        public async Task<IActionResult> GetPropertyDetail(int id)
        {
            var ownerId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(ownerId))
                return Unauthorized(new { message = "Không xác định danh tính chủ nhà." });

            var result = await _propertyService.GetPropertyDetailWithOwnerAsync(id, ownerId);
            if (result == null)
                return NotFound(new { message = "Không tìm thấy tài sản này hoặc bạn không có quyền truy cập." });

            return Ok(result);
        }

        // ==========================================
        // 3. CREATE PROPERTY & AUTO-GENERATE ROOMS GRID
        // ==========================================
        [HttpPost]
        public async Task<IActionResult> CreateProperty([FromBody] CreatePropertyRequestDto request)
        {
            var ownerId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(ownerId))
                return Unauthorized(new { message = "Không xác định danh tính chủ nhà." });

            if (string.IsNullOrWhiteSpace(request.Name))
                return BadRequest(new { message = "Tên tài sản không được để trống." });

            if (string.IsNullOrWhiteSpace(request.Address))
                return BadRequest(new { message = "Địa chỉ không được để trống." });

            try
            {
                var success = await _propertyService.CreatePropertyWithOwnerAsync(request, ownerId);
                if (success)
                {
                    return Ok(new { success = true, message = "Tạo tài sản và tự động sinh sơ đồ phòng thành công." });
                }
                return BadRequest(new { message = "Có lỗi xảy ra khi tạo tài sản." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Có lỗi xảy ra khi tạo tài sản.", details = ex.Message });
            }
        }

        // ==========================================
        // 4. UPLOAD PROPERTY THUMBNAIL IMAGE
        // ==========================================
        [HttpPost("upload")]
        public async Task<IActionResult> UploadImage(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { message = "Không nhận được tập tin hình ảnh." });

            try
            {
                using var stream = file.OpenReadStream();
                var baseUrl = $"{Request.Scheme}://{Request.Host}";
                var url = await _fileUploadService.UploadImageAsync(stream, file.FileName, "roomhub_uploads", baseUrl);
                return Ok(new { url });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Có lỗi xảy ra khi tải ảnh lên.", details = ex.Message });
            }
        }

        // ==========================================
        // 5. UPDATE PROPERTY DETAILS
        // ==========================================
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProperty(int id, [FromBody] UpdatePropertyRequestDto request)
        {
            var ownerId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(ownerId))
                return Unauthorized(new { message = "Không xác định danh tính chủ nhà." });

            if (string.IsNullOrWhiteSpace(request.Name))
                return BadRequest(new { message = "Tên tài sản không được để trống." });

            if (string.IsNullOrWhiteSpace(request.Address))
                return BadRequest(new { message = "Địa chỉ không được để trống." });

            try
            {
                var success = await _propertyService.UpdatePropertyAsync(id, request, ownerId);
                if (success)
                {
                    return Ok(new { success = true, message = "Cập nhật thông tin tài sản thành công." });
                }
                return NotFound(new { message = "Không tìm thấy tài sản này hoặc bạn không có quyền cập nhật." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Có lỗi xảy ra khi cập nhật thông tin tài sản.", details = ex.Message });
            }
        }

        // ==========================================
        // 6. DELETE PROPERTY (SMART DELETION)
        // ==========================================
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProperty(int id)
        {
            var ownerId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(ownerId))
                return Unauthorized(new { message = "Không xác định danh tính chủ nhà." });

            try
            {
                var success = await _propertyService.DeletePropertyAsync(id, ownerId);
                if (success)
                {
                    return Ok(new { success = true, message = "Xóa tài sản thành công." });
                }
                return NotFound(new { message = "Không tìm thấy tài sản này hoặc bạn không có quyền xóa." });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Có lỗi xảy ra khi xóa tài sản.", details = ex.Message });
            }
        }

        // ==========================================
        // 7. ADD ROOM TO PROPERTY
        // ==========================================
        [HttpPost("{propertyId}/rooms")]
        public async Task<IActionResult> AddRoom(int propertyId, [FromBody] AddRoomRequestDto request)
        {
            var ownerId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(ownerId))
                return Unauthorized(new { message = "Không xác định danh tính chủ nhà." });

            if (string.IsNullOrWhiteSpace(request.RoomNumber))
                return BadRequest(new { message = "Số phòng không được để trống." });

            if (request.FloorNumber <= 0)
                return BadRequest(new { message = "Tầng phải lớn hơn 0." });

            if (request.BasePrice <= 0)
                return BadRequest(new { message = "Giá thuê phòng phải lớn hơn 0." });

            if (request.SurfaceArea <= 0)
                return BadRequest(new { message = "Diện tích phòng phải lớn hơn 0." });

            try
            {
                var success = await _propertyService.AddRoomToPropertyAsync(propertyId, request, ownerId);
                if (success)
                {
                    return Ok(new { success = true, message = "Thêm phòng mới thành công." });
                }
                return NotFound(new { message = "Không tìm thấy tài sản này hoặc bạn không có quyền thao tác." });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Có lỗi xảy ra khi thêm phòng.", details = ex.Message });
            }
        }
    }
}
