# AI Audit Log - Đợt cập nhật #3

## Phạm vi AI hỗ trợ

| Hạng mục | AI hỗ trợ | Kiểm chứng đã thực hiện |
|---|---|---|
| Phân tích đặc tả | Đọc mục “#2. Favorites thật”, rà entity `FavoriteRoom`, composite key và các màn hình đang dùng dữ liệu mock. | Xác nhận bảng `FavoriteRooms` đã có từ migration đầu nên không tạo migration mới. |
| Backend | Tạo DTO, repository, service, DI và controller tenant; lấy user ID từ JWT và giới hạn role Tenant. | Build toàn bộ solution và đối chiếu đủ năm endpoint với đặc tả. |
| Idempotency và ownership | Thiết kế add/remove idempotent theo khóa `(UserId, RoomId)`; mọi truy vấn và xóa đều lọc bằng user hiện tại. | Thêm unit test cho add hai lần, listing không hợp lệ, xóa đúng tenant và authorization. |
| Frontend | Nối nút tim tại Browse/RoomDetail với API thật; thay trang Favorites mock bằng loading, empty, error/retry và pagination. | Chạy production build frontend thành công và kiểm tra optimistic rollback trong mã nguồn. |
| Git và tài liệu | Chia thay đổi thành năm commit đúng commit plan và soạn bộ tài liệu audit đợt 3. | Kiểm tra lịch sử commit, trạng thái nhánh và giữ file đặc tả đầu vào ngoài commit. |

## Quyết định và điều chỉnh

- Tái sử dụng entity và composite primary key `FavoriteRooms` có sẵn; không tạo unique constraint hoặc migration thừa.
- Chỉ cho phép favorite room tồn tại, chưa deleted và có listing; listing bị hidden/unpublished vẫn được giữ trong Favorites với badge “Không còn hiển thị”.
- Repository tải trước room photo, floor và building để tránh N+1 khi dựng danh sách.
- Add và delete đều trả thành công khi trạng thái mong muốn đã tồn tại; add đồng thời được xử lý dựa trên composite key và bắt xung đột lưu dữ liệu.
- Browse và RoomDetail cập nhật icon theo hướng optimistic, đồng thời rollback khi API thất bại; guest được yêu cầu đăng nhập.

## Kết quả

Chức năng Favorites đã được lưu bền vững theo tenant, có API phân quyền, danh sách phân trang, trạng thái icon đồng bộ sau reload, xử lý listing bị ẩn và bốn test tự động cho các trường hợp bảo mật/idempotency chính.
