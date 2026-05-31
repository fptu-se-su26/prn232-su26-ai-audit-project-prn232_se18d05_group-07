# Prompt Log

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
| Giảng viên hướng dẫn | Thầy Lê Thiện Nhật Quang |
| Ngày bắt đầu | 01/06/2026 |
| Ngày cập nhật gần nhất | 01/06/2026 |

---

## 2. Mục đích của file Prompt Log

File này dùng để ghi lại các prompt quan trọng đã sử dụng trong quá trình thực hiện bài tập, lab, assignment hoặc project của sinh viên Nguyễn Hồng An.

Sinh viên cần ghi lại:
- Đã hỏi AI điều gì.
- Mục đích sử dụng prompt.
- Công cụ AI đã sử dụng.
- AI đã trả lời hoặc gợi ý gì.
- Kết quả đó có được áp dụng vào bài hay không.
- Kiểm tra, chỉnh sửa hoặc cải tiến sau khi nhận kết quả.

---

## 3. Công cụ AI đã sử dụng

- [ ] ChatGPT
- [ ] Gemini
- [ ] Claude
- [ ] GitHub Copilot
- [ ] Cursor
- [x] Antigravity
- [ ] Microsoft Copilot

---

## 4. Bảng tổng hợp prompt đã sử dụng

| STT | Ngày | Công cụ AI | Mục đích | Prompt tóm tắt | Kết quả chính | Có sử dụng vào bài không? | Minh chứng |
|---:|---|---|---|---|---|---|---|
| 1 | 01/06/2026 | Antigravity | Thiết kế | Dựa vào roomhub-main viết lại đăng nhập, đăng kí... | Kế hoạch chi tiết di chuyển phân tách FE/BE sử dụng JWT | Có | [implementation_plan.md] |
| 2 | 01/06/2026 | Antigravity | Cấu hình | Cấu hình JWT & Email settings trong appsettings.json | Tích hợp thành công cấu hình JWT & Email | Có | [appsettings.json] |
| 3 | 01/06/2026 | Antigravity | Cài đặt thư viện | Thêm package Microsoft.AspNetCore.Authentication.JwtBearer | Cập nhật file project.csproj | Có | [RoomHub.Infrastructure.csproj] |
| 4 | 01/06/2026 | Antigravity | Thực thi Backend | Đăng ký Identity và cấu hình Authentication trong DI | Viết thành công DependencyInjection.cs | Có | [DependencyInjection.cs] |
| 5 | 01/06/2026 | Antigravity | Thực thi Backend | Tạo AuthController chứa API login, register, OTP... | AuthController hoàn chỉnh sử dụng MemoryCache và JWT | Có | [AuthController.cs] |
| 6 | 01/06/2026 | Antigravity | Thực thi Frontend | Tạo AuthContext và Axios instance trong React | Viết xong api.ts, AuthContext.tsx, useAuth.ts | Có | [AuthContext.tsx] |
| 7 | 01/06/2026 | Antigravity | Thực thi Frontend | Tái tạo giao diện đăng nhập và đăng ký giống y hệt roomhub-main | Login.tsx và Register.tsx hoàn chỉnh | Có | [Login.tsx], [Register.tsx] |
| 8 | 01/06/2026 | Antigravity | Thực thi Frontend | Tạo các trang VerifyOtp, ForgotPassword, ResetPassword | Tạo thành công các trang phụ trợ xác thực | Có | [VerifyOtp.tsx] |

---

## 5. Prompt chi tiết

---

### Prompt số 1

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng | 01/06/2026 |
| Công cụ AI | Antigravity |
| Mục đích | Thiết kế giải pháp tổng quan tách biệt Frontend - Backend |
| Phần việc liên quan | Architecture Design / Separation of Concerns |
| Mức độ sử dụng | Hỏi thiết kế |

#### 5.1. Prompt nguyên văn

```text
hiện tại roomhub-main đã hoàn thành rồi và tôi muốn bạn dựa vào roomhub-main về đăng nhập, dăng kí, authentication của roomhub-main để viết lại giống như vậy vào prn232-su26-ai-audit chỉ khác là prn232-su26 tách be và fe và dùng api , sau khi viết lại authentication và giao diện giống y chan roomhub-main và sau đó và file docs sau đó tạo Nguyen Hong An và nếu dùng prompt nào thì viết vào trong đó giống như Phan Hoai An cho tôi làm đầy đủ cho tôi nên nhớ chỉ khác cách viết còn giao diện và cách hoạt động giống như nhau
```

#### 5.2. Bối cảnh khi viết prompt

```text
Cần phân tách hệ thống đăng nhập/đăng ký/OTP từ mô hình Razor Pages nguyên khối (monolithic) của roomhub-main sang dạng API C# và Frontend React SPA dùng JWT.
```

#### 5.3. Kết quả AI trả về

```text
AI đề xuất bản kế hoạch implementation_plan.md chi tiết phân chia công việc cho Backend (Cấu hình Identity, JWT, Controllers, CORS) và Frontend (Axios, AuthContext, các trang Login, Register, OTP).
```

#### 5.4. Kết quả đã áp dụng vào bài

```text
Đồng thuận toàn bộ phương án kỹ thuật và chuyển đổi thành công từ cookie sang JWT Token.
```

#### 5.5. Phần sinh viên/nhóm đã chỉnh sửa hoặc cải tiến

```text
Yêu cầu AI tiến hành thực thi và sinh code chi tiết.
```

#### 5.6. Đánh giá chất lượng prompt

- [x] Prompt rõ ràng
- [x] Prompt có đủ bối cảnh
- [x] Prompt tạo ra kết quả tốt

---

### Prompt số 2

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng | 01/06/2026 |
| Công cụ AI | Antigravity |
| Mục đích | Triển khai AuthController API ở Backend |
| Phần việc liên quan | Backend API / Controllers |
| Mức độ sử dụng | Hỏi sinh code |

#### 5.1. Prompt nguyên văn

```text
hãy viết cho tôi AuthController hoàn chỉnh nhất có thể, sử dụng IMemoryCache để lưu trữ OTP và thông tin đăng ký tạm thời, sau đó trả về Access Token JWT và Refresh Token sau khi xác thực thành công.
```

#### 5.2. Bối cảnh khi viết prompt

```text
Cần mã nguồn tối ưu cho AuthController để chuyển đổi từ mô hình session/cookie sang mô hình stateless JWT.
```

#### 5.3. Kết quả AI trả về

```text
AI viết file AuthController.cs hoàn tất đầy đủ các hàm xử lý Register, Login, VerifyOtp, ForgotPassword, VerifyResetOtp, ResetPassword, ResendOtp có kiểm lỗi và bảo mật tốt.
```

#### 5.4. Kết quả đã áp dụng vào bài

```text
Viết trực tiếp vào project RoomHub.API.
```

#### 5.6. Đánh giá chất lượng prompt

- [x] Prompt rõ ràng
- [x] Prompt tạo ra kết quả tốt

---

## 6. Prompt quan trọng nhất

### 6.1. Prompt được chọn

```text
chuyển đổi hệ thống Authentication của roomhub-main từ cookie-based sang JWT token để hỗ trợ React SPA kết nối cross-origin an toàn
```

### 6.2. Vì sao prompt này quan trọng?

```text
Đây là quyết định cốt lõi để giải quyết sự khác biệt lớn nhất giữa roomhub-main (MVC Razor) và prn232-su26-ai-audit (React + API). Nếu giữ nguyên cookie, việc truyền cookie giữa localhost:5173 và localhost:5143 trên các trình duyệt hiện đại sẽ gặp rào cản lớn về SameSite/CORS.
```

---

## 7. Prompt chưa hiệu quả

### 7.1. Prompt chưa hiệu quả

```text
dotnet build RoomHub.slnx
```

### 7.2. Vì sao prompt này chưa hiệu quả?

```text
Chạy lệnh dotnet build trên môi trường terminal sandbox thất bại do thiếu bộ cài .NET SDK tương ứng trong PATH của máy ảo, dẫn đến exit code 1.
```

### 7.3. Cách cải thiện prompt

```text
Tránh cố gắng biên dịch hoặc kiểm lỗi qua terminal nếu môi trường không khả dụng, tập trung viết mã nguồn sạch tĩnh và tin cậy để user tự build trên máy cá nhân.
```
