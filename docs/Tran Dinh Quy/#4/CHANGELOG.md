# Changelog - Đợt cập nhật #4

## Thông tin

| Mục | Nội dung |
|---|---|
| Project | RoomHub - Quản lý phòng/nhà trọ |
| Môn học | PRN232 |
| Sinh viên | Trần Đình Quý |
| MSSV | DE180286 |
| Nhánh | `feature/de180286-admin-user-management` |
| Ngày thực hiện | 20–21/07/2026 |

## Hoàn thành

- Mở rộng `ApplicationUser` với `BannedAt`, `BannedUntil`, `BanReason` và `BannedByAdminId`.
- Bổ sung `AuditLog.TargetUserId` và index theo target user/thời gian để phục vụ audit timeline.
- Tạo migration mới `AddAdminUserManagement`; không sửa migration cũ.
- Thêm DTO và service cho danh sách/chi tiết user, search, role/status filter, sort và server-side pagination.
- Thêm API:
  - `GET /api/admin/users`.
  - `GET /api/admin/users/{id}`.
  - `PUT /api/admin/users/{id}/ban`.
  - `PUT /api/admin/users/{id}/unban`.
  - `GET /api/admin/users/{id}/audit-logs`.
- Giới hạn controller bằng role `Administrator` và lấy admin ID từ JWT claim.
- Bắt buộc reason 10–500 ký tự, kiểm tra thời hạn tương lai, chống tự ban và chống ban admin hoạt động cuối cùng.
- Khi ban: cập nhật security stamp, thu hồi refresh token, chặn login mới và từ chối access token hiện tại tại JWT validation.
- Tạo notification `UserBanned`/`UserUnbanned` và audit JSON gồm before/after/reason, actor, target user, IP và UTC timestamp.
- Thay danh sách user mock ở frontend bằng API thật; thêm debounce search, filter role/status, sort, paging và trạng thái loading/empty/error.
- Thêm modal ban/unban với reason và thời hạn tùy chọn; thêm panel user detail và audit timeline.
- Hiển thị rõ lỗi 401, 403 và 409 trên giao diện.
- Thêm test cho authorization, query defaults, reason validation và việc DTO không lộ Identity secrets.

## Commit feature

1. `82f0916 [DE180286] feat: add admin user query DTOs and service`
2. `7b9d6b5 [DE180286] feat: add ban and unban user workflow`
3. `b069d00 [DE180286] feat: add admin user management APIs`
4. `11c9542 [DE180286] feat: connect admin users page to backend`
5. `55706fc [DE180286] feat: add user ban notifications and audit logs`
6. `eda5a74 [DE180286] test: cover admin user filters and authorization`

## Kiểm chứng

- Backend build: thành công, 0 lỗi.
- Backend tests: 10/10 thành công.
- Frontend production build: thành công.
- ESLint riêng hai file frontend mới: thành công.
- Full-repo ESLint ghi nhận 204 lỗi/cảnh báo có sẵn ở nhiều file ngoài phạm vi.
- Còn cảnh báo bảo mật có sẵn cho `Microsoft.OpenApi 2.4.1`, nullable warning trong `RoomRepository` và cảnh báo bundle frontend lớn.
