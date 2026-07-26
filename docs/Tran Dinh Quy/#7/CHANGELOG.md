# Changelog - Đợt cập nhật #7

## Thông tin

| Mục | Nội dung |
|---|---|
| Project | RoomHub - Quản lý phòng/nhà trọ |
| Môn học | PRN232 |
| Sinh viên | Trần Đình Quý |
| MSSV | DE180286 |
| Nhánh | `bugfix/de180286-review-moderation-bypass` |
| Ngày thực hiện | 26/07/2026 |

## Lỗi được xử lý

`ReviewService.UpdateReviewAsync` trước đây luôn chuyển review về `Visible` và xóa lý do kiểm duyệt sau khi tenant chỉnh sửa. Vì vậy tenant có thể chỉnh sửa review đã bị Administrator `Hidden` hoặc `Removed` để đưa nội dung xuất hiện công khai trở lại mà không qua xét duyệt.

## Hoàn thành

- Chặn tenant chỉnh sửa review có trạng thái `Removed`.
- Review `Hidden` sau khi tenant chỉnh sửa được chuyển sang `Pending`, không tự động trở lại `Visible`.
- Review đang `Visible` hoặc `Pending` giữ nguyên trạng thái hợp lệ sau khi chỉnh sửa.
- Khi review `Hidden` chuyển sang `Pending`:
  - Xóa thông tin moderator cũ khỏi trạng thái đang chờ.
  - Đặt lý do cho biết nội dung đã chỉnh sửa và cần duyệt lại.
  - Tạo notification `ReviewPendingModeration` cho tenant.
- Thêm entity `ReviewRevision` để lưu:
  - Rating và comment trước khi sửa.
  - Rating và comment sau khi sửa.
  - Trạng thái moderation trước và sau.
  - Người chỉnh sửa và thời điểm UTC.
- Thêm `ReviewRevisionConfiguration`, quan hệ với `Review`/`ApplicationUser` và index `(ReviewId, CreatedAt)`.
- Thêm `DbSet<ReviewRevision>` và các repository operation cho revision, audit log và notification.
- Tạo migration mới `20260726063532_AddReviewRevisionHistory`; không sửa migration cũ.
- Ghi `AuditLog` action `EditReview`, chứa dữ liệu before/after của lần chỉnh sửa.
- Thêm `ReviewModerationBypassTests` kiểm tra:
  - `Hidden` chuyển sang `Pending`.
  - `Removed` bị từ chối chỉnh sửa.
  - `Visible` và `Pending` không bị đổi trạng thái ngoài ý muốn.
  - Tenant khác không thể chỉnh sửa review không thuộc sở hữu.
  - Revision, audit, notification và `SaveChangesAsync` được gọi đúng.

## File đã thêm

- `RoomHub.Backend/RoomHub.Domain/Entities/ReviewRevision.cs`
- `RoomHub.Backend/RoomHub.Infrastructure/Persistence/Configurations/ReviewRevisionConfiguration.cs`
- `RoomHub.Backend/RoomHub.Infrastructure/Migrations/20260726063532_AddReviewRevisionHistory.cs`
- `RoomHub.Backend/RoomHub.Infrastructure/Migrations/20260726063532_AddReviewRevisionHistory.Designer.cs`
- `RoomHub.Backend/RoomHub.Application.Tests/ReviewModerationBypassTests.cs`

## File đã cập nhật

- `RoomHub.Backend/RoomHub.Domain/Entities/Review.cs`
- `RoomHub.Backend/RoomHub.Application/Common/Interfaces/IReviewRepository.cs`
- `RoomHub.Backend/RoomHub.Application/Services/ReviewService.cs`
- `RoomHub.Backend/RoomHub.Infrastructure/Persistence/ApplicationDbContext.cs`
- `RoomHub.Backend/RoomHub.Infrastructure/Persistence/Repositories/ReviewRepository.cs`
- `RoomHub.Backend/RoomHub.Infrastructure/Migrations/ApplicationDbContextModelSnapshot.cs`

## Kiểm chứng

- `dotnet build RoomHub.Backend/RoomHub.slnx --no-restore`: thành công.
- `dotnet test RoomHub.Backend/RoomHub.slnx --no-restore`: 19/19 test thành công.
- `git diff --check`: thành công.
- Migration đã scaffold nhưng chưa áp dụng lên SQL Server thật.
- Frontend không thay đổi trong nhánh này nên chưa chạy frontend build.
- Build vẫn ghi nhận cảnh báo dependency mức High và hai warning có sẵn tại `RoomRepository`/`RoomAssistantService`; các cảnh báo này ngoài phạm vi bug fix.

## Trạng thái commit

Các thay đổi code và tài liệu chưa được commit tại thời điểm soạn file này. Sau khi Issue #7 được tạo/xác nhận, commit cần dùng đúng prefix `[DE180286]`, body `Refs #7` và không thêm `Co-Authored-By`.
