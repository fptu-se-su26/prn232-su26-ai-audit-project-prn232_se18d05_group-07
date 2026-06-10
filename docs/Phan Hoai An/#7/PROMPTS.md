# Prompt Log - Đợt cập nhật #7

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
| Ngày cập nhật gần nhất | 10/06/2026 |

---

## 2. Mục đích của file Prompt Log

File này dùng để ghi lại các prompt quan trọng đã sử dụng trong quá trình thực hiện bài tập, lab, assignment hoặc project.

Sinh viên/nhóm cần ghi lại:
- Đã hỏi AI điều gì.
- Mục đích sử dụng prompt.
- Công cụ AI đã sử dụng.
- AI đã trả lời hoặc gợi ý gì.
- Kết quả đó có được áp dụng vào bài hay không.
- Sinh viên/nhóm đã kiểm tra, chỉnh sửa hoặc cải tiến gì sau khi nhận kết quả từ AI.

---

## 3. Công cụ AI đã sử dụng

Đánh dấu các công cụ AI đã sử dụng.

- [ ] ChatGPT
- [ ] Gemini
- [ ] Claude
- [ ] GitHub Copilot
- [ ] Cursor
- [x] Antigravity
- [ ] Microsoft Copilot
- [ ] Perplexity
- [ ] Công cụ khác: ....................................

---

## 4. Bảng tổng hợp prompt đã sử dụng

| STT | Ngày | Công cụ AI | Mục đích | Prompt tóm tắt | Kết quả chính | Có sử dụng vào bài không? | Minh chứng |
|---:|---|---|---|---|---|---|---|
| 1 | 09/06/2026 | Antigravity | Tích hợp gửi email | Tích hợp gửi email thông báo song song với thông báo hệ thống | Tạo IEmailService, EmailService và sửa đổi logic gửi email trong ContractService | Có | Commit Git / File code |
| 2 | 10/06/2026 | Antigravity | Triển khai logic hóa đơn | Tiêm dịch vụ email vào InvoiceService và cấu hình gửi email hóa đơn/thanh toán | Sửa đổi InvoiceService.cs và chạy dotnet build biên dịch thành công | Có | Commit Git / File code |

---

## 5. Prompt chi tiết

---

### Prompt số 1

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng | 09/06/2026 |
| Công cụ AI | Antigravity |
| Mục đích | Thiết lập nền tảng gửi email và tích hợp vào quy trình Hợp đồng |
| Phần việc liên quan | IEmailService, EmailService, ContractService |
| Mức độ sử dụng | Hỏi phân tích và sinh code |

#### 5.1. Prompt nguyên văn

```text
tieps theo bây giờ tôi muốn bổ sung thêm tính năng cho thông báo như sau, đầu tiên là về tất cả các thông báo bây giờ đã thực hiện thông báo trên hệ thống thành công nhưng bây giờ tôi muốn bổ sung thêm đó là các thông báo sẽ đồng thời được gửi về mail của người dùng luôn, tất cả các thông báo sẽ được gửi về mail chính xác của người dùng và đối với khách thuê offline không dùng hệ thông thì cũng được gửi thông báo về mail luôn được không nếu được thì thực hiện luôn giúp tôi, đảm bảo chuẩn cấu trúc dự án và các tính năng hoạt động tốt
```

#### 5.2. Bối cảnh khi viết prompt

Hệ thống thông báo mới chỉ hoạt động trong database và hiển thị trên giao diện thông qua chuông báo/sidebar. Để cải thiện trải nghiệm và tương tác thực tế của người dùng, cần có cơ chế gửi email song song cho cả khách thuê online và khách thuê offline khi có sự kiện nhận phòng/hợp đồng phát sinh.

#### 5.3. Kết quả AI trả về

AI thiết kế và xây dựng phương thức gửi mail SMTP HTML bất đồng bộ, sau đó áp dụng vào các hàm tạo hợp đồng (`CreateContractAsync`), đồng ý nhận phòng (`AcceptContractAsync`) và từ chối nhận phòng (`RejectContractAsync`).

#### 5.4. Sự kiểm chứng và cải tiến của sinh viên/nhóm

Em đã kiểm tra thiết lập SMTP, chỉnh sửa nội dung email được biên dịch dưới dạng mã HTML đẹp mắt với phong cách hiện đại và chuyên nghiệp của nền tảng RoomHub.

---

### Prompt số 2

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng | 10/06/2026 |
| Công cụ AI | Antigravity |
| Mục đích | Tích hợp gửi email nhắc hóa đơn và thông báo thanh toán thành công |
| Phần việc liên quan | InvoiceService.cs |
| Mức độ sử dụng | Thực thi sau khi được phê duyệt kế hoạch |

#### 5.1. Prompt nguyên văn

```text
The user has approved the implementation plan for integrating email notification for invoices and payments. Propose and execute changes to InvoiceService.cs.
```

#### 5.2. Bối cảnh khi viết prompt

Kế hoạch triển khai gửi email cho hóa đơn và thanh toán đã được phê duyệt. Ta cần tiêm dịch vụ email và tài khoản vào `InvoiceService.cs` để hoàn tất toàn bộ yêu cầu.

#### 5.3. Kết quả AI trả về

AI đề xuất code chỉnh sửa constructor và cập nhật logic trong `TenantPayInvoiceAsync` cùng với `SendInvoiceNotificationsAsync` gửi email tới hòm thư chính xác của khách thuê online/offline và chủ nhà.

#### 5.4. Sự kiểm chứng và cải tiến của sinh viên/nhóm

Em đã tiến hành chạy thử `dotnet build` và kiểm tra cấu trúc của hàm gửi email. Đồng thời, em bổ sung khối `try-catch` bao quanh các tác vụ gửi email để đảm bảo nếu SMTP Server gặp lỗi kết nối hoặc ngoại lệ ngoài ý muốn, nó chỉ ghi nhận thông tin ra Console chứ không làm gián đoạn nghiệp vụ lưu dữ liệu hoặc thanh toán của người dùng.
