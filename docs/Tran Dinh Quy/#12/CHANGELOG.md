# Changelog - Đợt cập nhật #12

## FEAT-12 — Nâng cấp nhắn tin với chủ nhà

### Chat và realtime

- Thiết kế lại trang Chat theo màu nhận diện RoomHub và tối ưu responsive.
- Sửa vùng scroll để header/composer cố định và chỉ danh sách tin nhắn cuộn.
- Thêm tìm kiếm hội thoại và tìm kiếm theo nội dung/tên tệp trong hội thoại.
- Hiển thị trạng thái đã gửi/đã xem và chuẩn hóa giờ UTC sang giờ địa phương.
- Sửa điều hướng từ chi tiết phòng để mở đúng hội thoại của chủ nhà vừa chọn.
- Thêm hook số tin nhắn chưa đọc cho tenant, SignalR realtime và toast tin mới.
- Loại bỏ badge tin nhắn tenant hard-code.

### Ảnh và tệp đính kèm

- Hỗ trợ JPG/JPEG, PNG, GIF, WEBP, PDF, Word, Excel, TXT và ZIP.
- Giới hạn tệp thực tế 25 MB; giới hạn multipart 26 MB.
- Lưu metadata tệp trong `ChatMessages`.
- Hiển thị preview ảnh, thẻ tài liệu, dung lượng và link mở/tải.
- Thêm panel “Ảnh & tệp đã gửi”, sắp xếp mới nhất trước.

### Gọi thoại và video

- Thêm WebRTC audio/video call.
- Thêm SignalR signaling cho offer, answer, ICE, reject và end.
- Kiểm tra quyền thành viên hội thoại trước khi relay tín hiệu.
- Thêm màn nhận cuộc gọi, từ chối, kết thúc và preview video cục bộ.

### Lịch xem phòng trong chat

- Liên kết hội thoại với `RoomId`.
- Tenant tạo lịch xem trực tiếp từ chat với ngày giờ, thời lượng và ghi chú.
- Sau khi tạo, gửi card lịch có mã lịch hẹn vào hội thoại.
- Card hiển thị trạng thái thật: chờ duyệt, đã duyệt, giờ mới, từ chối, hủy, hoàn thành, không đến.
- Card tự làm mới trạng thái khi mở chat, focus cửa sổ và theo chu kỳ 30 giây.
- Backend chặn tenant đặt lịch lần thứ hai cho cùng phòng.

### UI lịch xem và đặt cọc

- Sửa mapping enum số/chuỗi để badge và nút duyệt hiển thị đúng.
- Thêm modal đổi giờ, từ chối, hủy lịch, hoàn cọc và mất cọc.
- Loại bỏ toàn bộ `alert/prompt` khỏi trang quản lý lịch.
- Thêm thông báo thành công/thất bại trong trang.
- Thêm thống kê tổng, chờ duyệt, đã duyệt và hoàn thành.
- Thiết kế lại card lịch với ngày/giờ nổi bật, trạng thái màu, ghi chú và hành động responsive.

## Database migrations

- `AddChatAttachments`
- `LinkConversationToRoom`
- `IndexViewingBookingTenantRoom`

## Kiểm chứng

- Frontend TypeScript: thành công.
- Backend Release build: thành công.
- Backend regression tests: 71/71.
- Migration mới đã được rà để chỉ chứa attachment fields, conversation room link và booking lookup index.
- Vite bundle từng biên dịch source thành công; một lần đóng gói bị chặn khi tiến trình khác giữ thư mục `dist`.
