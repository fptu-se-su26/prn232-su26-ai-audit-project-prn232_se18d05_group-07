# Changelog - Đợt cập nhật #5

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
| Ngày bắt đầu | 07/06/2026 |
| Ngày hoàn thành | 08/06/2026 |

---

## 3. Tổng quan các phiên bản/giai đoạn

| Phiên bản/Giai đoạn | Thời gian | Nội dung chính | Trạng thái |
|---|---|---|---|
| Phase 01 | 28/05/2026 | Khởi tạo cấu trúc Backend Clean Architecture & CSDL SQL Server | Completed |
| Phase 02 | 29/05/2026 | Xây dựng Giao diện các trang công khai dành cho Khách | Completed |
| Phase 03 | 30/05/2026 | Xây dựng Giao diện Vận hành & Quản lý tài sản của Chủ nhà (Owner Dashboard) | Completed |
| Phase 04 | 04/06/2026 | Sửa lỗi UX/UI, loại bỏ mock data, kết nối API thực tế cho toàn bộ Owner pages | Completed |
| Phase 06 | 07/06/2026 | Xây dựng luồng Xác nhận nhận phòng/từ chối của Khách thuê (Tenant Room Acceptance/Rejection Flow) | Completed |
| Phase 07 | 08/06/2026 | Xây dựng trang Quản lý Khách thuê dành cho Chủ nhà (Owner Tenant Management Page) & Sửa giao diện sidebar, modal logout | Completed |

---

# [Phase 06 & 07] Luồng Xác Nhận Nhận Phòng & Trang Quản Lý Người Thuê

## Ngày thực hiện

```text
07/06/2026 - 08/06/2026
```

## Đã hoàn thành

- [x] **Luồng Xác nhận Nhận phòng (Phase 06)**:
  - Cập nhật enum `ContractStatus` (thêm trạng thái `Pending`) và cập nhật `RoomStatus` (`PendingApproval` cho phòng chờ xác nhận).
  - Viết logic `AcceptContractAsync` (chuyển hợp đồng sang `Active`, phòng sang `Occupied`) và `RejectContractAsync` (đánh dấu `IsDeleted = true`, giải phóng phòng sang `Available`).
  - Viết endpoint `POST /api/tenant/room/accept` và `POST /api/tenant/room/reject` cho khách thuê.
  - Cập nhật UI Khách thuê (`MyRoom.tsx`): hiển thị lời mời từ chủ nhà kèm 2 nút **Đồng ý nhận phòng** và **Từ chối**, không hiển thị alert trình duyệt.
- [x] **Trang Quản lý Người thuê của Chủ nhà (Phase 07)**:
  - Cập nhật `GetContractsByOwnerAsync` trong repository để tải kèm dữ liệu `Floor` và `Building`.
  - Khai báo DTO `OwnerTenantDto` và viết service `GetTenantsForOwnerAsync` lấy toàn bộ người thuê đang hoạt động hoặc chờ duyệt.
  - Tạo mới trang giao diện `Tenants.tsx` dành cho chủ nhà hiển thị bảng thông tin khách thuê kèm bộ lọc thông minh (Tòa nhà, Trạng thái, Hình thức online/offline).
  - Tích hợp tính năng **Xem liên hệ** (Profile modal) và **Thanh lý hợp đồng** (mở modal nhập tiền phạt, tiền hoàn và chấm dứt thuê).
- [x] **Loại bỏ các Banner và Card thừa**:
  - Xóa card **"Hướng dẫn nhanh"** khỏi Sidebar của Chủ nhà (`OwnerLayout.tsx`).
  - Xóa card **"Mẹo nhỏ"** khỏi Sidebar của Khách thuê (`TenantLayout.tsx`).
- [x] **Khắc phục hộp thoại logout native**:
  - Xây dựng **Modal xác nhận đăng xuất Custom (React state)** cho cả giao diện chủ nhà và khách thuê để loại bỏ thông báo native trình duyệt chứa dòng chữ `"localhost:5173 says"`.
  - Sửa đổi hàm logout điều hướng chính xác về đường dẫn đăng nhập `/login` thay vì quay về trang chủ.

## Thay đổi chi tiết

| STT | Nội dung thay đổi | Người thực hiện | File/Module liên quan | Minh chứng |
|---:|---|---|---|---|
| 1 | Thêm trạng thái Pending & PendingApproval | Phan Hoài An | `ContractStatus.cs`, `RoomStatus.cs` | Code backend compiled |
| 2 | Viết service chấp nhận/từ chối hợp đồng | Phan Hoài An | `ContractService.cs`, `IContractService.cs` | Code backend compiled |
| 3 | Tạo endpoint accept/reject cho tenant | Phan Hoài An | `TenantRoomController.cs` | Code backend compiled |
| 4 | Xây dựng UI phản hồi lời mời nhận phòng | Phan Hoài An | `MyRoom.tsx` | UI hiển thị đúng luồng |
| 5 | Tải kèm Building info khi lấy hợp đồng | Phan Hoài An | `ContractRepository.cs` | Code backend compiled |
| 6 | Thêm DTO và endpoint GET người thuê | Phan Hoài An | `ContractDtos.cs`, `ContractsController.cs` | Code backend compiled |
| 7 | Viết trang quản lý người thuê của chủ trọ | Phan Hoài An | `Tenants.tsx`, `App.tsx` | Giao diện `/owner/tenants` hoạt động |
| 8 | Xóa các card Quick Guide và Tips ở Sidebar | Phan Hoài An | `OwnerLayout.tsx`, `TenantLayout.tsx` | Layout sạch sẽ |
| 9 | Thay window.confirm logout bằng Custom Modal | Phan Hoài An | `OwnerLayout.tsx`, `TenantLayout.tsx` | Không hiện localhost says |
| 10| Điều hướng đăng xuất về trang đăng nhập | Phan Hoài An | `OwnerLayout.tsx`, `TenantLayout.tsx` | Out thẳng về trang login |

## Bug Report chi tiết

| STT | Tên lỗi | Nguyên nhân | Cách sửa |
|---:|---|---|---|
| B-01 | Đăng xuất hiện hộp thoại native trình duyệt | Sử dụng `window.confirm` | Xây dựng Modal React custom xác nhận đăng xuất |
| B-02 | Nhấn đăng xuất quay về trang chủ | `setCurrentPage('home')` nhưng không gọi `navigate('/login')` | Gọi hàm `logout()`, set `currentPage` về `'home'` và dùng React Router `navigate('/login')` |
| B-03 | Sidebar có card hướng dẫn và mẹo thừa | Dữ liệu mock/quảng cáo cứng gây rối màn hình | Xóa các khối HTML quick guide và tips |
| B-04 | Sơ đồ hợp đồng thiếu thông tin tòa nhà | Repository không nạp liên kết Floor và Building | Thêm `.ThenInclude(r => r.Floor).ThenInclude(f => f.Building)` vào `GetContractsByOwnerAsync` |

## AI có hỗ trợ không?

- [x] Có
- [ ] Không

Nếu có, mô tả AI đã hỗ trợ phần nào:

```text
AI trợ lý Antigravity đã hỗ trợ tích cực trong việc: (1) Phân tích cơ sở dữ liệu và xây dựng luồng nghiệp vụ duyệt/từ chối hợp đồng trọ; (2) Thiết kế API endpoint và viết các hàm mapping DTO phía Backend; (3) Viết toàn bộ trang Tenants.tsx ở frontend tích hợp lọc động, tìm kiếm, xem chi tiết và form thanh lý hợp đồng; (4) Tối ưu hóa layout sidebar, loại bỏ mã nguồn thừa, chuyển đổi từ window.confirm sang React Modal xác nhận đăng xuất tùy chỉnh.
```

## Cam kết cập nhật Changelog

Sinh viên/nhóm cam kết rằng nội dung changelog phản ánh đúng các thay đổi đã thực hiện trong quá trình làm bài tập/project.

| Đại diện sinh viên/nhóm | Ngày xác nhận |
|---|---|
| Phan Hoài An | 08/06/2026 |
