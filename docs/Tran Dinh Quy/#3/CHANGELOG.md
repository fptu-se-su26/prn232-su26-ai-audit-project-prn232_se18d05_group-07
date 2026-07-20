# Changelog - Đợt cập nhật #3

## Thông tin

| Mục | Nội dung |
|---|---|
| Project | RoomHub - Quản lý phòng/nhà trọ |
| Môn học | PRN232 |
| Sinh viên | Trần Đình Quý |
| MSSV | DE180286 |
| Nhánh | `feature/de180286-persistent-room-favorites` |
| Ngày thực hiện | 20/07/2026 |

## Hoàn thành

- Thêm DTO, repository và service cho favorite room; đăng ký dependency injection.
- Thêm năm endpoint `/api/tenant/favorites` với JWT actor và `[Authorize(Roles = "Tenant")]`.
- Đảm bảo add/remove idempotent và không cho tenant xóa favorite của tenant khác.
- Chỉ cho lưu room tồn tại, chưa deleted và có listing.
- Query Favorites tải ảnh, tòa nhà/địa chỉ, giá và trạng thái trong cùng luồng truy vấn, có server-side pagination.
- Nối favorite actions tại Browse và Room Detail với optimistic UI cùng rollback khi lỗi.
- Thay dữ liệu mock trong trang tenant Favorites bằng API thật; thêm skeleton, empty state, error/retry và pagination.
- Hiển thị listing hidden/unpublished với badge “Không còn hiển thị” và vô hiệu hóa CTA chi tiết.
- Thêm project test và bốn test cho authorization, idempotency, listing không hợp lệ và ownership khi xóa.
- Tách phần triển khai thành đúng năm commit theo commit plan của đặc tả.

## Kiểm chứng

- `dotnet build RoomHub.slnx --no-restore`: thành công trước khi thêm test project.
- `dotnet test RoomHub.slnx --no-restore`: 4/4 test thành công sau khi thêm test project.
- `npm run build`: thành công.
- `git diff --check`: thành công trước khi commit feature.
- ESLint toàn frontend chưa đạt do technical debt có sẵn; lần chạy ghi nhận 206 vấn đề trên repository. Các file Browse/RoomDetail cũng có một số rule violation tồn tại từ cấu trúc cũ, ngoài các lỗi biểu thức ternary mới đã được sửa.
- Còn cảnh báo vulnerability của `Microsoft.OpenApi 2.4.1` và nullable warning có sẵn trong `RoomRepository`.
