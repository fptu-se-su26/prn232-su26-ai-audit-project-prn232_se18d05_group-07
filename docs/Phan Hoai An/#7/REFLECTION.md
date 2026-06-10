# AI Learning Reflection - Đợt cập nhật #7

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
| Ngày hoàn thành reflection | 10/06/2026 |

---

## 2. Mục đích Reflection

File này dùng để sinh viên/nhóm tự đánh giá quá trình sử dụng AI trong học tập và thực hiện bài tập, lab, assignment hoặc project.

Reflection cần thể hiện:
- AI đã hỗ trợ gì trong quá trình học.
- Sinh viên/nhóm đã kiểm chứng kết quả AI như thế nào.
- Sinh viên/nhóm đã tự chỉnh sửa, cải tiến ra sao.
- Sinh viên/nhóm học được gì về môn học.
- Sinh viên/nhóm học được gì về cách sử dụng AI minh bạch và có trách nhiệm.

---

## 3. Tóm tắt quá trình sử dụng AI

```text
Trong đợt cập nhật #7: Tích hợp gửi thông báo email đồng thời cho hợp đồng và hóa đơn dịch vụ (áp dụng cả khách thuê online và khách thuê offline), em đã làm việc chặt chẽ với AI Antigravity. AI hỗ trợ em thiết kế cấu trúc phương thức gửi email bất đồng bộ HTML dùng chung và tích hợp luồng gửi email tự động vào các dịch vụ ContractService và InvoiceService ở phía Backend. Em đã thực hiện tự động hóa việc lấy thông tin email người dùng qua UserManager và cấu hình gửi trực tiếp email cho khách offline qua hòm thư TemporaryTenantEmail trong hợp đồng.
```

---

## 4. Công cụ AI đã sử dụng

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

### Công cụ được sử dụng nhiều nhất

```text
Antigravity
```

### Lý do sử dụng công cụ đó

```text
Antigravity có khả năng hiểu rõ kiến trúc Clean Architecture của dự án RoomHub, giúp xác định đúng vị trí tiêm các Service phụ thuộc (Dependency Injection) và hỗ trợ viết mã nguồn C# chất lượng cao, hạn chế tối đa các lỗi tham chiếu rỗng hoặc sai cấu trúc API.
```

---

## 5. AI đã hỗ trợ em/nhóm ở điểm nào?

Đánh dấu các nội dung phù hợp.

- [x] Hiểu yêu cầu đề bài
- [x] Phân tích bài toán
- [x] Tìm ý tưởng giải pháp
- [ ] Thiết kế database
- [ ] Thiết kế giao diện
- [x] Thiết kế kiến trúc hệ thống
- [x] Viết code mẫu
- [ ] Debug lỗi
- [ ] Viết test case
- [ ] Review code
- [x] Tối ưu code
- [ ] Kiểm tra bảo mật
- [x] Viết báo cáo
- [ ] Làm slide thuyết trình
- [ ] Tìm hiểu công nghệ mới
- [ ] Khác: ....................................

### Mô tả chi tiết

```text
AI đã hỗ trợ em phác thảo quy trình gửi mail tự động song song với hệ thống lưu thông báo database hiện tại. Bằng cách bổ sung IEmailService, AI đã viết mã mẫu cho việc khởi tạo SMTP Client và cấu hình email HTML. Ở mức độ dịch vụ, AI hỗ trợ tiêm UserManager để lấy email tài khoản chính xác của khách thuê online và chủ nhà, đồng thời thiết kế luồng xử lý riêng biệt cho khách thuê offline (chỉ gửi email mà không tạo thông báo hệ thống do họ không có tài khoản).
```

---

## 6. Phần nào em/nhóm không sử dụng theo gợi ý của AI? Vì sao?

```text
AI đề xuất ném một Exception cụ thể khi phương thức SendEmailAsync gặp sự cố kết nối tới SMTP Server. Tuy nhiên, em nhận thấy việc gửi email là một dịch vụ bổ trợ và không được làm gián đoạn luồng nghiệp vụ cốt lõi (như chốt tiền phòng hoặc thanh toán hóa đơn). Nếu ném exception ra ngoài, transaction database sẽ bị rollback, khiến khách thuê không thể thanh toán được hóa đơn khi hòm thư SMTP gặp sự cố. Vì vậy, em đã chỉnh sửa để bọc try-catch bên ngoài tác vụ gửi mail, chỉ ghi log lỗi ra Console và cho phép transaction database tiếp tục commit thành công.
```

---

## 7. Bài học kinh nghiệm / Thu hoạch sau quá trình làm việc với AI

### Về kiến thức chuyên môn (C# / Web Development / Database / ...)

```text
Qua đợt này, em đã nắm vững cơ chế gửi email bất đồng bộ SMTP trong C# .NET Core, cách cấu hình và đọc thông tin cấu hình từ file appsettings.json thông qua Dependency Injection. Em cũng hiểu sâu sắc hơn về cách lấy dữ liệu tài khoản người dùng thông qua UserManager<ApplicationUser> và cách thiết kế ứng dụng có tính chịu lỗi cao (fault-tolerant) bằng việc phân tách luồng xử lý chính và phụ (gửi mail).
```

### Về cách làm việc với AI (cách viết prompt, cách đánh giá kết quả, cách cải tiến, ...)

```text
Em nhận ra rằng khi giao tiếp với AI cho các tác vụ liên quan đến dịch vụ mạng bên thứ ba (như gửi email, thanh toán...), cần mô tả rõ ràng biên giới lỗi và hướng xử lý ngoại lệ (Exception Handling). Việc này giúp AI đề xuất mã nguồn an toàn hơn, tránh gây lỗi sập lan truyền (cascading failures) cho toàn bộ hệ thống. Luôn luôn chạy dotnet build để kiểm tra biên dịch trước khi đưa vào kiểm thử thực tế.
```
