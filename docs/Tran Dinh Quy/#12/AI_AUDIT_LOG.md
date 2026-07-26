# AI Audit Log - Đợt cập nhật #12

## Thông tin

| Mục | Nội dung |
|---|---|
| Sinh viên | Trần Đình Quý |
| MSSV | DE180286 |
| Nhánh | `feature/de180286-upgrade-landlord-messaging` |
| Công cụ AI | Codex (GPT-5) |
| Ngày thực hiện | 27/07/2026 |
| Phạm vi | Nhắn tin thời gian thực, tệp đính kèm, gọi WebRTC và lịch xem phòng |

## Phạm vi AI hỗ trợ

| Hạng mục | Nội dung triển khai | Kiểm chứng |
|---|---|---|
| Giao diện chat | Thiết kế lại danh sách hội thoại, bubble tin nhắn, responsive, trạng thái tải/lỗi, tìm kiếm hội thoại và tìm trong nội dung. | TypeScript build; kiểm tra trạng thái rỗng, tìm kiếm và cuộn nội bộ. |
| Ảnh và tệp | Upload ảnh/tài liệu tối đa 25 MB; lưu URL, tên, MIME type và dung lượng; xem trước ảnh; lịch sử tệp dùng panel riêng. | Backend Release build; migration `AddChatAttachments`; kiểm tra type frontend. |
| Thời gian thực | Giữ SignalR cho tin mới, đã đọc, badge chưa đọc và toast của tenant; bỏ badge giả hard-code. | 71/71 backend tests; rà sự kiện `messageReceived`, `conversationUpdated`, `messagesRead`. |
| Gọi thoại/video | Thêm signaling qua SignalR và WebRTC cho gọi thoại/video, nhận/từ chối/kết thúc; kiểm tra người gọi thuộc hội thoại. | Backend build và kiểm tra quyền hội thoại trong `ChatHub`. |
| Điều hướng chat | Nút “Nhắn tin với chủ nhà” lưu đúng `conversationId` trả về và mở chính xác hội thoại tương ứng. | TypeScript build; rà luồng RoomDetail → Chat. |
| Lịch xem phòng | Tạo lịch ngay trong chat; hội thoại liên kết `RoomId`; tin lịch hiển thị dạng card và trạng thái thật. | Migrations `LinkConversationToRoom`, `IndexViewingBookingTenantRoom`; test backend. |
| Ràng buộc lịch | Mỗi tenant chỉ được tạo một lịch cho cùng một phòng; backend trả `409` khi trùng. | Kiểm tra tại service, không chỉ frontend. |
| UI lịch/cọc | Chuẩn hóa enum API, thêm nút duyệt, modal thay `alert/prompt`, thống kê và card lịch responsive. | TypeScript build; backend tests không hồi quy. |
| Múi giờ | Chuẩn hóa timestamp SQL thiếu offset thành UTC trước khi hiển thị giờ Việt Nam. | Kiểm tra tin cũ/mới, lịch hẹn và lịch sử tệp. |

## Các quyết định an toàn

- Endpoint upload yêu cầu người dùng là thành viên của hội thoại.
- Tệp được giới hạn phần mở rộng và dung lượng; request multipart có khoảng đệm header.
- Signaling cuộc gọi không cho gửi tùy ý tới user ngoài hội thoại.
- Ràng buộc một lịch/người/phòng nằm ở backend.
- Các thao tác từ chối, hủy, hoàn cọc và mất cọc bắt buộc nhập lý do qua modal.
- Không commit các thay đổi deposit, navbar, lockfile và demo script đã tồn tại trước phạm vi #12.

## Kết quả

Luồng liên hệ chủ nhà đã trở thành một khu vực cộng tác đầy đủ: nhắn tin realtime, gửi tệp, gọi trực tiếp, tìm kiếm, quản lý nội dung chia sẻ và tạo/theo dõi lịch xem phòng. UI lịch xem và đặt cọc được chuẩn hóa cho cả tenant và owner, đồng thời các điều kiện nghiệp vụ quan trọng được bảo vệ tại backend.
