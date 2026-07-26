# AI Audit Log - Đợt cập nhật #10

## Thông tin

| Mục | Nội dung |
|---|---|
| Sinh viên | Trần Đình Quý |
| MSSV | DE180286 |
| Nhánh | `bugfix/de180286-harden-realtime-chat` |
| Công cụ AI | Codex (GPT-5) |
| Ngày thực hiện | 26/07/2026 |

## Phạm vi AI hỗ trợ

| Hạng mục | Hỗ trợ | Kiểm chứng |
|---|---|---|
| Validation | Rà DTO/service và bổ sung normalize whitespace, giới hạn 2000 ký tự, UUID request. | Unit tests cho rỗng, normalize và retry. |
| Authorization | Phân loại not found/forbidden/validation và kiểm tra owner theo room/listing/hợp đồng. | Test exception và HTTP mapping 404/403/400. |
| Idempotency | Thiết kế `ClientMessageId` cùng unique filtered index theo sender. | Retry trả cùng message, chỉ lưu và notify create một lần. |
| Read receipt | Đánh dấu đọc trước khi query DTO và gửi SignalR event tới đúng hai participant. | Test response `IsRead` và event chứa message IDs. |
| Frontend | Đồng bộ room context, UUID retry và trạng thái Đã gửi/Đã xem. | TypeScript/Vite build và targeted chat lint. |
| Migration | Kiểm tra cảnh báo data loss và giữ nguyên kiểu `MessageText` legacy. | Migration cuối chỉ thêm nullable ID và index, không cắt nội dung cũ. |

## Kết quả

FIX-04 chặn tenant tạo hội thoại với owner tùy ý, trả đúng mã lỗi, chuẩn hóa tin nhắn, chống gửi trùng và đồng bộ trạng thái đọc giữa database, API response và SignalR.
