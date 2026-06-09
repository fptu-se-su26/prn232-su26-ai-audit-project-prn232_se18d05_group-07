# AI Learning Reflection - Đợt cập nhật #6

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
| Ngày hoàn thành reflection | 08/06/2026 |

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
Trong đợt cập nhật #6: Hiện thực hóa tính năng Hóa đơn & Chốt tiền cho Khách thuê và nâng cấp UX/UI cho chốt tiền phòng, em đã cùng AI Antigravity phối hợp chặt chẽ. AI hỗ trợ em cải tiến nghiệp vụ chốt chỉ số (cho phép chỉnh sửa số cũ, tính tiền nước cố định), tối ưu hóa luồng UI Stepper từ 5 xuống 3 bước trực quan, tự động cuộn trang lên đầu khi chốt thành công, sửa menu dropdown 3 chấm từ hover sang click-trigger chống nhảy màn hình ở danh sách hóa đơn, và thêm nút xuất báo cáo Excel cho Tenant.
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
Antigravity có khả năng đọc hiểu cấu trúc dự án phức tạp, hỗ trợ kết xuất code C# .NET và React TypeScript cực kỳ đồng bộ, không tạo ra lỗi biên dịch kiểu dữ liệu và nắm rõ các nguyên tắc định dạng giao diện Tailwind CSS hiện có.
```

---

## 5. AI đã hỗ trợ em/nhóm ở điểm nào?

Đánh dấu các nội dung phù hợp.

- [x] Hiểu yêu cầu đề bài
- [x] Phân tích bài toán
- [x] Tìm ý tưởng giải pháp
- [ ] Thiết kế database
- [ ] Thiết kế giao diện
- [ ] Thiết kế kiến trúc hệ thống
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
AI đã hỗ trợ thiết kế các endpoint API chuẩn RESTful cho vai trò khách thuê, xây dựng các logic nghiệp vụ lọc hóa đơn an toàn tránh rò rỉ dữ liệu của phòng khác. Ở frontend, AI đã hỗ trợ viết code gọi API qua Axios kết hợp quản lý định tuyến mượt mà của SPA. Đồng thời, AI cũng sinh các logic kiểm duyệt chỉ số điện nước (bao gồm cả trường hợp tính nước cố định) và xử lý sự kiện click outside cho dropdown.
```

---

## 6. Phần nào em/nhóm không sử dụng theo gợi ý của AI? Vì sao?

```text
AI đề xuất tạo một DTO mới cho phần Payment của Tenant nhưng em nhận thấy cấu trúc của RecordPaymentRequest hiện tại ở backend đã hoàn toàn đáp ứng đầy đủ các thông tin cần thiết. Việc tái sử dụng DTO cũ giúp giảm tải code rác, giữ cho mã nguồn backend gọn gàng và tối ưu hơn.
```

---

## 7. Em/nhóm đã kiểm tra tính đúng đắn của kết quả AI như thế nào?

```text
Em đã áp dụng quy trình kiểm chứng toàn diện:
1. Compile Check: Chạy build dự án backend (dotnet build) thành công. Chạy build frontend (npm run build / tsc -b) biên dịch thành công 100% không còn bất kỳ lỗi kiểu dữ liệu TypeScript nào sau khi sửa lỗi validateUnit và ép kiểu cũ/mới của điện nước.
2. Tích hợp E2E & Flow Testing:
   - Đăng nhập Tenant: Dashboard hiển thị hộp cảnh báo màu đỏ chính xác với hóa đơn chưa đóng. Nhấn vào nút Thanh toán ngay chuyển hướng mượt mà, thực hiện thanh toán giả lập và Dashboard tự động ẩn cảnh báo.
   - Quản lý hình thức tính nước: Thiết lập nước cố định cho tài sản và phòng. Khi lập hóa đơn hàng loạt, giao diện tự động ẩn và khóa ô chỉ số, tính tiền nước chuẩn xác theo MaxCapacity của phòng. Thay đổi MaxCapacity trong chi tiết phòng lập tức phản ánh số tiền nước cố định mới.
   - Xuất Excel: Tải file báo cáo hóa đơn của Owner thành công, file Excel được sinh ra chuẩn xác không gặp lỗi 400 Bad Request từ thư viện EPPlus.
```

---

## 8. Nếu không có AI, phần nào sẽ khó khăn nhất?

```text
Khó khăn nhất là việc đồng bộ hóa URL hash routing cho các sub-route sâu của Tenant (`#/tenant/invoices/<id>`) trong App.tsx để đảm bảo khi người dùng tải lại trang web hoặc bookmark link thì hệ thống vẫn nhận diện chính xác hóa đơn cần hiển thị. AI đã hỗ trợ giải quyết vấn đề regex/nhận diện URL này rất nhanh và chính xác.
```

---

## 9. Sau bài tập/project này, em/nhóm học được gì về môn học?

```text
Em học được:
1. Cách tổ chức phân quyền bảo mật riêng biệt ở mức API Controller bằng ASP.NET Core Identity/Role Authorization.
2. Tầm quan trọng của việc nạp dữ liệu liên quan (Include & ThenInclude) ở repository để tránh lỗi lazy loading khi truy xuất các thuộc tính lồng nhau.
3. Cách sử dụng thư viện EPPlus trong C# để xuất báo cáo Excel, đặc biệt là quy tắc bắt buộc của EPPlus: phải gán PatternType = ExcelFillStyle.Solid trước khi gán màu nền (BackgroundColor.SetColor), nếu không sẽ phát sinh lỗi 400 Bad Request ngầm rất khó debug.
4. Cách xây dựng và quản lý các component React SPA phức tạp bằng cách kiểm duyệt tính hợp lệ của dữ liệu (validation) thông qua các kiểu dữ liệu an toàn (`Number()` wrapper).
```

---

## 10. Sau bài tập/project này, em/nhóm học được gì về cách sử dụng AI có trách nhiệm?

```text
Sử dụng AI có trách nhiệm là luôn luôn kiểm chứng vấn đề phân quyền. Khi AI đề xuất API thanh toán hóa đơn, em phải kiểm tra kỹ logic backend xem có bước xác thực ID người dùng đăng nhập có đúng là người thuê của phòng đó hay không, tránh lỗ hổng bảo mật ID Harvesting (người dùng thay đổi ID hóa đơn trên URL để thanh toán hoặc xem hóa đơn của người khác).
```

---

## 11. Tự đánh giá mức độ hoàn thành & Điểm tự đánh giá

| Tiêu chí | Điểm tự đánh giá 1-5 | Ghi chú |
|---|:---:|---|
| Ghi nhận việc dùng AI trung thực | 5 | Ghi nhận chi tiết 5 prompt và công việc hỗ trợ |
| Prompt có mục tiêu rõ ràng | 5 | Xác định rõ nghiệp vụ Invoices cho Tenant |
| Kiểm chứng kết quả AI | 5 | Build backend/frontend thành công và test E2E thực tế |
| Tự chỉnh sửa/cải tiến | 5 | Tái sử dụng DTO thay vì tạo DTO mới dư thừa |
| Hiểu nội dung đã nộp | 5 | Nắm rõ luồng thanh toán và đồng bộ database |
| Reflection có chiều sâu | 5 | Bài học sâu sắc về phân quyền API và an toàn thông tin |
| Sử dụng AI có trách nhiệm | 5 | Chủ động rà soát phân quyền ID của Tenant |

---

## 12. Câu hỏi tự vấn cuối bài

### 12.1. Nếu giảng viên hỏi về phần AI đã hỗ trợ, em/nhóm có giải thích lại được không?

```text
Chắc chắn giải thích được. Em nắm rõ cấu trúc dữ liệu gửi lên qua request body của endpoint POST `/pay`, cách backend cập nhật bảng Payment và cập nhật trạng thái hóa đơn Invoice sang Paid, cũng như cách truyền dữ liệu bằng props và state trong React.
```

### 12.2. Nếu không có AI, em/nhóm có thể tự làm lại phần quan trọng nhất không?

```text
Hoàn toàn có thể làm lại được. Phần C# controller/service là kiến thức trọng tâm của môn học và em tự tin làm chủ toàn bộ mã nguồn này.
```

### 12.3. Phần nào trong bài thể hiện rõ nhất năng lực thật sự của em/nhóm?

```text
Khả năng liên kết logic UX mượt mà: Dashboard tự động bắt hóa đơn chưa thanh toán gần nhất, dẫn trực tiếp khách thuê sang trang thanh toán chỉ với một cú click chuột và tự động ẩn cảnh báo ngay sau khi giao dịch hoàn tất.
```

### 12.4. Em/nhóm muốn cải thiện kỹ năng nào sau bài này?

```text
Cải thiện khả năng tích hợp các cổng thanh toán trực tuyến thực tế (như cổng Sandbox VNPay/MOMO thật) thay vì chỉ sử dụng hàm mô phỏng.
```

---

## 13. Cam kết Reflection

Em/nhóm cam kết nội dung phản ánh trung thực quá trình học tập.

| Đại diện sinh viên/nhóm | Ngày xác nhận |
|---|---|
| Phan Hoài An | 08/06/2026 |
