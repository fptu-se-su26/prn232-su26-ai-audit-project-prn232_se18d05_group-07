# Changelog

## 1. Quy định ghi Changelog

File này dùng để ghi lại các thay đổi quan trọng trong quá trình thực hiện bài tập, lab, assignment hoặc project.

Nguyên tắc ghi changelog:

- Chỉ ghi những gì đã hoàn thành thật sự.
- Không ghi kế hoạch nếu chưa thực hiện.
- Mỗi thay đổi nên có ngày, nội dung, người thực hiện và minh chứng.
- Nếu có AI hỗ trợ, cần ghi rõ AI đã hỗ trợ phần nào.
- Nếu có commit GitHub, cần ghi link commit.
- Nếu có lỗi đã sửa, cần ghi rõ lỗi, nguyên nhân và cách xử lý.

---

## 2. Thông tin project

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
| Repository URL | https://github.com/fptu-se-su26/prn232-su26-ai-audit-project-prn232_se18d05_group-07 |
| Ngày bắt đầu | 29/05/2026 |
| Ngày hoàn thành | 29/05/2026 |

---

## 3. Tổng quan các phiên bản/giai đoạn

| Phiên bản/Giai đoạn | Thời gian | Nội dung chính | Trạng thái |
|---|---|---|---|
| Phase 01 | 28/05/2026 | Khởi tạo cấu trúc Backend Clean Architecture & CSDL SQL Server | Completed |
| Phase 02 | 29/05/2026 | Xây dựng Giao diện Trang chủ (Homepage), Tìm chỗ ở (Browse), Chi tiết chỗ ở (Room Details), và Dành cho Chủ nhà | Completed |
| Phase 03 |  | Thiết kế hệ thống (ERD chi tiết, API) | Not Started |
| Phase 04 |  | Implementation | Not Started |
| Phase 05 |  | Testing & Debug | Not Started |
| Phase 06 |  | Hoàn thiện báo cáo và demo | Not Started |

---

# [Phase 01] Khởi tạo cấu trúc Backend & CSDL SQL Server

*(Đã hoàn thành và báo cáo chi tiết trong đợt cập nhật #1)*

---

# [Phase 02] Xây dựng Giao diện Trang chủ & Cấu hình TailwindCSS

## Ngày thực hiện

```text
29/05/2026
```

## Đã hoàn thành

- [x] Thu hẹp phạm vi địa lý toàn dự án RoomHub về thành phố Đà Nẵng
- [x] Cài đặt các gói `tailwindcss@3`, `postcss`, `autoprefixer` vào dự án Frontend
- [x] Khởi tạo và cấu hình `tailwind.config.js` mở rộng theme màu sắc và font chữ tùy biến của dự án
- [x] Thiết lập `src/index.css` tải Tailwind directives và Google Fonts (Plus Jakarta Sans)
- [x] Cập nhật `index.html` tiếng Việt chuẩn SEO Đà Nẵng và cài đặt background tối ưu
- [x] Bóc tách và viết mới component `Navbar.tsx` hỗ trợ state menu mobile tương tác mượt mà
- [x] Bóc tách và viết mới component `Footer.tsx` bản địa hóa văn phòng liên hệ Đại học FPT Đà Nẵng
- [x] Dịch nghĩa tiếng Việt và tối ưu hóa toàn bộ JSX cho trang chủ `Home.tsx` từ HTML mẫu
- [x] Bổ sung các cảnh báo giả lập `alert` trực quan khi Khách tương tác với các nút đăng nhập/đăng ký
- [x] Ghép nối giao diện trong `App.tsx` và dọn dẹp file `App.css` để tránh xung đột phong cách thiết kế
- [x] Sử dụng AI tạo ra 03 hình ảnh độc quyền độ phân giải cao thay thế các placeholders ảnh ban đầu
- [x] Tối ưu hóa Browser Mockup phần "Giải pháp quản lý phòng trọ" lồng ghép ảnh Dashboard cực kỳ chân thực và sang trọng
- [x] Tuyển chọn và nhúng các đường dẫn ảnh Unsplash chất lượng cao cho phần "Phòng/Căn hộ nổi bật tại Đà Nẵng"
- [x] Xây dựng trang giao diện Tìm chỗ ở `Browse.tsx` với bộ lọc tìm kiếm nâng cao tương tác động
- [x] Tích hợp bộ lọc client-side động bằng React State (lọc theo từ khóa, quận, loại phòng, khoảng giá và mảng tiện ích)
- [x] Đồng bộ hóa hoàn toàn 8 loại chỗ ở và 8 quận/huyện trên trang Tìm chỗ ở `Browse.tsx` với giao diện trang chủ
- [x] Mở rộng cơ sở dữ liệu mẫu lên 11 căn phòng/căn hộ đầy đủ tiện ích phủ khắp Đà Nẵng (Thanh Khê, Cẩm Lệ, Hòa Vang...) để kiểm chứng bộ lọc hoạt động chuẩn xác
- [x] Lập trình tính năng sắp xếp kết quả động (giá tăng/giảm dần, mới nhất) và Quick Tabs chuyển đổi nhanh
- [x] Xây dựng trang giao diện Chi tiết chỗ ở `RoomDetail.tsx` cao cấp với Gallery Grid, Bảng chi phí chi tiết hàng tháng, Nội quy và Bản đồ giả lập vị trí
- [x] Thiết lập Sticky Contact Card trong `RoomDetail.tsx` chứa thông tin chủ trọ, SĐT bị ẩn mờ và Login Requirement Modal khi tương tác
- [x] Tích hợp Login Requirement Modal mượt mà khi người dùng chưa đăng nhập bấm nút yêu thích ở trang Tìm chỗ ở hoặc liên hệ ở trang Chi tiết
- [x] Xây dựng trang giao diện Dành cho Chủ nhà `ForLandlords.tsx` với Sơ đồ phòng trực quan, bảng quản lý khách thuê tập trung, hóa đơn tự động và các câu hỏi thường gặp FAQ
- [x] Thiết lập cơ chế định tuyến (state-routing) phối hợp giữa App.tsx, Navbar.tsx, Home.tsx, Browse.tsx, RoomDetail.tsx, và ForLandlords.tsx
- [x] Cập nhật Featured Room cards ở trang chủ để nhấp chuột chuyển hướng trực tiếp sang trang Chi tiết phòng tương ứng
- [x] Sửa lỗi type-import verbatimModuleSyntax và các lỗi class/unused parameter của TypeScript để đóng gói thành công
- [x] Chạy kiểm chứng đóng gói production tĩnh bằng `npm run build` thành công 100% với 0 lỗi biên dịch

## Thay đổi chi tiết

| STT | Nội dung thay đổi | Người thực hiện | File/Module liên quan | Minh chứng |
|---:|---|---|---|---|
| 1 | Cài đặt các package Tailwind CSS v3 và PostCSS | Phan Hoài An | `RoomHub.Frontend/package.json` | Commit Git |
| 2 | Thiết lập `tailwind.config.js` mở rộng màu sắc tùy biến | Phan Hoài An | `tailwind.config.js` | Commit Git |
| 3 | Tạo component điều hướng tái sử dụng `Navbar.tsx` có menu mobile | Phan Hoài An | `src/components/Navbar.tsx` | Commit Git |
| 4 | Tạo component chân trang tái sử dụng `Footer.tsx` bản địa hóa Đà Nẵng | Phan Hoài An | `src/components/Footer.tsx` | Commit Git |
| 5 | Tạo trang chủ `Home.tsx` tối ưu JSX và bổ sung cảnh báo giả lập | Phan Hoài An | `src/pages/Home.tsx` | Commit Git |
| 6 | Cập nhật định dạng nền App.tsx và làm rỗng App.css | Phan Hoài An | `src/App.tsx`, `src/App.css` | Commit Git |
| 7 | Tạo trang Tìm chỗ ở `Browse.tsx` với các bộ lọc động | Phan Hoài An | `src/pages/Browse.tsx` | Commit Git |
| 8 | Tạo trang Chi tiết chỗ ở `RoomDetail.tsx` đầy đủ thông tin cao cấp | Phan Hoài An | `src/pages/RoomDetail.tsx` | Commit Git |
| 9 | Cập nhật click card ở trang chủ liên kết sang trang chi tiết | Phan Hoài An | `src/pages/Home.tsx` | Commit Git |
| 10 | Tích hợp định tuyến chuyển trang và quản lý state selectedRoomId | Phan Hoài An | `src/App.tsx`, `src/components/Navbar.tsx`, `src/pages/Browse.tsx` | Commit Git |
| 11 | Tạo trang Dành cho Chủ nhà `ForLandlords.tsx` và tích hợp định tuyến | Phan Hoài An | `src/pages/ForLandlords.tsx`, `src/App.tsx`, `src/components/Navbar.tsx` | Commit Git |

## AI có hỗ trợ không?

- [x] Có
- [ ] Không

Nếu có, mô tả AI đã hỗ trợ phần nào:

```text
AI trợ lý Antigravity hỗ trợ viết cấu hình tự động cho tailwind.config.js, bóc tách và chuyển đổi mã nguồn HTML mẫu sang định dạng JSX của React TypeScript không xảy ra lỗi cú pháp, và cấu hình App.tsx đồng bộ.
```

## Commit/Screenshot minh chứng

```text
Commit Git:
- feat: install and configure TailwindCSS v3 and PostCSS
- feat: create reusable Navbar component with mobile interactive state
- feat: create reusable Footer component with Da Nang localized contact info
- feat: build homepage Home.tsx page with complete JSX conversion and alerts
- style: update App.tsx layouts and empty App.css to prevent conflicts
- test: verify npm run build succeeds with 0 errors
```

## Ghi chú

```text
Trang chủ sau khi khởi tạo hiển thị rất đẹp, load mượt mà và toàn bộ font chữ/màu sắc đều khớp chính xác với thiết kế ban đầu.
```

---

## 4. Tổng kết thay đổi cuối project

### 4.1. Các chức năng đã hoàn thành

| STT | Chức năng | Trạng thái | Minh chứng | Ghi chú |
|---|---|---|---|---|
| 1 | Khởi tạo cấu trúc Backend Clean Architecture & CSDL SQL Server | Completed | dotnet build thành công | Đã hoàn thành ở đợt 1 |
| 2 | Cài đặt và cấu hình TailwindCSS v3 vào dự án Frontend | Completed | tailwind.config.js cấu hình xong | Sẵn sàng hoạt động |
| 3 | Xây dựng giao diện các trang dành cho Khách & Chủ nhà (Homepage, Tìm chỗ ở, Chi tiết, Dành cho Chủ nhà) tiếng Việt Đà Nẵng | Completed | npm run build thành công | Tách biệt các component và sử dụng state-routing mượt mà |

---

| 1 | Nghiệp vụ Đăng nhập / Đăng ký hệ thống | Thuộc về các phase sau | Lập trình API Token JWT ở backend và kết nối frontend |

---

### 4.3. Tổng hợp AI hỗ trợ trong project

| Hạng mục | AI có hỗ trợ không? | Mức độ hỗ trợ | Ghi chú |
|---|---|---|---|
| Requirement | Có | Trung bình | Định vị phạm vi Đà Nẵng |
| Design | Có | Nhiều | Thiết kế bóc tách component |
| Database | Có | Nhiều | Đã làm ở đợt 1 |
| Coding | Có | Nhiều | Thực thi cài Tailwind, viết mã JSX |
| Debug | Không | N/A | Không phát sinh lỗi biên dịch |
| Testing | Có | Ít | Phối hợp chạy npm run build |
| Report | Có | Trung bình | Hỗ trợ điền tài liệu học thuật đợt 2 |
| Presentation | Không | N/A | Chưa thực hiện |

---

### 4.5. Hướng cải thiện tiếp theo

```text
Thiết kế hệ thống chi tiết (ERD, APIs) và lập trình các API Đăng ký / Đăng nhập ở Backend cùng việc kết nối Frontend gọi API thực tế.
```

---

## 5. Cam kết cập nhật Changelog

Sinh viên/nhóm cam kết rằng nội dung changelog phản ánh đúng các thay đổi đã thực hiện trong quá trình làm bài tập/project.

| Đại diện sinh viên/nhóm | Ngày xác nhận |
|---|---|
| Phan Hoài An | 29/05/2026 |
