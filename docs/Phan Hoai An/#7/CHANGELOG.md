# Changelog - Đợt cập nhật #7

## 1. Quy định ghi Changelog

File này dùng để ghi lại các thay đổi quan trọng trong quá trình thực hiện bài tập, lab, assignment hoặc project.

Nguyên tắc ghi changelog:
- Chỉ ghi những gì đã hoàn thành thật sự.
- Không ghi kế hoạch nếu chưa thực hiện.
- Mỗi thay đổi nên có ngày, nội dung, người thực hiện và minh chứng.
- Nếu có AI hỗ trợ, cần ghi rõ AI đã hỗ trợ phần nào.
- Nếu có commit GitHub, cần ghi link commit.
- Nếu có lỗi đã sửa, cần ghi rõ lỗi, nguyên nhân và cách xử lý.

---

## 2. Thông tin project

| Thông tin | Nội dung |
|---|---|
| Môn học | Lập trình C# |
| Mã môn học | PRN232 |
| Lớp | SE18D05 |
| Học kỳ | SU26 |
| Tên bài tập / Project | RoomHub - Quản lý phòng/nhà trọ |
| Tên sinh viên / Nhóm | Phan Hoài An / Nhóm 07 |
| MSSV / Danh sách MSSV | DE180303 |
| Giảng viên hướng dẫn | Thầy Lê Thiện Nhật Quang |
| Repository URL | https://github.com/fptu-se-su26/prn232-su26-ai-audit-project-prn232_se18d05_group-07 |
| Ngày bắt đầu | 09/06/2026 |
| Ngày hoàn thành | 10/06/2026 |

---

## 3. Tổng quan các phiên bản/giai đoạn

| Phiên bản/Giai đoạn | Thời gian | Nội dung chính | Trạng thái |
|---|---|---|---|
| Phase 01 | 28/05/2026 | Khởi tạo cấu trúc Backend Clean Architecture & CSDL SQL Server | Completed |
| Phase 02 | 29/05/2026 | Giao diện công khai dành cho Khách trọ | Completed |
| Phase 03 | 30/05/2026 | Giao diện Vận hành & Quản lý tài sản của Chủ nhà | Completed |
| Phase 04 | 04/06/2026 | Sửa lỗi UX/UI, loại bỏ mock data, kết nối API thực tế cho toàn bộ Owner pages | Completed |
| Phase 06 | 07/06/2026 | Luồng Xác nhận nhận phòng/từ chối của Khách thuê (Tenant Room Acceptance/Rejection Flow) | Completed |
| Phase 07 | 08/06/2026 | Trang Quản lý Khách thuê dành cho Chủ nhà, sửa giao diện sidebar/avatar, tạo EF migration | Completed |
| Phase 08 | 08/06/2026 | Triển Khai & Cải Tiến Tính Năng Hóa Đơn & Chốt Tiền (Chủ nhà & Khách thuê) | Completed |
| Phase 09 | 10/06/2026 | Tích hợp Gửi Email Thông Báo Tự Động Song Song Cho Hợp Đồng & Hóa Đơn (Khách thuê Online & Offline) | Completed |

---

# [Phase 09] Tích hợp Gửi Email Thông Báo Tự Động Song Song Cho Hợp Đồng & Hóa Đơn (Khách thuê Online & Offline)

## Ngày thực hiện

```text
09/06/2026 - 10/06/2026
```

## Đã hoàn thành

- [x] **Dịch vụ Email dùng chung (Email Service)**:
  - Khai báo phương thức `SendEmailAsync` trong [IEmailService.cs](file:///d:/Ky8/PRN232/Project/prn232-su26-ai-audit-project-prn232_se18d05_group-07/RoomHub.Backend/RoomHub.Application/Common/Interfaces/IEmailService.cs).
  - Triển khai dịch vụ SMTP hỗ trợ gửi nội dung HTML và Text trong [EmailService.cs](file:///d:/Ky8/PRN232/Project/prn232-su26-ai-audit-project-prn232_se18d05_group-07/RoomHub.Backend/RoomHub.Infrastructure/Services/EmailService.cs) (sử dụng cấu hình SMTP trong `appsettings.json`).
- [x] **Tự động gửi email khi phát hành Hợp đồng & Lời mời nhận phòng**:
  - Tiêm `IEmailService` vào constructor của [ContractService.cs](file:///d:/Ky8/PRN232/Project/prn232-su26-ai-audit-project-prn232_se18d05_group-07/RoomHub.Backend/RoomHub.Application/Services/ContractService.cs).
  - Bổ sung logic gửi email thông báo khi tạo hợp đồng: Khách thuê online nhận được email mời nhận phòng kèm hướng dẫn đăng nhập; Khách thuê offline nhận được email thông báo kích hoạt hợp đồng trực tiếp thông qua hòm thư `TemporaryTenantEmail`.
- [x] **Gửi email phản hồi hợp đồng của Khách thuê về hòm thư Chủ nhà**:
  - Trong `AcceptContractAsync` và `RejectContractAsync` tại [ContractService.cs](file:///d:/Ky8/PRN232/Project/prn232-su26-ai-audit-project-prn232_se18d05_group-07/RoomHub.Backend/RoomHub.Application/Services/ContractService.cs), tự động lấy email chủ nhà bằng `UserManager` và gửi email thông báo kết quả đồng ý hoặc từ chối nhận phòng của khách thuê.
- [x] **Tích hợp Email thông báo hóa đơn dịch vụ hàng loạt**:
  - Tiêm `IEmailService` và `UserManager<ApplicationUser>` vào [InvoiceService.cs](file:///d:/Ky8/PRN232/Project/prn232-su26-ai-audit-project-prn232_se18d05_group-07/RoomHub.Backend/RoomHub.Application/Services/InvoiceService.cs).
  - Cập nhật phương thức `SendInvoiceNotificationsAsync`: hỗ trợ tìm kiếm và gửi email nhắc hóa đơn đến cả hòm thư chính xác của khách thuê online (truy xuất qua `UserManager`) và hòm thư của khách thuê offline (lưu trữ trong `TemporaryTenantEmail` của hợp đồng).
  - Bao bọc tác vụ gửi email trong khối `try-catch` để đảm bảo nếu dịch vụ SMTP lỗi thì nghiệp vụ chốt tiền/gửi thông báo chính vẫn hoàn tất thành công.
- [x] **Gửi email báo Chủ nhà khi hóa đơn được thanh toán thành công**:
  - Trong phương thức `TenantPayInvoiceAsync` tại [InvoiceService.cs](file:///d:/Ky8/PRN232/Project/prn232-su26-ai-audit-project-prn232_se18d05_group-07/RoomHub.Backend/RoomHub.Application/Services/InvoiceService.cs), khi khách thuê thanh toán thành công (hóa đơn chuyển sang trạng thái `Paid`), tự động gửi email thông báo xác nhận thanh toán kèm thông tin số tiền đóng về email của chủ nhà.

## Thay đổi chi tiết

| STT | Nội dung thay đổi | Người thực hiện | File/Module liên quan | Minh chứng |
|---:|---|---|---|---|
| 1 | Thêm phương thức gửi email bất đồng bộ | Phan Hoài An | [IEmailService.cs](file:///d:/Ky8/PRN232/Project/prn232-su26-ai-audit-project-prn232_se18d05_group-07/RoomHub.Backend/RoomHub.Application/Common/Interfaces/IEmailService.cs) | File code |
| 2 | Hiện thực hóa SMTP Client gửi mail HTML | Phan Hoài An | [EmailService.cs](file:///d:/Ky8/PRN232/Project/prn232-su26-ai-audit-project-prn232_se18d05_group-07/RoomHub.Backend/RoomHub.Infrastructure/Services/EmailService.cs) | File code |
| 3 | Tích hợp gửi email trong luồng hợp đồng | Phan Hoài An | [ContractService.cs](file:///d:/Ky8/PRN232/Project/prn232-su26-ai-audit-project-prn232_se18d05_group-07/RoomHub.Backend/RoomHub.Application/Services/ContractService.cs) | File code |
| 4 | Cấu hình gửi email hóa đơn và thanh toán | Phan Hoài An | [InvoiceService.cs](file:///d:/Ky8/PRN232/Project/prn232-su26-ai-audit-project-prn232_se18d05_group-07/RoomHub.Backend/RoomHub.Application/Services/InvoiceService.cs) | File code |
| 5 | Biên dịch kiểm thử thành công hệ thống | Phan Hoài An | Backend Solution | Output terminal |
