# AI Learning Reflection - Đợt cập nhật #12

## Điều đã học

- Một tính năng chat hoàn chỉnh không chỉ là gửi text; trạng thái đọc, badge, điều hướng đúng hội thoại, attachment và lỗi mạng đều là một phần của trải nghiệm.
- `scrollIntoView` có thể kéo cả layout cha. Với giao diện flex, `min-h-0`, `overflow-hidden` và cuộn trực tiếp container ổn định hơn.
- Timestamp SQL Server `DateTime` đọc lại có thể mất `Kind`; nếu API serialize không có offset, browser sẽ hiểu khác với DTO vừa tạo có hậu tố `Z`.
- FormData không nên dùng mặc định `application/json`; request upload cần multipart boundary đúng.
- WebRTC chỉ xử lý media peer-to-peer; vẫn cần signaling và kiểm soát quyền ở server. STUN đủ cho demo nhưng production cần TURN.
- Enum backend có thể lưu dạng string trong EF nhưng serialize ra JSON dạng số nếu API không cấu hình converter; frontend phải thống nhất hợp đồng.
- Thông tin lịch hẹn không nên chỉ nhúng vào chuỗi hiển thị. Card cần liên kết mã booking để lấy trạng thái thật.
- Điều kiện “một người một lịch cho mỗi phòng” phải nằm ở service/backend; UI chỉ hỗ trợ trải nghiệm.
- Điều hướng sang trang chat phải mang theo identity của hội thoại. Chỉ chuyển route sẽ khiến UI chọn bản ghi đầu tiên.
- `alert/prompt` nhanh cho prototype nhưng không phù hợp workflow có validation, trạng thái loading và nhiều trường dữ liệu.

## Cách kiểm chứng

- Kiểm tra build TypeScript sau từng thay đổi giao diện/hook/service.
- Build .NET bằng cấu hình Release khi API Debug khóa output.
- Chạy toàn bộ regression tests backend.
- Đọc migration scaffold để phát hiện thay đổi ngoài ý muốn.
- Theo dõi từ screenshot đến code path: RoomDetail → create conversation → Chat selection.
- Kiểm tra cả tenant và owner vì hai layout có cơ chế badge/action khác nhau.

## Hạn chế và hướng phát triển

- WebRTC hiện dùng STUN công cộng; nên cấu hình TURN server cho production.
- Chưa có browser E2E tự động cho cuộc gọi hai peer, upload multipart và điều hướng hội thoại.
- Trạng thái card lịch được polling 30 giây; có thể phát sự kiện SignalR riêng cho booking để cập nhật tức thời.
- Lịch cũ được tạo trước khi `Conversation.RoomId` tồn tại cần mở lại từ chi tiết phòng để gắn đúng phòng.
- Database hiện có thể chứa lịch trùng lịch sử từ trước ràng buộc mới; hệ thống chỉ chặn bản ghi mới.
- Attachment local storage cần cơ chế cleanup/virus scanning và object storage khi triển khai production.
- Nên thay chuỗi lịch hẹn bằng message type/structured payload chính thức trong một iteration tiếp theo.

## Cam kết

Đây là bản nháp do AI hỗ trợ. Sinh viên cần tự đọc lại code, kiểm tra migration trên database thử nghiệm, chạy test và xác nhận trước khi merge.

- Người xác nhận: **[SINH VIÊN TỰ KÝ]**
- Ngày xác nhận: **[SINH VIÊN TỰ ĐIỀN]**
