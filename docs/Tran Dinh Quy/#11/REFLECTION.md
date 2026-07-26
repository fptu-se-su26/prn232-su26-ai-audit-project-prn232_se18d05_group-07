# AI Learning Reflection - Đợt cập nhật #11

## Điều đã học

- Trộn mock với API làm sai total/pagination và tạo ID không tồn tại cho các action thật.
- Dùng ảnh nội thất tĩnh trong detail vẫn là một dạng trộn dữ liệu mock dù ID và giá đã lấy từ API.
- Vô hiệu hóa nút favorite cho mock chỉ che triệu chứng; mock phải được loại khỏi toàn bộ entry point.
- Detail error không nên dùng chung loading state, nếu không request 404 sẽ hiển thị spinner vô hạn.
- Optimistic UI phải có rollback xác định và thông báo cho người dùng.
- Backend phải kiểm tra đầy đủ published/hidden/moderation, không chỉ `HasListing`.
- Demo seed chạy production có thể tạo tài khoản và dữ liệu ngoài ý muốn.
- Khi giới hạn demo seed theo environment phải tách riêng bước migration để không làm thay đổi quy trình cập nhật schema.

## Cách kiểm chứng

- Quét mọi tham chiếu mock/favorite trong browse và detail.
- Chạy backend regression tests và test pagination.
- Chạy Node tests cho optimistic add/remove rollback.
- Build frontend production.
- Rà điều kiện repository và vị trí gọi database seed.

## Hạn chế

- Chưa có browser E2E cho lỗi mạng khi bấm favorite.
- Full lint của hai page legacy còn technical debt có sẵn.
- Dữ liệu mock lịch sử vẫn được giữ dạng comment làm tham chiếu thiết kế, không được biên dịch hoặc dùng ở runtime.

## Cam kết

Đây là bản nháp do AI hỗ trợ. Sinh viên cần tự đọc lại code, kết quả test và ký xác nhận trước khi merge.

- Người xác nhận: **[SINH VIÊN TỰ KÝ]**
- Ngày xác nhận: **[SINH VIÊN TỰ ĐIỀN]**
