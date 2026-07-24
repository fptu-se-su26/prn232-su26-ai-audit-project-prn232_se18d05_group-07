# AI Learning Reflection - Đợt cập nhật #1

## Điều đã học

- Hiểu cách tổ chức một chức năng chat theo Clean Architecture: domain entity, application service, infrastructure repository và API controller.
- Hiểu SignalR Hub, `IHubContext`, cơ chế map user id từ JWT và client tự reconnect.
- Nhận thấy realtime không chỉ là đẩy message; cần cập nhật conversation list, unread count và trạng thái đã đọc để trải nghiệm đầy đủ.

## Cách kiểm chứng kết quả AI

- Build riêng từng project backend và build frontend bằng Vite.
- Chạy migration database và kiểm tra dữ liệu conversation qua API.
- Dùng hai tài khoản khác vai trò để kiểm tra quyền tạo, xem và trả lời tin nhắn.

## Cải tiến cá nhân

Khi dùng AI cho thay đổi xuyên tầng, cần rà soát luồng dữ liệu từ database đến UI và kiểm tra lại JWT, DI, migration cùng cơ chế realtime trước khi kết luận chức năng hoàn thành.
