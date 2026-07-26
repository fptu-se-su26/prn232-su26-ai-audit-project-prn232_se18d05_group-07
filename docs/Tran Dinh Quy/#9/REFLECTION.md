# AI Learning Reflection - Đợt cập nhật #9

## Điều đã học

- Kiểm tra amount ở backend vẫn chưa đủ nếu API cho client quyết định amount; contract tốt hơn là không nhận trường đó.
- URL minh chứng tùy ý không chứng minh ownership, loại file, hạn dùng hoặc việc tái sử dụng.
- Kiểm tra `AnyAsync` trước khi insert không loại bỏ race condition; invariant quan trọng phải được database bảo vệ.
- Idempotency theo transaction ID cần chạy trước kiểm tra phòng đã giữ để retry hợp lệ trả lại kết quả cũ.
- Transaction `Serializable` và unique filtered index bổ trợ nhau: một lớp kiểm soát luồng, một lớp giữ invariant.

## Cách kiểm chứng

- Đọc migration sinh ra để xác nhận computed column và các unique filtered index.
- Unit test input hợp lệ, phương thức không hỗ trợ và mã giao dịch nguy hiểm.
- Chạy toàn bộ backend tests thay vì chỉ test mới.
- Build frontend production để kiểm tra TypeScript và contract API mới.

## Hạn chế

- Chưa chạy concurrency integration test trên SQL Server thật với hai tài khoản đồng thời.
- Chưa có browser E2E cho upload ảnh và xác nhận cọc.
- Các cảnh báo dependency vulnerability và bundle size cần task bảo trì riêng.

## Cam kết

Đây là bản nháp do AI hỗ trợ. Sinh viên cần tự đọc lại code, migration, kết quả test và ký xác nhận trước khi merge.

- Người xác nhận: **[SINH VIÊN TỰ KÝ]**
- Ngày xác nhận: **[SINH VIÊN TỰ ĐIỀN]**
