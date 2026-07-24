# Changelog - Đợt cập nhật #1

## Thông tin

| Mục | Nội dung |
|---|---|
| Project | RoomHub - Quản lý phòng/nhà trọ |
| Môn học | PRN232 |
| Sinh viên | Trần Đình Quý |
| Ngày thực hiện | 12/07/2026 |

## Hoàn thành

- Xây dựng chat 1-1 giữa khách thuê và chủ nhà: conversation, message, repository, service, REST API và EF Core migration.
- Kết nối khởi tạo chat từ bài đăng công khai và trang phòng đang thuê.
- Thêm SignalR Hub, JWT cho WebSocket và phát sự kiện tin nhắn thời gian thực.
- Thêm trang Tin nhắn cho cả khách thuê/chủ nhà, badge tin chưa đọc và popup thông báo cho chủ nhà.
- Tạo bài đăng test `TEST-CHAT-01` để kiểm tra luồng khách thuê liên hệ chủ nhà.

## Kiểm chứng

- `npm run build` thành công.
- `dotnet build` cho Application, Infrastructure và API thành công.
- Migration chat đã được áp dụng; API trả về conversation và unread count đúng theo tài khoản chủ nhà/khách thuê.
