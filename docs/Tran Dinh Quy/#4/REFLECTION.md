# AI Learning Reflection - Đợt cập nhật #4

## Điều đã học

- Trạng thái ban tài khoản cần một nguồn sự thật nhất quán. Dùng field domain giúp lưu reason, actor và thời hạn rõ ràng hơn việc chỉ dựa vào Identity lockout.
- Chặn login mới chưa đủ vì access token đã phát vẫn còn hiệu lực. Kiểm tra trạng thái user trong JWT validation giúp policy ban có hiệu lực ngay với request tiếp theo.
- Thu hồi refresh token và đổi security stamp là lớp bảo vệ bổ sung, nhưng việc kiểm tra ban tại mỗi lần validate JWT mới trực tiếp xử lý access token hiện tại trong kiến trúc này.
- User ID của ASP.NET Identity là chuỗi, trong khi `AuditLog.EntityId` hiện là số. Thêm `TargetUserId` riêng tránh ép kiểu sai và cho phép query audit timeline hiệu quả.
- Quy tắc “không ban admin cuối cùng” phải được kiểm tra trong transaction cùng thao tác cập nhật để giảm nguy cơ race condition.
- Server-side filtering/pagination cần được giữ xuyên suốt từ query DTO, EF projection đến UI; nếu frontend tự lọc danh sách một trang thì kết quả sẽ sai.
- Audit và notification có mục đích khác nhau: notification thông báo cho user, còn audit phải lưu đủ actor, target, before/after, reason, IP và timestamp để truy vết.

## Cách kiểm chứng kết quả AI

- Đọc lại controller để xác nhận `[Authorize(Roles = "Administrator")]` và admin ID lấy từ `ClaimTypes.NameIdentifier`.
- Kiểm tra service không trả các field password/token/OTP/security stamp trong DTO.
- Đối chiếu migration và model snapshot để xác nhận chỉ tạo schema mới, không sửa migration cũ.
- Rà login thường, Google login và `OnTokenValidated` để xác nhận tài khoản đang ban không thể tiếp tục sử dụng hệ thống.
- Chạy build toàn backend, 10 test tự động, frontend production build và ESLint riêng các file frontend mới.
- Kiểm tra Git log có đủ sáu commit feature đúng commit plan và file đặc tả chưa tracked không bị stage.

## Hạn chế và bước tiếp theo

- Chưa chạy integration test với SQL Server sạch hoặc migration up/down trên database thật trong phiên này.
- Chưa thực hiện API end-to-end bằng token của hai admin và nhiều user để mô phỏng race condition khi cùng ban admin cuối cùng.
- Bộ test hiện kiểm tra authorization metadata, query defaults, validation và DTO safety; nên bổ sung integration tests cho filter projection, transaction, audit/notification và token invalidation.
- Full-repo ESLint còn technical debt lớn ngoài phạm vi; cần task riêng để xử lý thay vì trộn vào feature quản trị user.
- `Microsoft.OpenApi 2.4.1` có cảnh báo bảo mật mức cao và cần được nâng cấp, kiểm tra tương thích trong task bảo trì riêng.
- Frontend build còn cảnh báo bundle lớn; có thể tách trang quản trị bằng dynamic import/code splitting.

## Cải tiến cá nhân

Với chức năng quản trị liên quan đến bảo mật, cần biến từng acceptance criterion thành một kiểm tra có thể lặp lại: authorization, self-ban, last-admin, expired ban, active token, refresh token, audit và dữ liệu nhạy cảm. Lần tiếp theo nên chuẩn bị integration-test fixture ngay từ đầu để chứng minh các transaction và JWT policy trên database thật, thay vì chủ yếu dựa vào build, unit test và code review.
