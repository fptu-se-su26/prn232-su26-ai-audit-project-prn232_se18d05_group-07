# AI Learning Reflection - Đợt cập nhật #2

## Điều đã học

- Hiểu rằng lịch xem phòng là một state machine nghiệp vụ riêng; entity lịch sử đơn giản không đủ để quản lý ownership, transition và optimistic concurrency.
- Hiểu cách phối hợp trạng thái booking, deposit, room và contract để tránh giải phóng phòng sai hoặc xác nhận hai khoản giữ phòng đồng thời.
- Nhận thấy các giá trị quan trọng như user id và mức cọc phải được backend xác định, không thể tin dữ liệu frontend gửi lên.
- Hiểu vai trò khác nhau của notification và audit log: notification phục vụ người dùng, còn audit log lưu dấu vết nghiệp vụ.
- Học cách thiết kế job hết hạn theo hướng idempotent và kiểm tra trạng thái cuối trước khi thay đổi dữ liệu.

## Cách kiểm chứng kết quả AI

- Đọc lại state transition và ownership trong workflow service, controller và DTO.
- Tạo migration từ EF model rồi kiểm tra các cột, foreign key, index, check constraint và unique transaction ID.
- Build toàn bộ solution backend và frontend production.
- Chạy ESLint riêng trên các file frontend mới, đồng thời phân biệt lỗi mới với technical debt có sẵn của repository.
- Kiểm tra năm commit feature/docs đều dùng prefix `[DE180286]` và không chứa file sinh tự động ngoài phạm vi cần thiết.

## Hạn chế và bước tiếp theo

- Chưa áp dụng migration lên database sạch và chưa kiểm thử API end-to-end bằng hai tenant, hai owner như checklist đặc tả.
- Repository chưa có test project phù hợp cho workflow mới; cần bổ sung integration tests cho lịch trùng, owner khác, xác nhận cọc và expiry idempotent.
- UI hiện dùng dialog trình duyệt cho một số owner/deposit actions; có thể cải thiện bằng modal có validation và countdown cập nhật theo thời gian thực.
- Cần xử lý các cảnh báo dependency và technical debt ESLint toàn frontend trong task riêng để không trộn phạm vi feature.

## Cải tiến cá nhân

Khi dùng AI cho workflow nhiều trạng thái, cần xác minh không chỉ happy path mà cả ownership, transition sai, concurrency, idempotency và tác động chéo giữa các aggregate. Việc ghi rõ những kiểm thử chưa thực hiện giúp audit trung thực và xác định chính xác công việc còn lại.
