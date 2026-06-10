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
Trong đợt cập nhật #7, AI trợ lý Antigravity đã hỗ trợ tích cực trong việc khắc phục lỗi điều hướng "Về trang chủ" từ Dashboard và tích hợp hệ thống thông báo hai chiều về hóa đơn giữa Chủ nhà và Khách thuê. AI giúp em thiết kế Custom Modal Confirm thay cho window.confirm mặc định, đồng thời triển khai DTO, API gửi thông báo nhắc hóa đơn hàng loạt và tự động gửi thông báo thanh toán hóa đơn thành công cho chủ nhà ở Backend.
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
Antigravity có khả năng đọc hiểu mã nguồn hiện tại của toàn bộ dự án, hỗ trợ sửa đổi trực tiếp các file Backend (C#) và Frontend (TypeScript) đồng bộ và chính xác mà không làm hỏng cấu trúc định dạng hoặc gây lỗi compile.
```

---

## 5. AI đã hỗ trợ em/nhóm ở điểm nào?

Đánh dấu các nội dung phù hợp.

- [x] Hiểu yêu cầu đề bài
- [x] Phân tích bài toán
- [x] Tìm ý tưởng giải pháp
- [ ] Thiết kế database
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
AI đã hỗ trợ thiết kế các endpoint API chuẩn RESTful để xử lý tác vụ gửi thông báo hàng loạt (notify-batch), xây dựng logic nghiệp vụ tìm hóa đơn tương ứng của phòng để làm LinkedId cho thông báo. Ở frontend, AI hỗ trợ kết nối đồng bộ state tin nhắn trong textarea và gọi API khi bấm nút. Đồng thời, AI thiết kế các Custom Modal Confirm có hiệu ứng CSS tốt (fade-in, scale-up) để tăng tính chuyên nghiệp của UI.
```

---

## 6. Phần nào em/nhóm không sử dụng theo gợi ý của AI? Vì sao?

```text
Em đã áp dụng đầy đủ các gợi ý của AI vì các đề xuất đều cực kỳ hợp lý, giải quyết đúng mục tiêu nghiệp vụ và sửa lỗi triệt để mà không gây dư thừa mã nguồn.
```

---

## 7. Em/nhóm đã kiểm tra tính đúng đắn của kết quả AI như thế nào?

```text
Quy trình kiểm chứng được thực hiện như sau:
1. Compile Check: Chạy build dự án backend (dotnet build) thành công. Chạy build frontend (npm run build) biên dịch thành công 100% không phát sinh bất kỳ lỗi compile nào.
2. E2E Testing: 
   - Đăng nhập Owner và Tenant: Thực hiện xóa thông báo, giao diện hiển thị Custom Modal Confirm đúng chuẩn, bấm Xóa bỏ thì thông báo biến mất.
   - Nhấn "Từ chối" ở lời mời nhận phòng của Tenant, modal cảnh báo màu cam hiển thị chính xác.
   - Nhấn "Về trang chủ" ở Avatar dropdown hoặc bấm Logo thương hiệu, URL chuyển về "/" sạch hash, màn hình hiển thị đúng trang chủ.
   - Nhấn "Gửi thông báo nhắc" sau khi tạo hóa đơn thành công trên giao diện chủ nhà: Nhập tin nhắn tùy ý và gửi, tài khoản khách thuê nhận được thông báo dịch vụ ngay lập tức.
   - Khách thuê bấm "Thanh toán ngay" cho hóa đơn: Khi hoàn thành, chủ nhà nhận được thông báo phản hồi thanh toán thành công chính xác.
```

---

## 8. Nếu không có AI, phần nào sẽ khó khăn nhất?

```text
Phần khó khăn nhất là phân tích cách thức tích hợp một nút bấm gửi thông báo hàng loạt trên giao diện tạo hóa đơn hàng loạt sao cho đồng bộ giữa danh sách phòng trọ được chọn và nội dung tin nhắn được nhập trong textarea. AI đã hướng dẫn em kết hợp state của React với payload của API một cách có hệ thống.
```

---

## 9. Sau bài tập/project này, em/nhóm học được gì về môn học?

```text
Em học được:
1. Cách tổ chức phân quyền bảo mật và tạo các endpoint POST nhận DTO phức tạp trong ASP.NET Core API.
2. Cách xây dựng và quản lý hệ thống thông báo hai chiều (tạo và lưu Notification vào cơ sở dữ liệu) để tăng tính tương tác giữa các vai trò người dùng.
3. Cách sử dụng React state để đồng bộ dữ liệu của các modal và textarea phức tạp trong một trang giao diện lớn.
```

---

## 10. Sau bài tập/project này, em/nhóm học được gì về cách sử dụng AI có trách nhiệm?

```text
Sử dụng AI có trách nhiệm là luôn kiểm duyệt nội dung tin nhắn và logic phân quyền. Khi AI đề xuất code gửi thông báo hàng loạt, em cần kiểm tra kỹ xem có bước xác thực `ownerId` đăng nhập để đảm bảo chủ nhà đó chỉ có quyền gửi thông báo nhắc nợ tới khách thuê của chính họ, tránh rò rỉ dữ liệu hoặc quấy nhiễu khách thuê ở các tòa nhà khác.
```

---

## 11. Tự đánh giá mức độ hoàn thành & Điểm tự đánh giá

| Tiêu chí | Điểm tự đánh giá 1-5 | Ghi chú |
|---|:---:|---|
| Ghi nhận việc dùng AI trung thực | 5 | Ghi nhận chi tiết 3 prompt thực tế |
| Prompt có mục tiêu rõ ràng | 5 | Xác định rõ lỗi điều hướng, Custom Modal và hệ thống thông báo |
| Kiểm chứng kết quả AI | 5 | Build thành công và kiểm tra trực quan trên browser |
| Tự chỉnh sửa/cải tiến | 5 | Tự kiểm soát transaction khi tạo thông báo ở Backend |
| Hiểu nội dung đã nộp | 5 | Nắm rõ cơ chế lưu thông báo và cập nhật số lượng badge |
| Reflection có chiều sâu | 5 | Bài học sâu sắc về phân quyền và an toàn dữ liệu |
| Sử dụng AI có trách nhiệm | 5 | Đảm bảo tính nhất quán của giao diện và URL |

---

## 12. Câu hỏi tự vấn cuối bài

### 12.1. Nếu giảng viên hỏi về phần AI đã hỗ trợ, em/nhóm có giải thích lại được không?

```text
Hoàn toàn giải thích được. Em nắm rõ luồng DTO gửi lên, cách service mở transaction, truy vấn hợp đồng, tạo Notification entity và lưu DB, cũng như cơ chế Axios kết nối ở Frontend.
```

### 12.2. Nếu không có AI, em/nhóm có thể tự làm lại phần quan trọng nhất không?

```text
Chắc chắn tự làm lại được vì đây là các kiến thức thiết kế API Controller/Service cơ bản và điều hướng phổ biến trong C# và React.
```

### 12.3. Phần nào trong bài thể hiện rõ nhất năng lực thật sự của em/nhóm?

```text
Năng lực tổ chức hệ thống thông báo hai chiều mượt mà, tự động kết nối logic giữa hành động của chủ nhà (chốt tiền) và khách thuê (thanh toán) một cách nhất quán.
```

### 12.4. Em/nhóm muốn cải thiện kỹ năng nào sau bài này?

```text
Cải thiện khả năng tối ưu hóa truy vấn cơ sở dữ liệu để gửi thông báo hàng loạt nhanh hơn đối với các tòa nhà có hàng trăm phòng trọ.
```

---

## 13. Cam kết Reflection

Em/nhóm cam kết nội dung phản ánh trung thực quá trình học tập.

| Đại diện sinh viên/nhóm | Ngày xác nhận |
|---|---|
| Phan Hoài An | 10/06/2026 |
