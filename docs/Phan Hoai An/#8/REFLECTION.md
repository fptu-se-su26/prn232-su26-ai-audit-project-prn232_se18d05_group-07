# AI Learning Reflection - Đợt cập nhật #8

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
| Ngày hoàn thành reflection | 25/07/2026 |

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
Trong đợt cập nhật #8, em đã phát triển ba nhóm tính năng lớn cho RoomHub với sự hỗ trợ của AI Antigravity: (1) Hệ thống Subscription (gói cước) toàn diện từ Domain Layer đến Frontend cho cả Chủ nhà và Admin; (2) Tính năng quản lý và Khóa/Mở khóa Tòa nhà cho Admin kèm EF Core migration thay đổi schema CSDL; (3) Cải tiến InvoiceService để giải quyết vấn đề khách thuê offline có email trùng với tài khoản online bị thiếu hóa đơn. AI đã đề xuất kiến trúc phân lớp Clean Architecture xuyên suốt và sinh code đúng cấu trúc dự án. Em đã chủ động kiểm chứng các edge case bảo mật (webhook validation, subscription ownership check) và cải thiện một số phần mà AI chưa tính đến.
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
Antigravity có khả năng hiểu toàn bộ kiến trúc Clean Architecture của RoomHub (Domain / Application / Infrastructure / API / Frontend) và có thể đọc code hiện tại trước khi đề xuất thay đổi, đảm bảo code mới không xung đột với code cũ. Đây là lý do Antigravity tạo ra code ít lỗi biên dịch hơn so với các công cụ AI không có khả năng đọc toàn bộ codebase.
```

---

## 5. AI đã hỗ trợ em/nhóm ở điểm nào?

Đánh dấu các nội dung phù hợp.

- [x] Hiểu yêu cầu đề bài
- [x] Phân tích bài toán
- [x] Tìm ý tưởng giải pháp
- [x] Thiết kế database
- [x] Thiết kế giao diện
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
AI đã hỗ trợ em toàn diện trong đợt này. Ở cấp độ thiết kế hệ thống, AI đề xuất cách phân chia giới hạn gói cước vào lớp Domain (SubscriptionLimits.cs) thay vì để vào Service, giúp code có thể tái sử dụng ở nhiều nơi mà không cần inject thêm dependency. Ở cấp độ database, AI tạo đúng cú pháp EF Core migration và cập nhật cả Designer file lẫn Snapshot. Ở cấp độ bảo mật, AI bảo vệ đúng các endpoints Admin bằng [Authorize(Roles = "Admin")] và bắt buộc Owner xác thực đúng subscription id khi gọi webhook. Ở cấp độ giao diện, AI xây dựng các trang Admin quản lý tòa nhà và gói cước với UX trực quan, có badge màu sắc, modal nhập lý do và thanh progress bar.
```

---

## 6. Phần nào em/nhóm không sử dụng theo gợi ý của AI? Vì sao?

```text
Trong hàm HandlePayOSWebhookAsync, AI ban đầu không kiểm tra xem sub.UserId có khớp với ownerId (người dùng đang gọi API) hay không. Điều này tạo ra lỗ hổng bảo mật: người dùng A có thể kích hoạt gói cước đang pending của người dùng B (đã trả tiền) bằng cách đoán subscriptionId từ memo thanh toán (vì subscriptionId là số tuần tự dễ đoán). Em đã thêm điều kiện sub.UserId != ownerId vào kiểm tra trước khi kích hoạt, để đảm bảo chỉ chính chủ đăng ký mới có thể kích hoạt gói của mình thông qua webhook.

Ngoài ra, với việc xử lý thống kê phòng trong GetAllBuildingsAsync, AI ban đầu dùng phép trừ đơn giản cho VacantRooms nhưng không dùng Math.Max để tránh giá trị âm khi dữ liệu bị lệch do phòng đang ở trạng thái trung gian. Em đã bổ sung Math.Max(0, ...) để đảm bảo VacantRooms không bao giờ hiển thị số âm trên giao diện Admin.
```

---

## 7. Bài học kinh nghiệm / Thu hoạch sau quá trình làm việc với AI

### Về kiến thức chuyên môn (C# / Web Development / Database / ...)

```text
Qua đợt này, em đã nắm vững cách thiết kế hệ thống phân cấp gói dịch vụ (Freemium model) trong .NET Core, bao gồm cách lưu và kiểm tra giới hạn sử dụng (BuildingsUsed, RoomsUsed, AiAuditsUsed), và cách reset counter theo chu kỳ tháng. Em cũng hiểu sâu hơn về EF Core migration: cách thêm cột nullable vào bảng hiện có, cách cascade cập nhật các entity liên quan trong một transaction. Đặc biệt, em học được cách giải quyết bài toán identity resolution (cùng một người dùng có thể được định danh bằng TenantId hoặc TemporaryTenantEmail trong hai luồng khác nhau) bằng cách kết hợp hai query và dedup bằng HashSet.
```

### Về cách làm việc với AI (cách viết prompt, cách đánh giá kết quả, cách cải tiến, ...)

```text
Em nhận ra rằng AI Antigravity hoạt động tốt nhất khi mô tả yêu cầu ở mức kiến trúc (implement X with Y functionality) thay vì yêu cầu quá chi tiết từng dòng code. Khi AI đọc được toàn bộ codebase hiện tại, nó tự điều chỉnh code sinh ra để phù hợp với naming convention, DI pattern và cấu trúc thư mục của dự án mà không cần nhắc lại. Tuy nhiên, em học được rằng cần luôn review phần bảo mật và edge case trong code AI sinh ra, vì AI thường ưu tiên chức năng hoạt động đúng hơn là phòng thủ tấn công. Khi nhận thấy thiếu sót, cần bổ sung ngay và ghi vào Reflection để không lặp lại sai lầm tương tự.
```
