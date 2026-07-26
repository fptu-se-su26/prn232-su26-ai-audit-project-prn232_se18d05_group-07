# AI Learning Reflection - Đợt cập nhật #10

## Điều đã học

- `[Authorize]` không thay thế kiểm tra participant của từng conversation.
- Trả mọi exception thành 400 che giấu khác biệt giữa dữ liệu không tồn tại, không có quyền và input sai.
- Nếu query message trước khi cập nhật read state, DTO có thể trả dữ liệu cũ dù database đã thay đổi.
- Idempotency cần unique constraint; chỉ tìm trước khi insert vẫn có race condition.
- Read receipt chứa dữ liệu riêng tư nên chỉ gửi tới participant, không broadcast toàn hub.
- Giới hạn dữ liệu mới ở service không nhất thiết phải thu hẹp cột legacy và gây nguy cơ mất dữ liệu.

## Cách kiểm chứng

- Test validation, participant ownership, owner-room eligibility, retry và read notification.
- Test middleware mapping 400/403/404.
- Chạy toàn bộ backend tests và frontend build.
- Targeted lint file chat mới sửa.
- Đọc migration sinh ra và xác nhận không alter/cắt `MessageText`.

## Hạn chế

- Chưa chạy browser E2E với hai tài khoản và hai kết nối SignalR thật.
- Delivery của SignalR vẫn phụ thuộc kết nối; API/database là nguồn dữ liệu chuẩn khi reconnect.
- Full frontend lint còn technical debt có sẵn ngoài phạm vi FIX-04.

## Cam kết

Đây là bản nháp do AI hỗ trợ. Sinh viên cần tự đọc lại code, migration, kết quả test và ký xác nhận trước khi merge.

- Người xác nhận: **[SINH VIÊN TỰ KÝ]**
- Ngày xác nhận: **[SINH VIÊN TỰ ĐIỀN]**
