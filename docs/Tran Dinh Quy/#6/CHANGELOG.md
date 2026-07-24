# Changelog - Đợt cập nhật #6

## Thông tin

| Mục | Nội dung |
|---|---|
| Project | RoomHub - Quản lý phòng/nhà trọ |
| Môn học | PRN232 |
| Sinh viên | Trần Đình Quý |
| MSSV | DE180286 |
| Nhánh | `feature/de180286-verified-tenant-review-moderation` |
| Ngày thực hiện | 22/07/2026 |

## Hoàn thành

- Mở rộng `Review` với contract evidence, moderation status, moderator/reason/timestamp, update timestamp và soft delete.
- Mở rộng `ReviewViolation` thành report record gồm review, reporter, reason code, description, status và thông tin admin xử lý.
- Thêm `ReviewModerationStatus` và `ReviewReportStatus` thay cho việc chỉ dùng boolean `IsModerated`.
- Thêm cấu hình `ReviewEligibilityDaysAfterContract`, mặc định 90 ngày.
- Tạo unique filtered index bảo đảm một review gốc cho mỗi tenant/phòng.
- Tạo migration mới `20260722163050_AddVerifiedTenantReviewModeration` và cập nhật model snapshot.
- Kiểm tra eligibility dựa trên contract thuộc đúng tenant/room, trạng thái contract và thời hạn kết thúc.
- Kiểm tra `ReviewBlockedUntil`, rating 1–5, comment tối đa 1000 ký tự và ownership khi sửa/xóa.
- Public review endpoint chỉ trả review `Visible`, chưa deleted.
- Thêm API:
  - `GET /api/tenant/reviews/eligibility/{roomId}`.
  - `POST /api/reviews/{id}/reports`.
  - `GET /api/admin/reviews/reports`.
  - `GET /api/admin/reviews/{id}`.
  - `PUT /api/admin/reviews/{id}/hide`.
  - `PUT /api/admin/reviews/{id}/remove`.
  - `PUT /api/admin/reviews/{id}/restore`.
  - `PUT /api/admin/review-reports/{id}/dismiss`.
- Admin moderation tạo notification cho tác giả/reporter và `AuditLog` cho hành động quản trị.
- Room Detail hiển thị average, count, review list và report action.
- My Reviews hiển thị moderation status/reason.
- Thêm trang `ReviewModeration.tsx`, route và menu admin để xử lý report, xem review và contract evidence.

## Commit feature

1. `9deed40 [DE180286] feat: extend review violation and moderation models`
2. `7249e41 [DE180286] feat: enforce tenant review eligibility from contracts`
3. `305d0ac [DE180286] feat: add review report and moderation APIs`
4. `bd2ac53 [DE180286] feat: show verified public room reviews`
5. `ba7dc7c [DE180286] feat: add admin review moderation screen`

## Kiểm chứng

- Backend build toàn solution: thành công.
- Backend tests hiện hữu: 14/14 thành công.
- TypeScript build: thành công.
- Vite production build bằng output tạm: thành công; output đã được dọn.
- `git diff --check`: thành công.
- `npm run build` dùng thư mục `dist` mặc định bị lỗi `EPERM` vì `dist/assets` đang bị khóa; không phải lỗi TypeScript hoặc transform source.
- Còn cảnh báo hiện hữu về `Microsoft.OpenApi 2.4.1`, nullable trong `RoomRepository` và kích thước bundle frontend.
- Chưa áp dụng migration lên database SQL Server trong phiên này.
- Chưa bổ sung test tự động chuyên biệt cho review eligibility/moderation; 14 test chạy là bộ test hiện hữu của solution.

