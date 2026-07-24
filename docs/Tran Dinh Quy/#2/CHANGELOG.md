# Changelog - Đợt cập nhật #2

## Thông tin

| Mục | Nội dung |
|---|---|
| Project | RoomHub - Quản lý phòng/nhà trọ |
| Môn học | PRN232 |
| Sinh viên | Trần Đình Quý |
| MSSV | DE180286 |
| Ngày thực hiện | 20/07/2026 |

## Hoàn thành

- Thêm `RoomViewingBooking`, `ViewingBookingStatus`, row version, indexes và migration `AddRoomViewingAndDepositWorkflow`.
- Mở rộng `Deposit` với liên kết booking, mã giao dịch, phương thức/minh chứng thanh toán và các mốc xác nhận, hoàn, giải phóng.
- Xây dựng tenant API để tạo, xem, chấp nhận lịch mới, hủy lịch, đặt cọc và xem khoản cọc.
- Xây dựng owner API để duyệt, đề xuất lại, từ chối, hoàn tất/no-show và quản lý xác nhận, hoàn hoặc forfeit cọc.
- Thêm kiểm tra listing khả dụng, thời gian, lịch trùng, ownership, state transition, mức cọc server-side và idempotency theo transaction ID.
- Thêm notification, audit log và hosted service xử lý room hold hết hạn.
- Thêm form đặt lịch tại `RoomDetail`, trang lịch xem/đặt cọc, route và menu cho tenant/owner.
- Tách thay đổi thành năm commit feature/docs theo convention `[DE180286]`.

## Kiểm chứng

- `dotnet build RoomHub.slnx --no-restore` thành công; còn cảnh báo dependency `Microsoft.OpenApi` và nullable warning có sẵn trong `RoomRepository`.
- `npm run build` thành công; Vite còn cảnh báo kích thước bundle và annotation từ dependency SignalR.
- ESLint riêng `ViewingBookings.tsx` và `viewings.ts` thành công.
- ESLint toàn frontend chưa đạt do các lỗi tồn tại sẵn ở nhiều file ngoài phạm vi feature.
- Migration đã được tạo và backend compile thành công; chưa áp dụng migration lên database trong phiên làm việc này.

