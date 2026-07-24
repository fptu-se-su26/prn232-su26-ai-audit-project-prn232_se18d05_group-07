# AI Audit Log - Đợt cập nhật #2

## Phạm vi AI hỗ trợ

| Hạng mục | AI hỗ trợ | Kiểm chứng của sinh viên |
|---|---|---|
| Thiết kế workflow | Phân tích đặc tả và xây dựng state machine riêng cho lịch xem phòng, không dùng sai `BookingHistory`. | Rà soát entity, enum, quan hệ dữ liệu và migration mới. |
| API và phân quyền | Hỗ trợ API tenant/owner, lấy actor từ JWT và kiểm tra ownership, trạng thái cùng xung đột lịch. | Build toàn bộ backend và đối chiếu endpoint với đặc tả. |
| Đặt cọc và giữ phòng | Hỗ trợ vòng đời `Holding`, `Active`, `Refunded`, `Forfeited`, `Released`, xác nhận phòng và xử lý hết hạn. | Rà soát transaction ID, số tiền do server xác định, room status và hosted expiry service. |
| Giao diện | Hỗ trợ form đặt lịch tại chi tiết phòng và màn hình quản lý cho tenant/owner. | Build production frontend và lint riêng các file frontend mới. |
| Git và tài liệu | Hỗ trợ chia thay đổi thành các commit theo convention `[DE180286]` và soạn tài liệu workflow. | Kiểm tra lịch sử commit, trạng thái nhánh và loại trừ file đầu vào khỏi commit. |

## Quyết định và điều chỉnh

- Tạo entity `RoomViewingBooking` riêng với optimistic concurrency thay vì mở rộng `BookingHistory` cho dữ liệu workflow đang hoạt động.
- Backend lấy tenant/owner id từ JWT; frontend không được quyết định ownership hay số tiền cọc.
- Mức cọc mặc định bằng một tháng `BasePrice`, lịch xem phải được tạo trước ít nhất hai giờ và thời gian giữ phòng từ 1 đến 30 ngày.
- Các transition quan trọng tạo cả `AuditLog` và `Notification`; lỗi workflow dùng response thống nhất và trả 409 cho xung đột/trạng thái không hợp lệ.
- Background service xử lý khoản cọc hết hạn và không giải phóng phòng nếu đã có hợp đồng `Active` hoặc `Pending`.

## Kết quả

Chức năng lịch xem phòng và đặt cọc đã có domain model, migration, API phân quyền, audit/notification, xử lý hết hạn và giao diện quản lý cho tenant lẫn chủ nhà.

