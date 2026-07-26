# Prompt Log - Đợt cập nhật #9

## Công cụ AI

- Codex (GPT-5)

## Prompt chính

> Tiếp tục với FIX-03 — Bảo vệ workflow đặt cọc và minh chứng thanh toán.

## Cách áp dụng

- Audit toàn chuỗi UI → API DTO → service → EF configuration → database.
- Không tin số tiền hoặc URL minh chứng do client gửi.
- Thiết kế upload token thuộc tenant, có hạn và chỉ dùng một lần.
- Chống double deposit bằng transaction và database invariant.
- Thêm migration, unit test và chạy regression build/test.

## Kết quả kiểm tra

- Backend build thành công.
- Backend tests: 41/41.
- Frontend production build thành công.
- Hai file kế hoạch `DE180286_IMPLEMENTATION_SCOPE.md` và `FUNCTION_GAP_AND_AI_BACKLOG.md` tiếp tục để untracked, không thuộc thay đổi FIX-03.
