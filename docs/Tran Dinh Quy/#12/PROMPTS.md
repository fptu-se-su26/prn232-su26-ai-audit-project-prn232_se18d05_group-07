# Prompt Log - Đợt cập nhật #12

## Công cụ AI

- Codex (GPT-5)

## Mục tiêu ban đầu

> Nâng cấp phần nhắn tin với chủ nhà, ưu tiên giao diện gần gũi và đẹp hơn; tích hợp gọi điện, gọi video, gửi file và hình ảnh.

## Yêu cầu bổ sung trong quá trình thực hiện

1. Tạo nhánh `feature/de180286-upgrade-landlord-messaging`.
2. Sửa scroll danh sách tin nhắn.
3. Nâng giới hạn tệp để hỗ trợ ảnh dung lượng lớn.
4. Chẩn đoán upload thất bại và sửa multipart request.
5. Sửa badge/thông báo tin nhắn realtime của tenant.
6. Thêm tìm kiếm tin nhắn và lịch sử ảnh/tệp.
7. Chuẩn hóa múi giờ tin nhắn.
8. Tích hợp đặt lịch xem phòng vào chat.
9. Hiển thị tin đặt lịch dạng card chuẩn.
10. Bổ sung nút duyệt và chuẩn hóa enum trạng thái lịch.
11. Thay `alert/prompt` bằng modal.
12. Chặn mỗi tenant đặt nhiều lịch cho cùng phòng.
13. Đồng bộ trạng thái lịch vào card trong chat.
14. Tối ưu UI “Lịch xem & đặt cọc”.
15. Mở đúng hội thoại khi nhấn “Nhắn tin với chủ nhà”.

## Ràng buộc đã áp dụng

- Không tin cậy `ownerId`, `conversationId` hoặc attachment metadata từ UI mà không kiểm tra quyền.
- Không cho tệp vượt giới hạn 25 MB.
- Không relay WebRTC signaling ra ngoài thành viên hội thoại.
- Không dùng badge giả hoặc trạng thái lịch hard-code.
- Không dùng `alert/prompt` cho workflow nghiệp vụ.
- Không chỉ chặn lịch trùng ở frontend.
- Không làm mất các thay đổi chưa commit có trước trong worktree.
- Không commit các file ngoài phạm vi tính năng.

## Hoạt động kiểm chứng do AI thực hiện

- Đọc kiến trúc Chat/SignalR/API/EF Core hiện hữu.
- Chạy TypeScript project build nhiều lần sau từng nhóm thay đổi.
- Chạy backend Release build để tránh tiến trình Debug khóa DLL.
- Chạy 71 backend regression tests.
- Rà nội dung migrations trước khi giữ lại.
- Kiểm tra process/cổng API khi upload không kết nối được.
- So sánh timestamp có/không có `Z` để xác định lỗi UTC.
- Rà `git diff` để tách thay đổi #12 khỏi các chỉnh sửa tồn tại trước.
