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
| Ngày bắt đầu | 30/05/2026 |
| Ngày hoàn thành | 30/05/2026 |

---

## 3. Tổng quan các phiên bản/giai đoạn

| Phiên bản/Giai đoạn | Thời gian | Nội dung chính | Trạng thái |
|---|---|---|---|
| Phase 01 | 28/05/2026 | Khởi tạo cấu trúc Backend Clean Architecture & CSDL SQL Server | Completed |
| Phase 02 | 29/05/2026 | Xây dựng Giao diện các trang công khai dành cho Khách | Completed |
| Phase 03 | 30/05/2026 | Xây dựng Giao diện Vận hành & Quản lý tài sản của Chủ nhà (Owner Dashboard, Property List, Room Grid, Sinh phòng tự động, Chi tiết phòng & Modals nghiệp vụ) | Completed |
| Phase 04 |  | Thiết kế hệ thống (ERD chi tiết, API) | Not Started |
| Phase 05 |  | Implementation | Not Started |
| Phase 06 |  | Testing & Debug | Not Started |

---

# [Phase 01] Khởi tạo cấu trúc Backend & CSDL SQL Server

*(Đã hoàn thành và báo cáo chi tiết trong đợt cập nhật #1)*

---

# [Phase 02] Xây dựng Giao diện Trang chủ & Cấu hình TailwindCSS

*(Đã hoàn thành và báo cáo chi tiết trong đợt cập nhật #2)*

---

# [Phase 03] Xây dựng Giao diện Vận hành & Quản lý tài sản của Chủ nhà (Owner Layout, Property & Unit Management)

## Ngày thực hiện

```text
30/05/2026
```

## Đã hoàn thành

- [x] Thu hẹp phạm vi nghiệp vụ RoomHub MVP tập trung vào 4 loại hình chính: *Phòng trọ*, *Studio*, *Căn hộ mini*, và *Căn hộ*, loại bỏ "Nhà nguyên căn" để phù hợp quy mô bài báo cáo nhóm.
- [x] Xây dựng giao diện chung cho Chủ nhà **Owner Dashboard Layout** (`OwnerLayout.tsx`) gồm thanh Sidebar điều hướng thông minh và thanh Topbar tích hợp tiêu đề động theo định vị trang.
- [x] Triển khai bộ định tuyến **Hash Router** hoàn chỉnh kết nối mượt mà các đường dẫn của Owner (`#/owner/dashboard`, `#/owner/properties`, `#/owner/properties/create`, `#/owner/properties/:id`, `#/owner/units/:id`).
- [x] Phát triển trang danh sách tài sản của Chủ nhà `PropertyList.tsx` hiển thị thống kê quy mô, công suất lấp đầy, dư nợ và danh sách tài sản kèm thanh công cụ tìm kiếm và lọc quận huyện tại Đà Nẵng.
- [x] Phát triển trang chi tiết tài sản & sơ đồ phòng trọ `PropertyDetail.tsx` lồng ghép đồng bộ SVG Radial Progress cho tỷ lệ lấp đầy, bảng giá dịch vụ mặc định của tòa nhà và lưới phân bổ phòng trọ trực quan theo tầng.
- [x] Triển khai Quick Room Detail Drawer trượt từ bên phải cực kỳ mượt mà hiển thị nhanh thông tin hợp đồng của khách thuê và tình hình hóa đơn nợ trọ khi click vào các ô phòng trọ trên lưới.
- [x] Xây dựng biểu mẫu thêm tài sản mới `PropertyCreate.tsx` có thanh Stepper 5 bước kiểm soát thông tin chặt chẽ và Sticky Preview Card cập nhật thời gian thực.
- [x] Lập trình tính năng tương tác nổi bật nhất: **Live Room Grid Generator** - tự động tính toán và vẽ lại lưới phân tầng phòng trọ trống theo thời gian thực dựa trên cấu hình số tầng, số phòng mỗi tầng và quy tắc đánh số (Standard/Prefix/Chữ cái).
- [x] Xây dựng trang chi tiết vận hành phòng `UnitDetail.tsx` tích hợp bố cục 2 cột SaaS hiển thị công nợ, lịch sử hóa đơn dịch vụ hàng tháng, ghi chú nội bộ và nhật ký dòng thời gian vận hành.
- [x] Xây dựng hộp thoại thêm người thuê mới **Add Tenant Modal** hỗ trợ tìm kiếm tài khoản RoomHub trực tuyến (Online Linking) hoặc lưu trữ thủ công (Offline) kèm cơ chế validation sức chứa tối đa của phòng.
- [x] Xây dựng hộp thoại trả phòng bàn giao **End Tenancy Modal** tự động cập nhật trạng thái phòng trọ và ẩn các tin đăng quảng cáo liên quan.
- [x] Xây dựng hộp thoại cập nhật trạng thái hoạt động nhanh **Change Status Modal** đồng bộ hóa tức thì với sơ đồ grid tầng.
- [x] Kết nối liên kết sâu hai chiều trong `PropertyDetail.tsx` (Grid phòng trọ, danh sách khách thuê, bảng hóa đơn) giúp chuyển đổi nhanh về trang quản lý chi tiết phòng trọ `#/owner/units/:id`.
- [x] Xây dựng trang đăng tin cho thuê mới `ListingCreate.tsx` có cấu trúc Stepper 6 bước nằm ngang cực kỳ bóng bẩy và chuyên nghiệp.
- [x] Lập trình 2 luồng lớn linh hoạt: "Chọn phòng/căn đã có" có khả năng tự động điền (Auto-fill) thông số từ sơ đồ lưới, và luồng "Đăng tin độc lập" nhập thủ công kết cấu.
- [x] Thiết kế Sticky Live Public Card Preview ở cột bên phải mô phỏng chính xác giao diện tìm kiếm công khai, cập nhật thời gian thực theo từng tương tác của form cột trái.
- [x] Thiết lập 17 tiện ích checkbox cards thiết kế bóng bẩy, các checkboxes nhanh nội quy trọ, kéo thả ảnh giả lập kết hợp nhúng URL ảnh trực tuyến.
- [x] Tích hợp Validation kiểm duyệt dữ liệu nghiêm ngặt và overlay loading spinner chốt trạng thái nháp (Draft) hoặc đăng ngay (Active) kèm Toast thành công.
- [x] Xây dựng trang danh sách quản lý tin cho thuê `ListingList.tsx` cho phép Owner theo dõi toàn bộ hiệu năng và kiểm duyệt tin đăng.
- [x] Triển khai bộ lọc Tìm kiếm nâng cao kết hợp 7 Tabs nhanh phân loại trạng thái tin đăng (Nháp, Chờ duyệt, Đang hiển thị, Bị từ chối, Đã ẩn, Đã thuê).
- [x] Phát triển 2 View Mode linh hoạt: Table View dạng bảng SaaS và Card View dạng lưới bất động sản bo tròn mềm mại.
- [x] Thiết kế thanh Bulk Actions Bar thông minh tự động trượt cam nhạt khi tích chọn nhiều tin trọ để Ẩn/Duyệt/Xóa hàng loạt.
- [x] Xây dựng bộ 5 Modals tác vụ độ trung thực cao: Hide Modal, Delete Modal, Resubmit Modal, Mark Rented Modal (chốt thuê có checkbox tự ẩn tin) và Rejection Reason Modal.
- [x] Xây dựng trang Quản lý Hóa đơn & Tài chính của Chủ nhà `InvoiceList.tsx` hỗ trợ 5 thẻ thống kê tài chính, 4 quick actions thao tác nhanh, bộ lọc tìm kiếm đa năng, 7 tabs trạng thái đồng bộ số lượng hóa đơn, view mode (Table/Card) và phân trang động.
- [x] Xây dựng thanh Bulk Actions Bar thông minh tự động trượt cam nhạt khi chọn nhiều hóa đơn để xuất Excel, gửi thông báo nhắc nợ, ghi nhận đóng đủ (Paid) và hủy hóa đơn hàng loạt.
- [x] Phát triển bộ 5 modals nghiệp vụ tài chính có độ trung thực cao: Record Payment (có nhập số tiền, phương thức, ngày đóng, ghi chú), Mark as Paid nhanh, Cancel Invoice (nhập lý do hủy và validation cam kết), Export Excel (phạm vi xuất và cấu hình nâng cao), và Send Notification (nhắc nợ trực tuyến kèm cảnh báo tài khoản offline).
- [x] Chạy kiểm thử thành công biên dịch đóng gói tĩnh bằng `npm run build` đạt kết quả tối ưu, 0 lỗi TypeScript và 0 warning của trình biên dịch Vite.

## Thay đổi chi tiết

| STT | Nội dung thay đổi | Người thực hiện | File/Module liên quan | Minh chứng |
|---:|---|---|---|---|
| 1 | Cấu hình định tuyến chi tiết trang của Chủ nhà | Phan Hoài An | `RoomHub.Frontend/src/App.tsx` | Commit Git |
| 2 | Xây dựng bố cục giao diện Dashboard Layout của Chủ nhà | Phan Hoài An | `src/components/owner/OwnerLayout.tsx` | Commit Git |
| 3 | Xây dựng trang danh sách tài sản `PropertyList.tsx` có các bộ lọc quận | Phan Hoài An | `src/pages/owner/PropertyList.tsx` | Commit Git |
| 4 | Xây dựng sơ đồ lưới phòng trọ `PropertyDetail.tsx` tích hợp Quick Drawer | Phan Hoài An | `src/pages/owner/PropertyDetail.tsx` | Commit Git |
| 5 | Xây dựng biểu mẫu 5 bước thêm tài sản mới `PropertyCreate.tsx` và sinh phòng tự động | Phan Hoài An | `src/pages/owner/PropertyCreate.tsx` | Commit Git |
| 6 | Xây dựng trang chi tiết phòng vận hành `UnitDetail.tsx` đầy đủ thông tin | Phan Hoài An | `src/pages/owner/UnitDetail.tsx` | Commit Git |
| 7 | Viết hộp thoại **Add Tenant Modal** có kiểm duyệt số lượng người ở | Phan Hoài An | `src/pages/owner/UnitDetail.tsx` | Commit Git |
| 8 | Viết hộp thoại **End Tenancy Modal** và **Change Status Modal** | Phan Hoài An | `src/pages/owner/UnitDetail.tsx` | Commit Git |
| 9 | Ghép nối liên kết sâu các nút bấm điều hướng từ Sơ đồ Grid sang Chi tiết phòng trọ | Phan Hoài An | `src/pages/owner/PropertyDetail.tsx` | Commit Git |
| 10 | Xây dựng trang Đăng tin cho thuê mới `ListingCreate.tsx` | Phan Hoài An | `src/pages/owner/ListingCreate.tsx` | Commit Git |
| 11 | Xây dựng trang Quản lý tin cho thuê `ListingList.tsx` | Phan Hoài An | `src/pages/owner/ListingList.tsx` | Commit Git |
| 12 | Xây dựng trang Quản lý Hóa đơn `InvoiceList.tsx` | Phan Hoài An | `src/pages/owner/InvoiceList.tsx` | Commit Git |
| 13 | Xây dựng biểu mẫu Chốt tiền tháng hàng loạt `InvoiceCreate.tsx` | Phan Hoài An | `src/pages/owner/InvoiceCreate.tsx` | Commit Git |

## AI có hỗ trợ không?

- [x] Có
- [ ] Không

Nếu có, mô tả AI đã hỗ trợ phần nào:

```text
AI trợ lý Antigravity đã hỗ trợ tích hợp sâu bộ định tuyến Hash Router trong App.tsx kết nối đồng bộ cấu trúc layout Dashboard của OwnerLayout.tsx. AI đề xuất và viết mã nguồn React chi tiết cho các trang PropertyList.tsx, PropertyDetail.tsx, UnitDetail.tsx và đặc biệt là cơ chế Live Grid Generator trong PropertyCreate.tsx giúp tự động vẽ lại sơ đồ tầng phòng trọ thời gian thực. AI cũng hỗ trợ viết logic validation sức chứa tối đa trong Add Tenant Modal, cấn trừ tiền cọc trong End Tenancy và phối hợp viết liên kết sâu hai chiều thông suốt toàn bộ hệ thống. Thêm vào đó, AI hỗ trợ xây dựng trang ListingCreate.tsx (Live Preview, Stepper 6 bước), trang ListingList.tsx (Table/Card view, Bulk Actions, 5 modals), trang InvoiceList.tsx (5 Financial Summary cards, 4 Quick Actions, Bulk action bar, 5 interactive modals quản lý công nợ có cảnh báo tài khoản offline), và trang chốt tiền hàng loạt InvoiceCreate.tsx (Stepper 5 bước, bảng 16 cột realtime, Drawer và 5 Modals nghiệp vụ).
```

## Commit/Screenshot minh chứng

```text
Commit Git:
- [DE180303] feat: add owner dashboard layout and topbar sidebar components
- [DE180303] feat: build owner property list page with search and district filters
- [DE180303] feat: build owner property details page and interactive floor room grid
- [DE180303] feat: build owner property creation page with stepper and automatic room generation
- [DE180303] feat: build unit detail page with invoice lists and internal activity logs
- [DE180303] feat: implement add tenant modal with account linking and capacity validation
- [DE180303] feat: implement end tenancy modal and change status modals
- [DE180303] feat: link room grid and tables dynamically to unit detail hash pages
- [DE180303] feat: build owner listings creation page with stepper and live preview
- [DE180303] feat: build owner listing management list page with filters and bulk actions
- [DE180303] feat: build owner invoice management page with finance cards and 5 modals
- [DE180303] feat: implement bulk monthly invoice form page with 5-step stepper and interactive calculations
- [DE180303] test: verify production build compiles in 954ms with 0 errors
```

## Ghi chú

```text
Các trang giao diện quản lý vận hành của Chủ nhà (Owner) được hoàn thiện với giao diện 2 cột chuẩn SaaS cực kỳ sang trọng, tốc độ phản hồi nhanh và đáp ứng 100% yêu cầu nghiệp vụ thực tế.
```

---

## 4. Tổng kết thay đổi cuối project

### 4.1. Các chức năng đã hoàn thành

| STT | Chức năng | Trạng thái | Minh chứng | Ghi chú |
|---|---|---|---|---|
| 1 | Khởi tạo cấu trúc Backend Clean Architecture & CSDL SQL Server | Completed | dotnet build thành công | Đã hoàn thành ở đợt 1 |
| 2 | Cài đặt và cấu hình TailwindCSS v3 vào dự án Frontend | Completed | tailwind.config.js cấu hình xong | Đã hoàn thành ở đợt 2 |
| 3 | Xây dựng giao diện công khai dành cho Khách (Homepage, Browse, RoomDetail...) | Completed | npm run build thành công | Đã hoàn thành ở đợt 2 |
| 4 | Xây dựng giao diện Vận hành & Quản lý của Chủ nhà (Dashboard, PropertyList, Room Grid, Sinh phòng tự động, UnitDetail, ListingCreate, ListingList & Modals) | Completed | npm run build thành công | Đồng bộ Hash Router, lồng ghép liên kết sâu hai chiều tương tác mượt mà và Live Preview |
| 5 | Xây dựng giao diện Quản lý Hóa đơn của Chủ nhà (InvoiceList.tsx & Modals nghiệp vụ tài chính) | Completed | npm run build thành công | Tích hợp 5 modals tài chính chi tiết, cảnh báo tài khoản offline, phân trang động và xuất Excel báo cáo |
| 6 | Xây dựng giao diện Chốt tiền tháng hàng loạt của Chủ nhà (InvoiceCreate.tsx & Stepper 5 bước) | Completed | npm run build thành công | Bảng 16 cột tính toán realtime, Drawer chi tiết, Mobile card accordion và 5 modals nghiệp vụ |

---

### 4.2. Các chức năng chưa hoàn thành

| STT | Chức năng | Lý do chưa hoàn thành | Hướng cải thiện |
|---:|---|---|---|
| 1 | Nghiệp vụ Đăng nhập / Đăng ký hệ thống | Thành viên khác trong nhóm chưa hoàn thành API | Sẽ tiến hành kết nối gọi API Token JWT ở các giai đoạn sau của project |

---

### 4.3. Tổng hợp AI hỗ trợ trong project

| Hạng mục | AI có hỗ trợ không? | Mức độ hỗ trợ | Ghi chú |
|---|---|---|---|
| Requirement | Có | Nhiều | Hỗ trợ chuẩn hóa nghiệp vụ MVP trọ Đà Nẵng |
| Design | Có | Nhiều | Thiết kế biểu mẫu 2 cột SaaS, Stepper 5 bước |
| Database | Có | Nhiều | Đã làm ở đợt 1 |
| Coding | Có | Nhiều | Thực thi cài đặt layout, sinh mã JSX các trang quản lý |
| Debug | Không | N/A | Không phát sinh lỗi biên dịch |
| Testing | Có | Ít | Phối hợp chạy npm run build |
| Report | Có | Nhiều | Hỗ trợ điền tài liệu học thuật đợt 3 |
| Presentation | Không | N/A | Chưa thực hiện |

---

### 4.4. Bài học rút ra

```text
Qua Phase 03 này, em đã học được cách thiết kế và triển khai một giao diện quản lý nghiệp vụ phức tạp (SaaS Dashboard) bằng cách tách nhỏ các tác vụ thông qua biểu mẫu Stepper nhiều bước và tận dụng các cửa sổ Drawer trượt. Đồng thời, việc phối hợp thiết kế bộ định tuyến Hash Router hai chiều giúp hệ thống liên kết cực kỳ logic, mạch lạc, dễ bảo trì và mở rộng sau này.
```

### 4.5. Hướng cải thiện tiếp theo

```text
Chờ các thành viên khác hoàn thiện API Đăng nhập/Đăng ký để tiến hành tích hợp sâu cơ chế Authorization bảo mật, phân quyền Chủ nhà thực tế bằng Access Token.
```

---

# 5. Cam kết cập nhật Changelog

Sinh viên/nhóm cam kết rằng nội dung changelog phản ánh đúng các thay đổi đã thực hiện trong quá trình làm bài tập/project.

| Đại diện sinh viên/nhóm | Ngày xác nhận |
|---|---|
| Phan Hoài An | 30/05/2026 |
