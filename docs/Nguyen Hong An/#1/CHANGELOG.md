# Changelog

## 1. Quy định ghi Changelog

File này dùng để ghi lại các thay đổi quan trọng trong quá trình thực hiện bài tập, lab, assignment hoặc project của sinh viên Nguyễn Hồng An.

Nguyên tắc ghi changelog:
- Chỉ ghi những gì đã hoàn thành thật sự.
- Không ghi kế hoạch nếu chưa thực hiện.
- Mỗi thay đổi có ngày, nội dung, người thực hiện và minh chứng.
- Nếu có AI hỗ trợ, cần ghi rõ AI đã hỗ trợ phần nào.

---

## 2. Thông tin project

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
| Repository URL | https://github.com/fptu-se-su26/prn232-su26-ai-audit-project-prn232_se18d05_group-07 |
| Ngày bắt đầu | 01/06/2026 |
| Ngày hoàn thành | 01/06/2026 |

---

## 3. Tổng quan các phiên bản/giai đoạn

| Phiên bản/Giai đoạn | Thời gian | Nội dung chính | Trạng thái |
|---|---|---|---|
| Phase 01 | 28/05/2026 | Khởi tạo cấu trúc dự án phẳng (Backend & Frontend) | Completed |
| Phase 02 | 30/05/2026 | Phân tích yêu cầu | Completed |
| Phase 03 | 31/05/2026 | Thiết kế hệ thống | Completed |
| Phase 04 | 01/06/2026 | Implementation: Di chuyển & Phân tách hệ thống Xác thực (Auth Separation) | Completed |
| Phase 05 |  | Testing & Debug | Not Started |
| Phase 06 |  | Hoàn thiện báo cáo và demo | Not Started |

---

# [Phase 04] Di chuyển & Phân tách hệ thống Xác thực (Auth Separation)

## Ngày thực hiện

```text
01/06/2026
```

## Đã hoàn thành

- [x] Cấu hình JWT Settings & SMTP Email Settings ở API Backend
- [x] Cài đặt package `Microsoft.AspNetCore.Authentication.JwtBearer`
- [x] Cấu hình Identity, CORS policy, DbContext & JwtBearer Authentication trong Middleware
- [x] Tạo lớp tạo token JWT `JwtTokenGenerator` và gửi email OTP `EmailService`
- [x] Viết các DTOs xác thực (`LoginRequest`, `RegisterRequest`, `AuthResponse`...)
- [x] Viết `AuthController.cs` xử lý đăng ký, kích hoạt OTP, đăng nhập, quên và đổi mật khẩu
- [x] Tạo Axios client `api.ts` kết nối tới API Backend (cổng 5143)
- [x] Lập trình `AuthContext.tsx` và hook `useAuth.ts` quản lý state đăng nhập
- [x] Tái tạo chính xác giao diện các trang xác thực (Login, Register, VerifyOtp, ForgotPassword, VerifyResetOtp, ResetPassword, VerifySuccess)
- [x] Tích hợp đăng nhập, đăng ký và đăng xuất trên thanh điều hướng `Navbar`
- [x] Đồng bộ các hình ảnh assets và sửa lỗi thẻ class JSX

## Thay đổi chi tiết

| STT | Nội dung thay đổi | Người thực hiện | File/Module liên quan | Minh chứng |
|---:|---|---|---|---|
| 1 | Thêm `JwtSettings` và `EmailSettings` vào cấu hình | Nguyễn Hồng An | `RoomHub.API/appsettings.json` | Commit Git |
| 2 | Cấu hình dịch vụ Identity, Jwt Authentication, CORS trong DI & Program | Nguyễn Hồng An | `DependencyInjection.cs`, `Program.cs` | Commit Git |
| 3 | Thêm package tham chiếu JwtBearer | Nguyễn Hồng An | `RoomHub.Infrastructure.csproj` | Commit Git |
| 4 | Viết các lớp dịch vụ phát hành token và gửi mail SMTP | Nguyễn Hồng An | `JwtTokenGenerator.cs`, `EmailService.cs` | Commit Git |
| 5 | Tạo bộ khung API Auth Controller xử lý RESTful endpoints | Nguyễn Hồng An | `AuthController.cs` | Commit Git |
| 6 | Tạo Axios interceptor truyền header Authorization Bearer | Nguyễn Hồng An | `RoomHub.Frontend/src/services/api.ts` | Commit Git |
| 7 | Viết Context quản lý session đăng nhập và gọi API tương ứng | Nguyễn Hồng An | `AuthContext.tsx`, `useAuth.ts` | Commit Git |
| 8 | Thiết kế giao diện đăng nhập (có slider chuyển ảnh 4s) và đăng ký (có checkbox validation mật khẩu) | Nguyễn Hồng An | `Login.tsx`, `Register.tsx` | Commit Git |
| 9 | Lập trình các giao diện nhập OTP 6 số tự động nhảy focus, quên mật khẩu và đặt lại mật khẩu | Nguyễn Hồng An | `VerifyOtp.tsx`, `ForgotPassword.tsx`, `VerifyResetOtp.tsx`, `ResetPassword.tsx`, `VerifySuccess.tsx` | Commit Git |
| 10 | Điều chỉnh logic hiển thị nút đăng nhập/đăng ký/đăng xuất và thông tin user | Nguyễn Hồng An | `App.tsx`, `Navbar.tsx` | Commit Git |
| 11 | Điều chỉnh vị trí của "Chưa có tài khoản? Đăng ký" nằm căn giữa ngay dưới nút đăng nhập bằng Facebook | Nguyễn Hồng An | `Login.tsx` | Commit Git |

## AI có hỗ trợ không?

- [x] Có
- [ ] Không

Nếu có, mô tả AI đã hỗ trợ phần nào:

```text
AI trợ lý Antigravity hỗ trợ thiết kế toàn diện phương án di chuyển từ cookie-based sang JWT token. AI tự động tạo mã nguồn của các DTOs xác thực, AuthController phía Backend; thiết lập Axios client, AuthContext, và toàn bộ 7 trang giao diện ở Frontend đồng nhất 100% với phong cách Tailwind CSS của dự án roomhub-main gốc.
```

## Commit/Screenshot minh chứng

```text
Toàn bộ source code đã được sinh đầy đủ tại các thư mục RoomHub.Backend và RoomHub.Frontend.
```

## Ghi chú

```text
Việc chuyển từ cookie sang JWT giúp bảo mật truyền tải thông tin đăng nhập trong kiến trúc microservice hoặc tách biệt FE/BE tốt hơn, tránh hoàn toàn lỗi cross-origin (CORS) của các trình duyệt hiện đại.
```

---

## 4. Tổng kết thay đổi cuối project

### 4.1. Các chức năng đã hoàn thành

| STT | Chức năng | Trạng thái | Minh chứng | Ghi chú |
|---|---|---|---|---|
| 1 | Xác thực Đăng nhập & Đăng ký phân tách FE-BE | Completed | AuthController API & React Context | Đầy đủ chức năng |
| 2 | Kích hoạt tài khoản bằng mã OTP gửi qua email | Completed | EmailService SMTP & 6-input box | Kích hoạt thực tế |
| 3 | Quên mật khẩu & Đặt lại mật khẩu qua OTP | Completed | Reset endpoints & Reset view | Bảo mật cao |
| 4 | Trạng thái người dùng và Đăng xuất hiển thị trên Navbar | Completed | Navbar hooks | Tích hợp sâu |

---

## 5. Cam kết cập nhật Changelog

Sinh viên cam kết rằng nội dung changelog phản ánh đúng các thay đổi thực tế đã thực hiện.

| Sinh viên xác nhận | Ngày xác nhận |
|---|---|
| Nguyễn Hồng An | 01/06/2026 |
