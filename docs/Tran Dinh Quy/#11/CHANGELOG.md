# Changelog - Đợt cập nhật #11

## FIX-05 — Tách favorites khỏi dữ liệu phòng mock

- Browse chỉ hiển thị listing và pagination do public API trả về.
- Loại mock fallback khỏi room detail và similar rooms.
- Gallery chi tiết chỉ sử dụng ảnh listing do API trả về.
- Public search/detail loại listing bị owner ẩn và chưa được moderation approved.
- Detail ID không hợp lệ hiển thị trạng thái không tìm thấy.
- Favorite chỉ xử lý room đang xuất hiện trong kết quả API.
- Hiển thị lỗi và rollback trạng thái optimistic khi favorite request thất bại.
- Backend chỉ cho lưu listing không bị xóa/ẩn, đã publish và moderation approved.
- Demo database seed chỉ chạy trong Development.
- Giữ nguyên startup migration ở mọi environment, tránh làm gián đoạn cập nhật schema khi giới hạn demo seed.
- Thêm test pagination backend và optimistic rollback frontend.

## Kiểm chứng

- Backend regression tests: 53/53.
- Frontend optimistic rollback tests: 2/2.
- Frontend production build: thành công.
- `git diff --check`: thành công.
- Full targeted lint của Browse/RoomDetail còn các lỗi React/`any` có sẵn ngoài phạm vi; helper favorite mới không phát sinh lỗi.
