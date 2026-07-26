# Changelog - Đợt cập nhật #9

## FIX-03 — Bảo vệ workflow đặt cọc và minh chứng thanh toán

- Bỏ `Amount` và `PaymentProofUrl` khỏi request đặt cọc.
- Trả `RequiredDepositAmount` từ backend để UI chỉ hiển thị giá trị chuẩn.
- Thêm endpoint tenant upload ảnh minh chứng, giới hạn request và ảnh tối đa 5 MB.
- Thêm entity/bảng `DepositPaymentProofs` với tenant ownership, hạn 24 giờ và trạng thái đã sử dụng.
- Chuẩn hóa phương thức thanh toán và giới hạn định dạng mã giao dịch.
- Chuyển quy trình tạo cọc sang transaction `Serializable`.
- Thêm unique filtered index bảo đảm mỗi phòng chỉ có một khoản cọc `Holding`/`Active`.
- Giữ unique transaction ID và bổ sung unique proof-to-deposit.
- Thay giao diện prompt bằng modal đặt cọc có upload file, validation, loading và error.
- Thêm unit tests cho policy payment method và transaction ID.

## Kiểm chứng

- `dotnet build RoomHub.Backend/RoomHub.slnx --no-restore`: thành công.
- `dotnet test RoomHub.Backend/RoomHub.slnx --no-restore`: 41/41 thành công.
- `npm.cmd run build`: thành công.
- EF migration: `SecureDepositPaymentProof`.
- Còn cảnh báo package vulnerability và frontend bundle size đã tồn tại/không thuộc phạm vi FIX-03; không có build error.
