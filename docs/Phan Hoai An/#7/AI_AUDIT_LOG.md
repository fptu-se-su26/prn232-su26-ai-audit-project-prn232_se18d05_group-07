# AI Audit Log - Đợt cập nhật #7

## 1. Thông tin chung

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
| Ngày bắt đầu | 09/06/2026 |
| Ngày hoàn thành | 10/06/2026 |

---

## 2. Công cụ AI đã sử dụng

Đánh dấu các công cụ AI đã sử dụng trong quá trình thực hiện bài tập/project.

- [ ] ChatGPT
- [ ] Gemini
- [ ] Claude
- [ ] GitHub Copilot
- [ ] Cursor
- [x] Antigravity
- [ ] Perplexity
- [ ] Microsoft Copilot
- [ ] Công cụ khác: ....................................

---

## 3. Mục tiêu sử dụng AI

Mô tả ngắn gọn sinh viên/nhóm đã sử dụng AI để hỗ trợ những công việc nào.

- Xây dựng phương thức gửi email dùng chung `SendEmailAsync` trong [IEmailService.cs](file:///d:/Ky8/PRN232/Project/prn232-su26-ai-audit-project-prn232_se18d05_group-07/RoomHub.Backend/RoomHub.Application/Common/Interfaces/IEmailService.cs) và [EmailService.cs](file:///d:/Ky8/PRN232/Project/prn232-su26-ai-audit-project-prn232_se18d05_group-07/RoomHub.Backend/RoomHub.Infrastructure/Services/EmailService.cs) hỗ trợ cả dạng Text và HTML.
- Tích hợp gửi email tự động song song với thông báo hệ thống khi chủ nhà phát hành hợp đồng/lời mời nhận phòng (Hỗ trợ cả gửi cho tài khoản liên kết online và email khách thuê offline `TemporaryTenantEmail`) trong `ContractService.cs`.
- Tự động gửi email thông báo cho chủ nhà khi khách thuê đồng ý (`ConfirmContractAsync` / `AcceptContractAsync`) hoặc từ chối (`RejectContractAsync`) lời mời nhận phòng.
- Tiêm thêm `IEmailService` và `UserManager<ApplicationUser>` vào `InvoiceService.cs` để hỗ trợ gửi email thông báo hóa đơn hàng loạt khi chủ nhà phát hành, bao gồm lấy email tài khoản chính xác của khách thuê online và email từ hợp đồng của khách thuê offline.
- Tự động gửi email báo cho chủ nhà khi khách thuê thanh toán hóa đơn thành công trong `TenantPayInvoiceAsync`.
- Thực hiện kiểm chứng biên dịch toàn hệ thống.

---

## 4. Nhật ký sử dụng AI chi tiết

---

### Lần sử dụng AI số 1

| Nội dung | Thông tin |
|---|---|
| Giai đoạn | Backend Services / Phase 09 |
| Ngày sử dụng | 09/06/2026 |
| Công cụ AI | Antigravity |
| Mục đích sử dụng | Phát triển nền tảng gửi email dùng chung và tích hợp vào quy trình Hợp đồng |
| Phần việc liên quan | IEmailService, EmailService, ContractService |
| Mức độ sử dụng | Hỗ trợ nhiều / Sinh chính nội dung |

#### 4.1. Prompt đã sử dụng

```text
tieps theo bây giờ tôi muốn bổ sung thêm tính năng cho thông báo như sau, đầu tiên là về tất cả các thông báo bây giờ đã thực hiện thông báo trên hệ thống thành công nhưng bây giờ tôi muốn bổ sung thêm đó là các thông báo sẽ đồng thời được gửi về mail của người dùng luôn, tất cả các thông báo sẽ được gửi về mail chính xác của người dùng và đối với khách thuê offline không dùng hệ thông thì cũng được gửi thông báo về mail luôn được không nếu được thì thực hiện luôn giúp tôi, đảm bảo chuẩn cấu trúc dự án và các tính năng hoạt động tốt
```

*(Lập kế hoạch thiết lập SMTP và gửi email)*

#### 4.2. Kết quả AI gợi ý

AI thiết kế và viết code:
- Tạo khai báo phương thức gửi email bất đồng bộ `SendEmailAsync` trong `IEmailService.cs`.
- Khởi tạo SMTP Client và cấu hình HTML/CSS email đẹp mắt trong `EmailService.cs`.
- Cập nhật constructor của `ContractService.cs` để tiêm `IEmailService`.
- Chèn logic gửi email mời nhận phòng cho khách online, email kích hoạt hợp đồng cho khách offline và email phản hồi đồng ý/từ chối của khách thuê về hòm thư chủ nhà.

#### 4.3. Phần sinh viên/nhóm đã sử dụng từ AI

Sử dụng toàn bộ logic backend code ở các Service và Repository.

#### 4.4. Minh chứng

- Files liên quan: `IEmailService.cs`, `EmailService.cs`, `ContractService.cs`

---

### Lần sử dụng AI số 2

| Nội dung | Thông tin |
|---|---|
| Giai đoạn | Backend Services / Phase 09 |
| Ngày sử dụng | 10/06/2026 |
| Công cụ AI | Antigravity |
| Mục đích sử dụng | Tiêm dịch vụ email vào InvoiceService và hiện thực hóa gửi email hóa đơn/thanh toán |
| Phần việc liên quan | InvoiceService |
| Mức độ sử dụng | Hỗ trợ nhiều / Sinh chính nội dung |

#### 4.1. Prompt đã sử dụng

```text
The user has approved the implementation plan for integrating email notification for invoices and payments. Propose and execute changes to InvoiceService.cs.
```

#### 4.2. Kết quả AI gợi ý

AI thiết kế và cập nhật:
- Tiêm thêm `IEmailService` và `UserManager<ApplicationUser>` vào constructor của `InvoiceService.cs`.
- Trong hàm `TenantPayInvoiceAsync`, sau khi hóa đơn được cập nhật sang trạng thái `Paid`, thực hiện truy xuất tài khoản chủ nhà và gửi email thông báo thanh toán thành công chi tiết.
- Trong hàm `SendInvoiceNotificationsAsync`, bỏ điều kiện ràng buộc bắt buộc có `TenantId` để không bỏ qua khách thuê offline. Lọc gửi thông báo hệ thống và email tài khoản cho khách thuê online, đồng thời gửi email trực tiếp tới `TemporaryTenantEmail` của khách thuê offline.

#### 4.3. Phần sinh viên/nhóm đã sử dụng từ AI

Sử dụng toàn bộ logic backend code trong `InvoiceService.cs`.

#### 4.4. Minh chứng

- Files liên quan: `InvoiceService.cs`
