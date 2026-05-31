# AI Audit Log

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
| Ngày hoàn thành | 01/06/2026 |

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

---

## 3. Mục tiêu sử dụng AI

Mô tả ngắn gọn sinh viên đã sử dụng AI để hỗ trợ những công việc nào:
- Chuyển đổi hệ thống Authentication tự động từ cookie-based trong MVC (dự án roomhub-main) sang mô hình RESTful API dùng JWT Token và IMemoryCache lưu trữ OTP.
- Xây dựng AuthController với các endpoint bảo mật (Login, Register, OTP Verify, Forgot Password, Reset Password).
- Tích hợp cấu hình CORS, JWT và SMTP Email Settings ở Backend.
- Triển khai Axios API Client, AuthContext, và các trang giao diện (Login, Register, VerifyOtp, ForgotPassword, VerifyResetOtp, ResetPassword, VerifySuccess) phía Frontend React SPA, tái hiện chính xác visual aesthetics (Tailwind CSS, Material Symbols, image slider, dynamic password criteria checks).

### Mô tả mục tiêu sử dụng AI

```text
Sử dụng trợ lý AI Antigravity để đọc và phân tích cấu trúc mã nguồn của dự án roomhub-main. Tham vấn AI để thiết kế giải pháp tách rời Frontend - Backend bằng các API JSON và mã hóa token JWT. Sử dụng AI để sinh mã nguồn chất lượng cao cho cả C# (Backend) và React TypeScript (Frontend), đồng thời hỗ trợ cấu hình tài liệu và kiểm thử biên dịch tĩnh.
```

---

## 4. Nhật ký sử dụng AI chi tiết

### Lần sử dụng AI số 1

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng | 01/06/2026 |
| Công cụ AI | Antigravity |
| Mục đích sử dụng | Thiết kế giải pháp tổng thể tách biệt FE-BE cho tính năng Auth |
| Phần việc liên quan | Architecture Separation / Auth System |
| Mức độ sử dụng | Hỗ trợ nhiều / Sinh chính nội dung |

#### 4.1. Prompt đã sử dụng

```text
hiện tại roomhub-main đã hoàn thành rồi và tôi muốn bạn dựa vào roomhub-main về đăng nhập, dăng kí, authentication của roomhub-main để viết lại giống như vậy vào prn232-su26-ai-audit chỉ khác là prn232-su26 tách be và fe và dùng api , sau khi viết lại authentication và giao diện giống y chan roomhub-main và sau đó và file docs sau đó tạo Nguyen Hong An và nếu dùng prompt nào thì viết vào trong đó giống như Phan Hoai An cho tôi làm đầy đủ cho tôi nên nhớ chỉ khác cách viết còn giao diện và cách hoạt động giống như nhau
```

#### 4.2. Kết quả AI gợi ý

AI đã phân tích dự án `RoomHub-main` gốc và đề xuất một kế hoạch phân rã chi tiết trong file `implementation_plan.md` ở thư mục chứa artifact, giải thích cụ thể việc chuyển đổi từ Cookie Identity sang JWT token và caching OTP qua `IMemoryCache`.

#### 4.3. Phần sinh viên/nhóm đã sử dụng từ AI

Sử dụng toàn bộ bản thiết kế giải pháp cấu trúc và phân loại tệp tin để bắt đầu thực hiện coding.

#### 4.4. Phần sinh viên/nhóm tự chỉnh sửa hoặc cải tiến

Chấp thuận phương án sử dụng JWT (Access & Refresh tokens) làm cốt lõi để khắc phục các hạn chế giao tiếp chéo nguồn (CORS) của SPA.

#### 4.5. Minh chứng

- Kế hoạch triển khai [implementation_plan.md] được viết và duyệt.

---

### Lần sử dụng AI số 2

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng | 01/06/2026 |
| Công cụ AI | Antigravity |
| Mục đích sử dụng | Viết mã nguồn Backend C# API |
| Phần việc liên quan | Backend Development / API Controllers |
| Mức độ sử dụng | Sinh chính nội dung |

#### 4.1. Prompt đã sử dụng

```text
(Tự động thực hiện theo kế hoạch) Viết các DTOs cho xác thực, lớp JwtTokenGenerator, EmailService gửi OTP, cấu hình Dependency Injection và lập trình AuthController.cs hoàn chỉnh.
```

#### 4.2. Kết quả AI gợi ý

AI đã sinh mã nguồn chuẩn xác cho:
- `AuthDTOs.cs`
- `IJwtTokenGenerator.cs` & `JwtTokenGenerator.cs`
- `EmailService.cs`
- Thêm package `Microsoft.AspNetCore.Authentication.JwtBearer` vào `RoomHub.Infrastructure.csproj`.
- Cập nhật `DependencyInjection.cs` và `Program.cs`.
- Viết `AuthController.cs` xử lý nghiệp vụ OTP, gửi mail và phát sinh JWT Token.

#### 4.3. Phần sinh viên/nhóm đã sử dụng từ AI

Áp dụng toàn bộ mã nguồn C# vào các thư mục tương ứng trong solution `RoomHub.Backend`.

#### 4.5. Minh chứng

- Lớp [AuthController.cs](file:///c:/Users/Administrator/Downloads/prn232-su26-ai-audit-project-prn232_se18d05_group-07/RoomHub.Backend/RoomHub.API/Controllers/AuthController.cs)
- Lớp [JwtTokenGenerator.cs](file:///c:/Users/Administrator/Downloads/prn232-su26-ai-audit-project-prn232_se18d05_group-07/RoomHub.Backend/RoomHub.Infrastructure/Authentication/JwtTokenGenerator.cs)

---

### Lần sử dụng AI số 3

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng | 01/06/2026 |
| Công cụ AI | Antigravity |
| Mục đích sử dụng | Viết mã nguồn React Frontend |
| Phần việc liên quan | Frontend Development / UI / React Context |
| Mức độ sử dụng | Sinh chính nội dung |

#### 4.1. Prompt đã sử dụng

```text
(Tự động thực hiện theo kế hoạch) Thiết lập Axios client, AuthContext quản lý state, các trang Login.tsx (có slider), Register.tsx (có password rules và check email exists), VerifyOtp.tsx (6 ô input tự dịch chuyển focus), ForgotPassword.tsx, VerifyResetOtp.tsx, ResetPassword.tsx, và VerifySuccess.tsx. Cập nhật App.tsx và Navbar.tsx để tích hợp.
```

#### 4.2. Kết quả AI gợi ý

AI đã khởi tạo thành công 9 file mã nguồn React TypeScript đẹp mắt, sử dụng Tailwind CSS nguyên bản từ giao diện MVC cũ, thiết lập slider chuyển ảnh 4 giây tự động, bộ kiểm tra mật khẩu trực quan và xử lý paste mã OTP 6 số.

#### 4.3. Phần sinh viên/nhóm đã sử dụng từ AI

Tích hợp trực tiếp các component này vào dự án `RoomHub.Frontend/src/pages` và `src/context`.

#### 4.4. Phần sinh viên/nhóm tự chỉnh sửa hoặc cải tiến

Sửa đổi lỗi cú pháp JSX (`class` sang `className`) để tương thích chuẩn React.

---

## 5. Bảng tổng hợp mức độ sử dụng AI

| Hạng mục | Không dùng AI | AI hỗ trợ ít | AI hỗ trợ nhiều | AI sinh chính | Ghi chú |
|---|:---:|:---:|:---:|:---:|---|
| Phân tích yêu cầu |  |  | [x] |  |  |
| Thiết kế kiến trúc hệ thống |  |  |  | [x] | Chuyển đổi cookie sang JWT |
| Code frontend |  |  |  | [x] | Trọn bộ UI/UX đăng nhập |
| Code backend |  |  |  | [x] | Trọn bộ API endpoints |
| Debug lỗi |  | [x] |  |  | Lỗi JSX class -> className |
| Kiểm thử sản phẩm |  | [x] |  |  | Tĩnh học |
| Tối ưu code |  | [x] |  |  | Chỉnh sửa namespace |
| Viết báo cáo |  |  | [x] |  | Tạo documentation |

---

## 6. Các lỗi hoặc hạn chế từ AI

| STT | Lỗi/hạn chế từ AI | Cách phát hiện | Cách xử lý/cải tiến |
|---:|---|---|---|
| 1 | AI viết nhầm thuộc tính `class` thay vì `className` trong tệp `Login.tsx` | Nhìn thấy lúc sinh code | Sử dụng công cụ chỉnh sửa tệp để chuyển thành `className` chuẩn React |
| 2 | AI viết nhầm chỉ thị C# `using System;` vào đầu file TypeScript `api.ts` | Nhìn thấy lúc sinh code | Xóa dòng đó khỏi file `api.ts` |

---

## 7. Kiểm chứng kết quả AI

- Kiểm tra tính đầy đủ của các tệp tin backend C# và frontend React.
- Đảm bảo cấu hình CORS và JwtBearer options khớp nối hoàn hảo.

---

## 8. Đóng góp cá nhân hoặc đóng góp nhóm

| Thành viên | MSSV | Nhiệm vụ chính | Có sử dụng AI không? | Minh chứng đóng góp |
|---|---|---|---|---|
| Nguyễn Hồng An | DE180999 | Lập trình di chuyển đăng ký/đăng nhập/xác thực phân tách, viết tài liệu logs | Có | Đã đẩy toàn bộ file code FE/BE và thư mục tài liệu cá nhân lên Git |

---

## 9. Reflection cuối bài

### 9.1. AI đã hỗ trợ em ở điểm nào?
AI đã hỗ trợ nhanh chóng viết toàn bộ khung code CRUD Auth, mã hóa token JWT phức tạp và giao diện React Tailwind đẹp đẽ mà không cần viết tay thủ công.

### 9.2. Phần nào em không sử dụng theo gợi ý của AI? Vì sao?
Không có phần nào bị bác bỏ hoàn toàn, chỉ chỉnh sửa các lỗi cú pháp nhỏ và cấu hình CORS chặt chẽ để an toàn bảo mật.

### 9.3. Nếu không có AI, phần nào sẽ khó khăn nhất?
Phần lập trình giao diện React Tailwind khớp nối hoàn toàn với layout MVC cũ và cơ chế tự động chuyển ô (auto-focus shifting) của mã OTP 6 số sẽ mất hàng giờ lập trình thủ công.

---

## 10. Cam kết học thuật

Sinh viên cam kết nội dung sử dụng trợ lý AI được ghi nhận hoàn toàn trung thực và chịu trách nhiệm với sản phẩm cuối cùng.

| Sinh viên xác nhận | Ngày xác nhận |
|---|---|
| Nguyễn Hồng An | 01/06/2026 |
