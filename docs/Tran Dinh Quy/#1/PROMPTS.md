# Prompt Log - Đợt cập nhật #1

## Công cụ AI

- Codex (GPT-5)

## Prompt chính

| STT | Mục đích | Prompt tóm tắt | Kết quả áp dụng |
|---:|---|---|---|
| 1 | Xây dựng chat | Phát triển chat giữa khách thuê và chủ nhà, tạo API và giao diện. | Tạo entity, DTO, repository, service, controller và trang chat. |
| 2 | Realtime | Cập nhật chat sử dụng SignalR. | Thêm Hub, notifier, JWT query token và SignalR client. |
| 3 | Kiểm thử | Tạo bài đăng để kiểm thử nhắn tin. | Tạo bài `TEST-CHAT-01`, xác nhận API trả owner và conversation. |
| 4 | UX chủ nhà | Thêm nơi xem/trả lời và thông báo tin nhắn. | Thêm menu Tin nhắn, unread badge và popup realtime. |

## Kiểm tra sau khi áp dụng

- Đối chiếu quyền truy cập conversation theo `OwnerId` và `TenantId`.
- Build frontend/backend và kiểm tra migration database.
- Kiểm thử API bằng hai tài khoản chủ nhà và khách thuê.
