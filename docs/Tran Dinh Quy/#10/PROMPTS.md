# Prompt Log - Đợt cập nhật #10

## Công cụ AI

- Codex (GPT-5)

## Prompt chính

> Tiếp tục FIX-04 — Hoàn thiện validation, authorization response và trạng thái đọc của chat.

## Hỗ trợ đã áp dụng

- Audit controller, service, repository, entity/configuration, SignalR notifier và frontend.
- Tách 400/403/404 bằng exception nghiệp vụ và global middleware.
- Xác minh owner qua room/listing/hợp đồng thay vì tin `ownerId` từ client.
- Thiết kế idempotency key ở client, service và database.
- Đồng bộ read receipt trong database, DTO và event realtime.
- Viết tests và rà migration để tránh cắt dữ liệu chat legacy.

## Ràng buộc

- Actor luôn lấy từ JWT.
- SignalR receipt không broadcast cho user ngoài conversation.
- Không sửa migration đã merge.
- Không commit hai file kế hoạch đang untracked.
