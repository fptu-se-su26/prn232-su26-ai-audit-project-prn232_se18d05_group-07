# AI Audit Log - Đợt cập nhật #1

## Phạm vi AI hỗ trợ

| Hạng mục | AI hỗ trợ | Kiểm chứng của sinh viên |
|---|---|---|
| Thiết kế chat | Đề xuất cấu trúc entity, DTO, repository và service theo Clean Architecture. | Rà soát quan hệ Conversation/ChatMessage và build backend. |
| API và phân quyền | Hỗ trợ endpoint tạo conversation, gửi/lấy tin và kiểm tra người tham gia. | Kiểm thử API bằng JWT của chủ nhà/khách thuê. |
| SignalR | Hỗ trợ Hub, notifier và kết nối client có tự reconnect. | Build API/frontend; kiểm tra endpoint Hub yêu cầu xác thực. |
| Giao diện | Hỗ trợ trang chat, badge tin chưa đọc và popup thông báo. | Build Vite và kiểm tra luồng điều hướng owner/tenant. |

## Quyết định và điều chỉnh

- Tenant được khởi tạo conversation từ bài đăng; backend lấy tenant id từ JWT thay vì tin dữ liệu client gửi lên.
- Tin nhắn được push qua SignalR đến người nhận; danh sách conversation cập nhật bằng sự kiện `conversationUpdated`.
- Badge unread được tính theo người nhận và được xóa sau khi mở cuộc trò chuyện.

## Kết quả

Chức năng chat đã có lưu trữ database, phân quyền, giao diện hai vai trò và cập nhật realtime qua SignalR.
