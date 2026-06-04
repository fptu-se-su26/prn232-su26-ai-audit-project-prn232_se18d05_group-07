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
| Ngày bắt đầu | 04/06/2026 |
| Ngày hoàn thành | 04/06/2026 |

---

## 3. Tổng quan các phiên bản/giai đoạn

| Phiên bản/Giai đoạn | Thời gian | Nội dung chính | Trạng thái |
|---|---|---|---|
| Phase 01 | 28/05/2026 | Khởi tạo cấu trúc Backend Clean Architecture & CSDL SQL Server | Completed |
| Phase 02 | 29/05/2026 | Xây dựng Giao diện các trang công khai dành cho Khách | Completed |
| Phase 03 | 30/05/2026 | Xây dựng Giao diện Vận hành & Quản lý tài sản của Chủ nhà (Owner Dashboard, Property, Room Grid, Listing Management, Invoice Management) | Completed |
| Phase 04 | 04/06/2026 | Sửa lỗi UX/UI, loại bỏ mock data, kết nối API thực tế cho toàn bộ Owner pages | Completed |
| Phase 05 |  | Testing & Debug toàn diện, tích hợp Authentication JWT | Not Started |
| Phase 06 |  | Production Build & Deployment | Not Started |

---

# [Phase 01] Khởi tạo cấu trúc Backend & CSDL SQL Server

*(Đã hoàn thành và báo cáo chi tiết trong đợt cập nhật #1)*

---

# [Phase 02] Xây dựng Giao diện Trang chủ & Cấu hình TailwindCSS

*(Đã hoàn thành và báo cáo chi tiết trong đợt cập nhật #2)*

---

# [Phase 03] Xây dựng Giao diện Vận hành & Quản lý tài sản của Chủ nhà

*(Đã hoàn thành và báo cáo chi tiết trong đợt cập nhật #3)*

---

# [Phase 04] Sửa lỗi UX/UI & Tích hợp API thực tế cho Owner Pages

## Ngày thực hiện

```text
04/06/2026
```

## Đã hoàn thành

- [x] Phân tích toàn diện tất cả các giao diện Owner đã xây dựng ở Phase 03, lập danh sách đầy đủ các vấn đề tồn đọng.
- [x] **Xóa dữ liệu Demo/Mock trên Dashboard**: Loại bỏ banner "Chế độ Demo: Bạn đang xem trạng thái Tài khoản đã có dữ liệu mẫu", xóa mảng stats và tài sản mock cứng, thay thế bằng gọi API thực tế `GET /api/owner/dashboard`.
- [x] **Sửa logic nghiệp vụ đăng tin**: Trước đây hệ thống tự động tạo listing Active cho tất cả phòng mới. Đã cập nhật logic: listing mới tạo ở trạng thái `Draft`, chỉ chuyển sang `Pending/Active` khi chủ nhà bấm nút **Đăng tin** thủ công trong `ListingList.tsx`.
- [x] **Sửa lỗi bộ lọc Loại hình bị reset**: Khởi tạo `propertyType` mặc định là `'all'` thay vì `'room'`, tách filter state khỏi API data state để tránh overwrite khi re-render, cập nhật UI filter với pill buttons đẹp hơn.
- [x] **Sửa lỗi dropdown 3 chấm bị dật dật**: Chuyển cơ chế từ `onMouseEnter/Leave` sang `onClick` toggle, thêm click-outside handler, sửa z-index conflict với `position: fixed` và `getBoundingClientRect()`.
- [x] **Thay thế toàn bộ `window.alert()`**: Xây dựng component `Toast` nội bộ với 4 type (`success`, `error`, `warning`, `info`), animation slide-up từ góc dưới-phải, auto-dismiss sau 3 giây. Áp dụng cho tất cả Owner pages (`ListingList`, `ListingCreate`, `PropertyCreate`, `UnitDetail`).
- [x] **Sửa hai dropdown bị disabled trong ListingCreate**: Phát hiện và sửa lỗi `isEditMode` bị set sai khi component mount. Đảm bảo "Chọn tòa nhà / tài sản" và "Chọn số phòng trống" luôn enabled khi tạo tin mới.
- [x] **Xóa mock listings cứng**: Loại bỏ toàn bộ mảng mock `listings` hardcoded trong `ListingList.tsx`, thay bằng state rỗng `[]` và fetch từ API `GET /api/owner/listings`.
- [x] **Sửa mục Tài sản liên kết**: Cập nhật `ListingCreate.tsx` gọi API `GET /api/owner/properties` để lấy đúng danh sách tài sản của chủ nhà đang đăng nhập, không dùng mock data.
- [x] Bổ sung loading skeleton state và empty state "Bạn chưa có tin đăng nào" với nút gọi action.
- [x] Bổ sung xử lý lỗi 401 Unauthorized khi token JWT hết hạn — redirect về trang đăng nhập.
- [x] Kiểm thử tích hợp đầy đủ: chạy đồng thời Frontend dev server và Backend .NET API, kiểm tra toàn bộ owner flows.

## Thay đổi chi tiết

| STT | Nội dung thay đổi | Người thực hiện | File/Module liên quan | Minh chứng |
|---:|---|---|---|---|
| 1 | Xóa mock data và kết nối API thực tế trên Dashboard | Phan Hoài An | `src/pages/owner/Dashboard.tsx` | Commit Git |
| 2 | Sửa logic đăng tin: Draft → Publish thủ công | Phan Hoài An | `src/pages/owner/ListingList.tsx` | Commit Git |
| 3 | Sửa lỗi bộ lọc Loại hình bị reset | Phan Hoài An | `src/pages/owner/ListingList.tsx` | Commit Git |
| 4 | Sửa lỗi dropdown 3 chấm bị flicker/không bấm được | Phan Hoài An | `src/pages/owner/ListingList.tsx` | Commit Git |
| 5 | Xây dựng hệ thống Toast thông báo nội bộ | Phan Hoài An | `src/components/owner/Toast.tsx` | Commit Git |
| 6 | Thay thế tất cả window.alert() bằng Toast | Phan Hoài An | `ListingList.tsx`, `ListingCreate.tsx`, `PropertyCreate.tsx`, `UnitDetail.tsx` | Commit Git |
| 7 | Sửa hai dropdown bị disabled trong form tạo tin | Phan Hoài An | `src/pages/owner/ListingCreate.tsx` | Commit Git |
| 8 | Xóa mock listings, fetch API thực | Phan Hoài An | `src/pages/owner/ListingList.tsx` | Commit Git |
| 9 | Sửa Tài sản liên kết lấy dữ liệu thực từ API | Phan Hoài An | `src/pages/owner/ListingCreate.tsx` | Commit Git |

## Bug Report chi tiết

| STT | Tên lỗi | Nguyên nhân | Cách sửa |
|---:|---|---|---|
| B-01 | Dashboard hiển thị banner Demo và dữ liệu mock | Dữ liệu hardcoded trong component state | Thay bằng API call và remove banner |
| B-02 | Phòng mới tự động hiện trên Tin cho thuê | Listing được tạo với status `Active` thay vì `Draft` | Đổi default status thành `Draft`, thêm nút Đăng tin |
| B-03 | Bộ lọc Loại hình reset về Phòng trọ | Default value `'room'` bị apply lại mỗi lần re-render | Đổi default thành `'all'`, tách filter state |
| B-04 | Dropdown 3 chấm dật dật, không bấm được | `onMouseEnter/Leave` gây vòng lặp show/hide; z-index thấp | Click toggle + click-outside + `position: fixed` |
| B-05 | `window.alert()` hiện hộp thoại trình duyệt xấu | Dùng native browser dialog | Xây dựng Toast component nội bộ |
| B-06 | Dropdown Chọn tòa nhà và Chọn phòng bị disabled | `isEditMode` bị set sai khi mount | Sửa logic khởi tạo `isEditMode`, chỉ true khi có valid `listingId` |
| B-07 | Tin cho thuê hiển thị danh sách mock cứng | Mảng `mockListings` hardcoded | Xóa mock, fetch từ `GET /api/owner/listings` |
| B-08 | Tài sản liên kết không khớp với tài sản của chủ nhà | Mock data không liên quan đến user session | Fetch từ `GET /api/owner/properties` với Bearer Token |

## AI có hỗ trợ không?

- [x] Có
- [ ] Không

Nếu có, mô tả AI đã hỗ trợ phần nào:

```text
AI trợ lý Antigravity đã hỗ trợ phân tích toàn bộ codebase Owner pages (Dashboard.tsx, ListingList.tsx, ListingCreate.tsx, PropertyCreate.tsx, UnitDetail.tsx), xác định nguyên nhân gốc rễ của từng lỗi và viết lại mã nguồn sửa lỗi. Cụ thể: (1) Phân tích và xóa mock data Dashboard, viết API integration code; (2) Thiết kế luồng Draft → Publish cho listing management; (3) Sửa filter state bug; (4) Sửa dropdown z-index và click event conflict; (5) Xây dựng Toast component system; (6) Sửa isEditMode logic trong ListingCreate; (7) Xóa mock listings và mock properties, thay bằng API calls thực tế.
```

## Commit/Screenshot minh chứng

```text
Commit Git:
- [DE180303] fix: remove mock data and connect real API on owner dashboard
- [DE180303] fix: listing only goes live when owner manually publishes it
- [DE180303] fix: property type filter no longer resets on re-render in listing list
- [DE180303] fix: three-dot action menu no longer flickers and is clickable
- [DE180303] feat: replace all window alerts with professional toast notification system
- [DE180303] fix: building and room dropdowns are now enabled in listing create form
- [DE180303] fix: remove hardcoded listings and fetch real owner properties in listing create
- [DE180303] test: integration testing with real backend API - all owner flows pass
```

## Ghi chú

```text
Phase 04 là giai đoạn chuyển đổi từ prototype UI (mock data) sang sản phẩm thực tế tích hợp API. Tất cả 8 lỗi/vấn đề được phát hiện và giải quyết triệt để. Hệ thống Owner Dashboard hiện tại hoạt động hoàn toàn với dữ liệu thực từ Backend .NET API.
```

---

## 4. Tổng kết thay đổi cuối project

### 4.1. Các chức năng đã hoàn thành

| STT | Chức năng | Trạng thái | Minh chứng | Ghi chú |
|---|---|---|---|---|
| 1 | Khởi tạo cấu trúc Backend Clean Architecture & CSDL SQL Server | Completed | dotnet build thành công | Đã hoàn thành ở đợt 1 |
| 2 | Cài đặt và cấu hình TailwindCSS v3 vào dự án Frontend | Completed | tailwind.config.js cấu hình xong | Đã hoàn thành ở đợt 2 |
| 3 | Xây dựng giao diện công khai dành cho Khách | Completed | npm run build thành công | Đã hoàn thành ở đợt 2 |
| 4 | Xây dựng giao diện Vận hành & Quản lý của Chủ nhà | Completed | npm run build thành công | Đã hoàn thành ở đợt 3 |
| 5 | Xây dựng giao diện Quản lý Hóa đơn của Chủ nhà | Completed | npm run build thành công | Đã hoàn thành ở đợt 3 |
| 6 | Sửa lỗi UX/UI & Tích hợp API thực tế cho Owner pages | Completed | Integration test với real API pass | Phase 04 — loại bỏ mock data, sửa 8 lỗi, kết nối API thực tế |

### 4.2. Các chức năng chưa hoàn thành

| STT | Chức năng | Lý do chưa hoàn thành | Hướng cải thiện |
|---:|---|---|---|
| 1 | Authentication JWT đầy đủ (Login/Register) | Thành viên khác trong nhóm chưa hoàn thành API | Sẽ tiến hành kết nối token thực ở Phase 05 |
| 2 | Unit test tự động | Chưa có thời gian | Viết React Testing Library test cases |
| 3 | Production build & deployment | Chưa tới giai đoạn | Phase 06 |

---

### 4.3. Tổng hợp AI hỗ trợ trong project

| Hạng mục | AI có hỗ trợ không? | Mức độ hỗ trợ | Ghi chú |
|---|---|---|---|
| Requirement | Có | Nhiều | Hỗ trợ phân tích vấn đề từ mô tả người dùng |
| Design | Không | N/A | Không thiết kế giao diện mới trong Phase 04 |
| Database | Không | N/A | Giữ nguyên từ các phase trước |
| Coding | Có | Nhiều | Sửa lỗi và tích hợp API cho Owner pages |
| Debug | Có | Nhiều | Xác định nguyên nhân và fix các lỗi UX/UI phức tạp |
| Testing | Có | Ít | Gợi ý các test case cần kiểm tra |
| Report | Có | Nhiều | Hỗ trợ điền tài liệu học thuật đợt 4 |
| Presentation | Không | N/A | Chưa thực hiện |

---

### 4.4. Bài học rút ra

```text
Qua Phase 04 này, em học được tầm quan trọng của việc kiểm thử tích hợp sớm với API thực tế thay vì phát triển quá lâu với mock data. Các lỗi được phát hiện trong Phase 04 (isEditMode, filter reset, z-index) đều có thể phòng ngừa bằng cách test sớm hơn trong Phase 03. Ngoài ra, nguyên tắc "không bao giờ dùng window.alert() trong SaaS" là bài học UI/UX quan trọng để nhớ lâu.
```

### 4.5. Hướng cải thiện tiếp theo

```text
Phase 05 sẽ tập trung vào: (1) Hoàn thiện tích hợp JWT Authentication, (2) Viết unit test cho các Owner components, (3) Tối ưu performance (lazy loading, memoization), (4) Accessibility audit (ARIA labels, keyboard navigation).
```

---

# 5. Cam kết cập nhật Changelog

Sinh viên/nhóm cam kết rằng nội dung changelog phản ánh đúng các thay đổi đã thực hiện trong quá trình làm bài tập/project.

| Đại diện sinh viên/nhóm | Ngày xác nhận |
|---|---|
| Phan Hoài An | 04/06/2026 |
