# AI Learning Reflection - Đợt cập nhật #3

## Điều đã học

- Composite primary key `(UserId, RoomId)` vừa biểu diễn đúng quan hệ favorite vừa là lớp bảo vệ cuối chống duplicate.
- Idempotency không chỉ là kiểm tra `AnyAsync` trước khi insert; vẫn cần cân nhắc race condition khi hai request add chạy đồng thời.
- Ownership nên được đưa vào khóa/truy vấn repository thay vì tải record theo room rồi tin dữ liệu phía client.
- Favorites và public listing có policy khác nhau: listing ẩn không được mở public detail nhưng vẫn cần xuất hiện trong danh sách đã lưu để người dùng hiểu trạng thái.
- Optimistic UI cần lưu trạng thái trước đó và rollback rõ ràng nếu request add/delete thất bại.

## Cách kiểm chứng kết quả AI

- Đọc lại controller để xác nhận role Tenant và user ID lấy từ `ClaimTypes.NameIdentifier`.
- Kiểm tra repository dùng `UserId` cho list, status, add và remove, đồng thời eager-load ảnh cùng building.
- Chạy production build cho backend/frontend.
- Tạo và chạy bốn test tự động cho add lặp, room không hợp lệ, ownership khi xóa và attribute authorization.
- Kiểm tra lịch sử Git có đúng năm commit theo kế hoạch và file đặc tả không bị commit nhầm.

## Hạn chế và bước tiếp theo

- Chưa chạy integration test với SQL Server thật hoặc kiểm thử API end-to-end bằng token của Tenant/Owner/Admin.
- Browse hiện vẫn ghép dữ liệu mock với dữ liệu database; nút favorite của room mock được vô hiệu hóa vì không có ID hợp lệ trong database. Nên loại bỏ hoàn toàn dữ liệu mock ở một task riêng.
- ESLint toàn frontend còn nhiều lỗi có sẵn và bundle production còn cảnh báo kích thước lớn.
- Dependency `Microsoft.OpenApi 2.4.1` đang có cảnh báo bảo mật mức cao, cần nâng cấp và kiểm tra tương thích trong task bảo trì riêng.

## Cải tiến cá nhân

Với feature tưởng như đơn giản, cần kiểm tra đồng thời persistence, authorization, idempotency, policy hiển thị và trải nghiệm lỗi. Việc thêm test repository/service contract ngay trong commit plan giúp biến acceptance criteria thành bằng chứng có thể chạy lại thay vì chỉ kiểm tra thủ công.
