# AI Audit Log - Đợt cập nhật #9

## Thông tin

| Mục | Nội dung |
|---|---|
| Sinh viên | Trần Đình Quý |
| MSSV | DE180286 |
| Nhánh | `bugfix/de180286-secure-viewing-deposit` |
| Công cụ AI | Codex (GPT-5) |
| Ngày thực hiện | 26/07/2026 |

## Phạm vi AI hỗ trợ

| Hạng mục | Hỗ trợ | Kiểm chứng |
|---|---|---|
| Audit workflow | Theo dấu DTO, API, service, entity, cấu hình EF và giao diện đặt cọc. | Xác định client có thể nhập số tiền và URL minh chứng tùy ý, đồng thời tồn tại race condition giữ phòng. |
| Bảo vệ dữ liệu | Thiết kế proof token thuộc tenant, hết hạn sau 24 giờ và chỉ dùng một lần. | Backend kiểm tra tenant, hạn dùng và `DepositId`; database có unique index. |
| Chống cạnh tranh | Dùng transaction `Serializable` và computed unique key cho khoản cọc Holding/Active theo phòng. | Migration sinh đúng unique filtered index; `DbUpdateException` được chuyển thành HTTP 409 nghiệp vụ. |
| Frontend | Thay prompt bằng modal upload ảnh và hiển thị số tiền do server cung cấp. | TypeScript/Vite production build thành công. |
| Testing | Viết test chuẩn hóa phương thức và mã giao dịch, chạy regression suite. | 41/41 backend tests thành công. |

## Quyết định

- Số tiền cọc luôn lấy từ `Room.BasePrice`; API không còn nhận amount từ client.
- Chuyển khoản bắt buộc có mã giao dịch hợp lệ và ảnh minh chứng.
- Chỉ ảnh đã upload qua endpoint có xác thực mới được liên kết với khoản cọc.
- Minh chứng có thời hạn 24 giờ, thuộc đúng tenant và chỉ liên kết một khoản cọc.
- Database là lớp bảo vệ cuối cùng cho trường hợp hai request đồng thời.

## Kết quả

Workflow đặt cọc không còn tin dữ liệu tiền hoặc URL từ trình duyệt, ngăn tái sử dụng minh chứng/mã giao dịch và ngăn nhiều khoản cọc hoạt động trên cùng một phòng. Backend build, 41 test và frontend production build đều thành công.
