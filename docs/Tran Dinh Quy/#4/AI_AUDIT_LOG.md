# AI Audit Log - Đợt cập nhật #4

## Phạm vi AI hỗ trợ

| Hạng mục | AI hỗ trợ | Kiểm chứng đã thực hiện |
|---|---|---|
| Phân tích đặc tả | Đọc mục “#3. Admin quản lý user”, rà `ApplicationUser`, luồng đăng nhập/JWT, `AuditLog`, `Notification` và trang Admin Users đang dùng dữ liệu mock. | Đối chiếu API, quy tắc ban/unban, authorization, audit và UI với acceptance criteria. |
| Backend query | Tạo DTO, service và truy vấn danh sách user có search, role/status filter, sort và server-side pagination. | Backend build thành công; test xác nhận mặc định paging/sort và DTO không lộ dữ liệu Identity nhạy cảm. |
| Ban/unban | Bổ sung trường ban, migration mới, validation reason/thời hạn, chống tự ban và bảo vệ admin hoạt động cuối cùng. | Kiểm tra service dùng actor từ JWT; login và Google login từ chối tài khoản đang bị ban. |
| Token security | Thêm kiểm tra user bị ban/xóa tại JWT validation và thu hồi refresh token khi ban. | Build toàn solution và rà thứ tự authentication/authorization trong API pipeline. |
| Audit/notification | Ghi notification `UserBanned`/`UserUnbanned`; audit lưu actor, target user, before/after, reason, IP và UTC timestamp. | Kiểm tra migration có `TargetUserId` và index phục vụ audit timeline theo user. |
| Frontend | Thay dữ liệu `initial` bằng API thật; thêm debounce search, filter, sort, paging, modal ban/unban, user detail và audit timeline. | Frontend production build và ESLint riêng hai file mới đều thành công. |
| Git và tài liệu | Chia phần triển khai thành sáu commit đúng commit plan và soạn bộ tài liệu audit đợt 4. | Kiểm tra lịch sử commit, trạng thái nhánh và giữ file đặc tả đầu vào ngoài các commit. |

## Quyết định và điều chỉnh

- Dùng các trường domain `IsBanned`, `BannedAt`, `BannedUntil`, `BanReason`, `BannedByAdminId` làm nguồn sự thật thay vì trộn với Identity lockout.
- Ban có hiệu lực khi không có thời hạn hoặc `BannedUntil` còn ở tương lai; thời gian được lưu UTC.
- Access token hiện tại được chặn tại `OnTokenValidated`; refresh token của user bị xóa khi ban và security stamp được đổi.
- Không dùng `AuditLog.EntityId` kiểu số để chứa user ID dạng chuỗi; bổ sung `TargetUserId` và index `(TargetUserId, CreatedAt)`.
- Danh sách user được filter, sort và phân trang trong truy vấn database; không tải toàn bộ dữ liệu về frontend.
- API quản trị dùng `[Authorize(Roles = "Administrator")]` và trả lỗi thống nhất cho 400, 404, 409; 401/403 do authentication/authorization pipeline xử lý.
- File đặc tả `docs/FEATURE_IMPLEMENTATION_SPEC_DE180286.md` là đầu vào chưa tracked và không được đưa vào commit feature hoặc audit.

## Kết quả

Nhánh đã có luồng quản trị user đầy đủ từ database đến UI: admin có thể tìm kiếm, lọc, xem chi tiết, xem audit timeline, khóa/mở khóa có lý do và thời hạn; thao tác được bảo vệ bởi role, quy tắc chống tự ban/admin cuối cùng, notification, audit và cơ chế chặn token. Sáu commit feature đã được tạo đúng thứ tự commit plan.
