# Prompt Log - Đợt cập nhật #11

## Công cụ AI

- Codex (GPT-5)

## Prompt chính

> Tiếp tục FIX-05 — Tách favorites khỏi dữ liệu phòng mock.

## Hỗ trợ đã áp dụng

- Audit `Browse.tsx`, `RoomDetail.tsx`, favorites API/service/repository và database initializer.
- Loại mock khỏi runtime public listing.
- Đồng bộ favorite eligibility với điều kiện public listing.
- Bổ sung error state và optimistic rollback.
- Tạo test rollback bằng Node built-in test runner, không thêm dependency.
- Kiểm tra pagination và Development-only demo seeding.

## Ràng buộc

- Public listing API là nguồn dữ liệu duy nhất.
- Không favorite ID không tồn tại trong API.
- Không seed demo ngoài Development.
- Không thay đổi migration schema; giữ nguyên cơ chế áp dụng pending migration và không commit hai file kế hoạch untracked.
