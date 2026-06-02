# AI Learning Reflection

## 1. Thông tin chung

| Thông tin | Nội dung |
|---|---|
| Môn học | Lập trình C# |
| Mã môn học | PRN232 |
| Lớp | SE18D05 |
| Học kỳ | SU26 |
| Tên bài tập / Project | RoomHub - Quản lý phòng/nhà trọ (Tách biệt FE-BE) |
| Tên sinh viên / Nhóm | Nguyễn Hồng An / Nhóm 07 |
| MSSV / Danh sách MSSV | DE180999 |
| Giảng viên hoàn thành reflection | 01/06/2026 |

---

## 2. Mục Đích Reflection

File này dùng để sinh viên Nguyễn Hồng An tự đánh giá quá trình sử dụng AI trong học tập và thực hiện bài tập di chuyển tách biệt hệ thống xác thực.

Reflection thể hiện:
- AI hỗ trợ gì trong quá trình học.
- Sinh viên kiểm chứng kết quả AI thế nào.
- Sinh viên tự chỉnh sửa, cải tiến ra sao.
- Sinh viên học được gì về môn học.
- Sinh viên học được gì về cách sử dụng AI minh bạch và có trách nhiệm.

---

## 3. Tóm tắt quá trình sử dụng AI

```text
Trong Phase 04: Di chuyển & Phân tách hệ thống Xác thực, em đã đồng hành cùng trợ lý AI Antigravity để viết lại cơ chế login, register, OTP email verification, và forgot/reset password từ roomhub-main gốc sang hệ thống tách biệt FE-BE. Ở Backend, AI đã hỗ trợ thiết kế cấu hình Identity JWT, CORS, và triển khai các API endpoint trong AuthController.cs sử dụng IMemoryCache. Ở Frontend, AI hỗ trợ sinh mã nguồn Axios client, AuthContext React và trọn bộ 7 trang giao diện Tailwind CSS (Login, Register, VerifyOtp, ForgotPassword, VerifyResetOtp, ResetPassword, VerifySuccess) có đầy đủ các tính năng slider ảnh, dynamic checklist mật khẩu, và OTP box navigation. Em đã rà soát, sửa lỗi thuộc tính class và tích hợp thành công vào Navbar.
```

---

## 4. Công cụ AI đã sử dụng

- [ ] ChatGPT
- [ ] Gemini
- [ ] Claude
- [ ] GitHub Copilot
- [ ] Cursor
- [x] Antigravity
- [ ] Microsoft Copilot

### Công cụ được sử dụng nhiều nhất

```text
Antigravity
```

---

## 5. AI đã hỗ trợ em ở điểm nào?

- [x] Hiểu yêu cầu đề bài
- [x] Phân tích bài toán
- [x] Tìm ý tưởng giải pháp
- [ ] Thiết kế database
- [x] Thiết kế giao diện
- [x] Thiết kế kiến trúc hệ thống
- [x] Viết code mẫu
- [x] Debug lỗi
- [ ] Viết test case
- [x] Review code
- [x] Tối ưu code
- [x] Kiểm tra bảo mật
- [x] Viết báo cáo
- [x] Tìm hiểu công nghệ mới

---

## 6. AI có giúp em học tốt hơn không?

### 6.1. Những điểm AI giúp em học tốt hơn

- Giúp tiếp cận và thực hiện thành công cơ chế xác thực JWT Stateless chuyên nghiệp, hiểu cách liên kết Access Token và Refresh Token để duy trì trạng thái đăng nhập.
- Hiểu cách cấu hình CORS trong ASP.NET Core API để cho phép các domain Frontend khác nhau truy cập tài nguyên.
- Biết cách tối ưu hóa trải nghiệm người dùng phía React thông qua việc đồng bộ các input OTP và xử lý sự kiện paste clipboard.

### 6.2. Những điểm AI chưa giúp tốt hoặc gây khó khăn

- AI thỉnh thoảng viết nhầm mã nguồn C# vào tệp TypeScript hoặc sử dụng thuộc tính `class` thay vì `className` trong JSX, buộc em phải đọc kỹ mã nguồn và chỉnh sửa lại thủ công.

### 6.3. Em có bị phụ thuộc vào AI không?

- [x] Không phụ thuộc

Giải thích:

```text
Em hoàn toàn kiểm soát mã nguồn. Em trực tiếp chỉ đạo di chuyển từ cơ chế cookie-based sang JWT, tự tay cấu hình các cổng kết nối (localhost:5143), rà soát các DTOs xác thực để bảo đảm khớp nối chính xác với DB và sửa các lỗi cú pháp JSX trước khi đưa vào chạy thử.
```

---

## 7. Em đã kiểm tra kết quả AI như thế nào?

- Kiểm duyệt tĩnh chất lượng code trên IDE (Visual Studio Code).
- Kiểm tra các endpoint API trên Swagger UI xem tài liệu OpenAPI có hiển thị các route `/api/auth` đầy đủ hay không.

---

## 8. Ví dụ AI gợi ý sai hoặc chưa phù hợp

| Nội dung | Mô tả |
|---|---|
| AI đã gợi ý gì? | Viết nhầm cú pháp `<p class="...">` trong file React `Login.tsx` và directive C# `using System;` trong file `api.ts` |
| Vì sao gợi ý đó sai/chưa phù hợp? | Gây ra lỗi biên dịch TypeScript (React không dùng class làm thuộc tính HTML và ts file không chạy code C#) |
| Em phát hiện bằng cách nào? | Đọc trực tiếp code vừa được sinh ra trên IDE |
| Em đã sửa như thế nào? | Chuyển `class` thành `className` và xóa bỏ `using System;` |
| Bài học rút ra | Luôn rà soát và kiểm duyệt tỉ mỉ từng dòng code AI sinh ra trước khi chạy thử để tránh các lỗi biên dịch cơ bản. |

---

## 9. Phần đóng góp thật sự của sinh viên

```text
- Định hướng chuyển đổi kiến trúc Authentication sang JWT để tối ưu hóa truyền nhận dữ liệu cross-origin.
- Tổ chức quản lý state đăng nhập trên React bằng Context Provider.
- Fix các lỗi JSX compile và cấu hình CORS chặt chẽ ở API.
- Tài liệu hóa toàn bộ quá trình đóng góp.
```

---

## 10. So sánh trước và sau khi dùng AI

| Nội dung | Trước khi dùng AI | Sau khi dùng AI | Cải thiện đạt được |
|---|---|---|---|
| Hiểu yêu cầu | Biết cách viết của RoomHub gốc | Có hướng đi phân tách FE-BE API rõ ràng | Tự tin chuyển đổi cấu trúc |
| Phân tích bài toán | Khó hình dung cách lưu trữ OTP stateless | Sử dụng giải pháp IMemoryCache ở Backend | Giải quyết triệt để vấn đề lưu trữ tạm |
| Code/Implementation | Mất nhiều thời gian dựng 7 giao diện và APIs | Toàn bộ giao diện và APIs được tạo hoàn tất | Tiết kiệm hơn 5 tiếng code liên tục |
| Báo cáo/Changelog | Soạn báo cáo thủ công | Có bộ log prompt và changelog đầy đủ | Báo cáo bài bản, nhanh gọn |

---

## 11. Bài học về môn học

```text
- Hiểu được tầm quan trọng của việc tách rời giao diện (Presentation) và nghiệp vụ (Business Logic).
- Nắm rõ cách thức hoạt động của Token-based Authentication trong .NET Core API và cách duy trì trạng thái đăng nhập ở client React.
```

---

## 12. Bài học về sử dụng AI có trách nhiệm

```text
- Sử dụng AI làm trợ lý tăng hiệu suất, không sao chép vô tội vạ.
- Cần khai báo trung thực các lần sử dụng AI và ghi nhận bài học kinh nghiệm.
- Kiểm duyệt chất lượng sản phẩm cuối cùng là trách nhiệm của lập trình viên.
```

---

## 13. Điều em sẽ không làm khi sử dụng AI

- [x] Không dùng AI để làm toàn bộ bài mà không hiểu nội dung.
- [x] Không nộp nguyên văn kết quả AI nếu chưa kiểm tra.
- [x] Không che giấu việc sử dụng AI trong các phần quan trọng.

---

## 14. Kế hoạch cải thiện lần sau

```text
Lần sau sẽ chia nhỏ các file giao diện thành nhiều sub-components nhỏ hơn để dễ kiểm soát lỗi cú pháp React và tối ưu hóa hiệu suất re-render của trang.
```

---

## 15. Tự đánh giá mức độ hoàn thành

| Tiêu chí | Điểm tự đánh giá 1-5 | Ghi chú |
|---|:---:|---|
| Ghi nhận việc dùng AI trung thực | 5 | Ghi chép chi tiết |
| Kiểm chứng kết quả AI | 5 | Rà soát lỗi cú pháp hoàn tất |
| Tự chỉnh sửa/cải tiến | 5 | Tích hợp thành công vào Navbar |
| Hiểu nội dung đã nộp | 5 | Nắm vững cấu trúc auth JWT |

---

## 16. Cam kết Reflection

Sinh viên cam kết nội dung reflection phản ánh trung thực quá trình học và làm việc cùng AI.

| Sinh viên xác nhận | Ngày xác nhận |
|---|---|
| Nguyễn Hồng An | 01/06/2026 |
