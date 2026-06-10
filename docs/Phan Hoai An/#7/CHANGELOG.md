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
| Ngày bắt đầu | 10/06/2026 |
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
| Phase 09 | 10/06/2026 | Tính năng xóa thông báo với Custom Confirm & Sửa lỗi điều hướng "Về trang chủ" | Completed |

---

# [Phase 09] Tính năng xóa thông báo với Custom Confirm & Sửa lỗi điều hướng "Về trang chủ"

## Ngày thực hiện

```text
10/06/2026
```

## Đã hoàn thành

- [x] **Xóa thông báo cho Chủ nhà (Owner Notifications)**:
  - Thêm state `deleteTargetId` để mở dialog xác nhận xóa và gọi API `DELETE /api/notifications/{id}`.
  - Tích hợp thêm icon thùng rác bên cạnh thời gian thông báo trong danh sách để chủ nhà chủ động xóa.
  - Phát đi sự kiện `notification_changed` để cập nhật lại số thông báo chưa đọc trên thanh Navbar.
- [x] **Custom Modal Confirm (Thay thế `window.confirm` mặc định của trình duyệt)**:
  - Tạo các Modal xác nhận tùy chỉnh bằng React State và Tailwind CSS có animation đẹp mắt, chuyên nghiệp.
  - Áp dụng khi xóa thông báo ở cả giao diện của Chủ nhà (`OwnerNotifications.tsx`) và Khách thuê (`TenantNotifications.tsx`).
  - Áp dụng khi từ chối lời mời nhận phòng của Khách thuê (`TenantNotifications.tsx`).
  - Loại bỏ hoàn toàn dòng chữ `localhost says` của trình duyệt giúp nâng cao trải nghiệm người dùng (UX).
- [x] **Khắc phục lỗi điều hướng "Về trang chủ"**:
  - Cập nhật sự kiện click nút "Về trang chủ" trong menu Avatar của `OwnerLayout.tsx` và `TenantLayout.tsx` để xóa hash, chuyển URL trình duyệt về `/` và cập nhật state `currentPage = 'home'`.
  - Cập nhật hàm `navTo` và sự kiện click Logo trên `Navbar.tsx` để xóa hash trước khi `navigate` sang bất kỳ trang public nào, tránh lỗi hiển thị đè màn hình Dashboard.
- [x] **Gửi thông báo nhắc nhở hóa đơn thực tế (Owner -> Tenant)**:
  - Định nghĩa DTO `NotifyBatchRequest` nhận danh sách phòng và tin nhắn.
  - Viết logic `SendInvoiceNotificationsAsync` trong `InvoiceService.cs` và endpoint `POST /api/owner/invoices/notify-batch` trong `InvoicesController.cs`.
  - Đồng bộ state `notificationMessage` vào textarea ở modal thành công của `InvoiceCreate.tsx` và thực hiện gọi API gửi thông báo thực tế khi bấm gửi.
- [x] **Thông báo thanh toán thành công tự động (Tenant -> Owner)**:
  - Tự động tạo `Notification` cho chủ nhà khi khách thuê thanh toán thành công hóa đơn ở hàm `TenantPayInvoiceAsync` (`InvoiceService.cs`).
- [x] **Biên dịch Hệ thống**:
  - Chạy lệnh build backend/frontend thành công, loại bỏ tất cả các cảnh báo kiểu dữ liệu.

## Thay đổi chi tiết

| STT | Nội dung thay đổi | Người thực hiện | File/Module liên quan | Minh chứng |
|---:|---|---|---|---|
| 1 | Thêm DTO nhận yêu cầu gửi thông báo nhắc hóa đơn | Phan Hoài An | `InvoiceDtos.cs` | Code compiled |
| 2 | Khai báo và triển khai nghiệp vụ gửi thông báo nhắc hóa đơn hàng loạt | Phan Hoài An | `IInvoiceService.cs`, `InvoiceService.cs` | Code compiled |
| 3 | Tự động tạo thông báo gửi cho chủ nhà khi khách thuê thanh toán | Phan Hoài An | `InvoiceService.cs` | Code compiled |
| 4 | Bổ sung API endpoint gửi thông báo nhắc nhở | Phan Hoài An | `InvoicesController.cs` | POST /api/owner/invoices/notify-batch |
| 5 | Kết nối API gửi thông báo nhắc nợ trên giao diện chốt hóa đơn hàng loạt | Phan Hoài An | `InvoiceCreate.tsx` | UI đồng bộ và gửi thông báo nhắc nợ thành công |
| 6 | Thêm state, hàm xóa và Custom Modal Confirm xóa thông báo cho Chủ nhà | Phan Hoài An | `pages/owner/Notifications.tsx` | UI hiển thị Custom Confirm modal & xóa thành công |
| 7 | Thay thế `window.confirm` bằng Custom Modal Confirm khi xóa thông báo ở Khách thuê | Phan Hoài An | `pages/tenant/Notifications.tsx` | Hộp thoại Custom Confirm modal thay thế hoàn toàn browser default |
| 8 | Thay thế `window.confirm` bằng Custom Modal Confirm khi từ chối nhận phòng ở Khách thuê | Phan Hoài An | `pages/tenant/Notifications.tsx` | Hộp thoại cảnh báo từ chối màu cam hoạt động tốt |
| 9 | Sửa nút Về trang chủ trong Avatar menu để làm sạch hash và định hướng đúng URL `/` | Phan Hoài An | `OwnerLayout.tsx`, `TenantLayout.tsx` | Điều hướng chuẩn và URL sạch hash |
| 10 | Tự động dọn dẹp hash trên URL khi bấm Logo hoặc danh mục điều hướng chính | Phan Hoài An | `Navbar.tsx` | Tránh bị đè dashboard khi điều hướng về các trang công cộng |
| 11 | Biên dịch kiểm thử backend và build thành công | Phan Hoài An | Backend / Frontend | Build succeeded |

## Bug Report chi tiết

| STT | Tên lỗi | Nguyên nhân | Cách sửa |
|---:|---|---|---|
| B-01 | Nhấn Về trang chủ nhưng hiển thị trang Tìm chỗ ở | Browser path trước đó là `/browse` và nút Về trang chủ chỉ đổi state currentPage = 'home' chứ không navigate về `/` | Gọi `navigate('/')` để chuyển hướng chính xác |
| B-02 | Nhấn Về trang chủ nhưng URL giữ nguyên hash dashboard cũ | Nút Về trang chủ không dọn dẹp hash (`#/owner/...`) làm ứng dụng tự load lại dashboard sau khi reload trang | Gọi `window.location.hash = ''` để xóa sạch hash trên URL |

## AI có hỗ trợ không?

- [x] Có
- [ ] Không

Nếu có, mô tả AI đã hỗ trợ phần nào:

```text
AI trợ lý Antigravity đã hỗ trợ tích cực trong việc: (1) Thiết kế Custom Modal Confirm bằng React State & Tailwind CSS, tích hợp hoạt ảnh mượt mà cho các hành động xóa thông báo và từ chối nhận phòng; (2) Phân tích lỗi cấu trúc hash-routing dẫn đến hành vi hiển thị chồng lấn trang và đề xuất cách làm sạch hash trên Navbar và Layouts; (3) Triển khai DTO, API endpoint gửi thông báo nhắc hóa đơn hàng loạt từ chủ nhà tới người thuê, đồng thời kết nối gọi API thực tế từ UI chốt tiền; (4) Tích hợp thông báo thanh toán thành công tự động gửi cho chủ nhà ở Backend; (5) Tiến hành biên dịch thành công cả dự án Backend và Frontend.
```

## Cam kết cập nhật Changelog

Sinh viên/nhóm cam kết rằng nội dung changelog phản ánh đúng các thay đổi đã thực hiện trong quá trình làm bài tập/project.

| Đại diện sinh viên/nhóm | Ngày xác nhận |
|---|---|
| Phan Hoài An | 10/06/2026 |
