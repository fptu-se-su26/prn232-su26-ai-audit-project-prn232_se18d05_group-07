# Changelog - Đợt cập nhật #10

## FIX-04 — Hoàn thiện validation, authorization response và trạng thái đọc của chat

- Tin nhắn bắt buộc có nội dung sau normalize whitespace và tối đa 2000 ký tự.
- Thêm `ClientMessageId` dạng UUID, unique theo sender để chống trùng khi retry.
- Tạo conversation bắt buộc có `roomId`.
- Chỉ cho tenant liên hệ owner sở hữu listing hợp lệ hoặc phòng có hợp đồng với tenant.
- Trả 404 khi không tồn tại conversation, 403 khi không phải participant và 400 khi validation sai.
- Đánh dấu đọc trước khi tạo response để `IsRead` nhất quán.
- Phát SignalR `messagesRead` chỉ tới owner và tenant của conversation.
- UI hiển thị `Đã gửi`/`Đã xem` và giữ UUID khi request cần retry.
- Thêm migration `HardenRealtimeChat` và automated tests chat.

## Kiểm chứng

- Backend build thành công.
- Backend regression tests thành công.
- Frontend production build thành công.
- Targeted ESLint cho `Chat.tsx` và `chats.ts` thành công.
- `git diff --check` thành công.
