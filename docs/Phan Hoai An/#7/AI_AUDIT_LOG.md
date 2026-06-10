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
| Ngày bắt đầu | 10/06/2026 |
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

- Xây dựng tính năng xóa thông báo cho Chủ nhà (Owner) bằng cách tích hợp gọi API DELETE và cập nhật state thông báo tương ứng.
- Thiết kế và xây dựng Custom Modal Confirm xóa thông báo (áp dụng cho cả Chủ nhà và Khách thuê) và Modal Confirm từ chối nhận phòng (ở Khách thuê) để thay thế hoàn toàn cho hộp thoại `window.confirm` mặc định của trình duyệt nhằm ngăn chặn việc hiển thị thông báo "localhost says...".
- Sửa lỗi điều hướng "Về trang chủ" từ giao diện bảng điều khiển (Dashboard) của cả Chủ nhà và Khách thuê, đảm bảo URL chuyển hẳn về `/` (chuẩn và sạch hash `#/...`) và hiển thị đúng component Trang chủ thay vì hiển thị trang Tìm chỗ ở.
- Cập nhật Navbar chính để tự động xóa hash (`window.location.hash = ''`) khi người dùng điều hướng sang các trang công cộng thông qua click menu Navbar hoặc click Logo.
- Kiểm duyệt và biên dịch thành công toàn bộ Frontend.

---

## 4. Nhật ký sử dụng AI chi tiết

---

### Lần sử dụng AI số 1

| Nội dung | Thông tin |
|---|---|
| Giai đoạn | Phát triển tính năng Thông báo & Khắc phục lỗi điều hướng / Phase 09 |
| Ngày sử dụng | 10/06/2026 |
| Công cụ AI | Antigravity |
| Mục đích sử dụng | Lập kế hoạch thêm tính năng xóa thông báo cho Chủ nhà và sửa lỗi nút Về trang chủ |
| Phần việc liên quan | Frontend Components (Navbar, OwnerLayout, TenantLayout, Owner Notifications) |
| Mức độ sử dụng | Hỗ trợ nhiều / Lập kế hoạch triển khai |

#### 4.1. Prompt đã sử dụng

```text
tiếp theo bổ sung tính năng có thể xóa thông báo, và hiện tại bạn hãy giúp tôi chỉnh sửa nội dung sau đây hiện tại khi nhấn mục về trang chủ ở trong giao diện bảng điều khiển thì nó đang nhảy ra trang giao diện tìm chỗ ở nhưng có vấn đề là đường dẫn thì không thay đổi nó vẫn đang giữ nguyên đường dẫn trong trang bảng điều khiển bạn hãy giup stooi cập nhật lại khi nhấn mục về trang chủ thì saex thực hiện trả về trang chủ chứ không phải trang tìm chỗ ở đồng thời đường dẫn url phải chuẩn với trang chủ luôn, hãy phân tich sthataj kĩ và thực hiện cập nhật chỉnh sửa
```

#### 4.2. Kết quả AI gợi ý

AI phân tích và đề xuất giải pháp chi tiết:
- Thêm API delete thông báo và giao diện icon thùng rác cho Owner giống như Tenant.
- Ở các nút "Về trang chủ" trong dropdown avatar của Owner và Tenant Layout, cần làm sạch hash `window.location.hash = ''`, gọi `navigate('/')` và cập nhật state `setCurrentPage('home')`.
- Cập nhật Navbar ở các sự kiện `navTo` và click Logo để xóa hash trước khi `navigate` về bất cứ trang public nào, ngăn chặn việc giữ nguyên hash dashboard khi di chuyển sang trang khác.

#### 4.3. Phần sinh viên/nhóm đã sử dụng từ AI

Sử dụng toàn bộ đề xuất phân tích và phương án thiết kế để khắc phục lỗi điều hướng và bổ sung tính năng xóa thông báo.

#### 4.4. Minh chứng

- Kế hoạch triển khai được phê duyệt: [implementation_plan.md](file:///C:/Users/DELL/.gemini/antigravity-ide/brain/8eb729ba-a8a8-4188-a2d7-abba7ad4632f/implementation_plan.md)

---

### Lần sử dụng AI số 2

| Nội dung | Thông tin |
|---|---|
| Giai đoạn | Hiện thực hóa Custom Modal & Sửa mã nguồn / Phase 09 |
| Ngày sử dụng | 10/06/2026 |
| Công cụ AI | Antigravity |
| Mục đích sử dụng | Thay đổi window.confirm mặc định bằng Custom Modal Confirm và viết code triển khai |
| Phần việc liên quan | Owner Notifications, Tenant Notifications, Layouts & Navbar Components |
| Mức độ sử dụng | Hỗ trợ nhiều / Sinh chính nội dung |

#### 4.1. Prompt đã sử dụng

```text
chỉnh sửa lại khi thực hiện xóa thông báo hãy thực hiện hiển thị confirrm gì đó chứ đừng hiển thị localhost says
```

#### 4.2. Kết quả AI gợi ý

AI thiết kế và cập nhật code:
- Thêm state quản lý `deleteTargetId` (ID của thông báo đang muốn xóa) và `rejectTargetId` (ID của thông báo mời nhận phòng cần từ chối).
- Dựng các Custom Modal xác nhận xóa và từ chối nhận phòng bằng React State kết hợp với CSS/Tailwind tạo hiệu ứng fade-in và scale-up cực kỳ chuyên nghiệp.
- Khi người dùng nhấn xác nhận trong Modal mới thực tế gọi các API tương ứng (`DELETE /api/notifications/{id}` và `POST /api/tenant/room/reject`).
- Sửa đổi trực tiếp các file code: `OwnerLayout.tsx`, `TenantLayout.tsx`, `Navbar.tsx`, `pages/owner/Notifications.tsx`, và `pages/tenant/Notifications.tsx`.

#### 4.3. Phần sinh viên/nhóm đã sử dụng từ AI

Sử dụng toàn bộ mã nguồn Frontend do AI đề xuất và sinh ra.

#### 4.4. Minh chứng

- Files liên quan: `OwnerLayout.tsx`, `TenantLayout.tsx`, `Navbar.tsx`, `src/pages/owner/Notifications.tsx`, `src/pages/tenant/Notifications.tsx`

---

## 5. Mức độ sử dụng AI trong các hạng mục dự án

| Hạng mục | Không dùng AI | AI hỗ trợ ít | AI hỗ trợ nhiều | AI sinh chính | Ghi chú |
|---|:---:|:---:|:---:|:---:|---|
| Phân tích yêu cầu |  |  | [x] |  | Phân tích hành vi hash-routing |
| Database / ERD | [x] |  |  |  | Không thay đổi CSDL |
| Thiết kế giao diện |  |  | [x] |  | Xây dựng Custom Modal Confirm |
| Code frontend |  |  | [x] |  | Cập nhật Notifications.tsx, Layouts, Navbar.tsx |
| Code backend | [x] |  |  |  | Tái sử dụng API DELETE có sẵn |
| Debug lỗi |  | [x] |  |  |  |
| Kiểm thử sản phẩm |  | [x] |  |  |  |
| Viết báo cáo |  |  | [x] |  | Tạo tài liệu học thuật đợt 7 |

---

## 6. Các lỗi hoặc hạn chế từ AI

- Không phát sinh lỗi biên dịch hay Exception nào trong đợt cập nhật này nhờ AI nắm bắt chính xác các trạng thái và định dạng dữ liệu của dự án.

---

## 7. Kiểm chứng kết quả AI

- Chạy thành công lệnh `npm run build` ở Frontend kiểm duyệt hoàn tất không có lỗi kiểu dữ liệu TypeScript.
- Thực hiện kiểm chứng nghiệp vụ:
  1. Đăng nhập tài khoản Owner/Tenant, truy cập trung tâm thông báo và thực hiện xóa một thông báo bất kỳ.
  2. Giao diện hiển thị Custom Modal Confirm đẹp mắt với nút Hủy và Xóa bỏ. Bấm Xóa bỏ, thông báo được xóa ngay lập tức khỏi UI và số lượng thông báo trên chuông được cập nhật giảm đi chính xác. Không hiển thị cảnh báo mặc định của trình duyệt (`localhost says`).
  3. Bấm nút "Từ chối" nhận phòng ở Tenant, Custom Modal Confirm màu cam hiển thị chính xác cảnh báo lời mời bị hủy vĩnh viễn.
  4. Từ các trang con của dashboard, nhấn "Về trang chủ" trong avatar dropdown. URL lập tức chuyển hẳn thành `http://localhost:5173/` (sạch hash) và giao diện render đúng trang chủ RoomHub.
  5. Bấm vào Logo RoomHub hoặc các link menu như "Tìm chỗ ở" từ Navbar khi đang ở trong dashboard, URL chuyển đổi tương ứng mượt mà và sạch hash.

---

## 8. Cam kết học thuật

Sinh viên/nhóm cam kết nội dung phản ánh đúng quá trình sử dụng AI trong project.

| Đại diện sinh viên/nhóm | Ngày xác nhận |
|---|---|
| Phan Hoài An | 10/06/2026 |
