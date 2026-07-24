# Changelog - Đợt cập nhật #8

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
| Ngày bắt đầu | 24/07/2026 |
| Ngày hoàn thành | 25/07/2026 |

---

## 3. Tổng quan các phiên bản/giai đoạn

| Phiên bản/Giai đoạn | Thời gian | Nội dung chính | Trạng thái |
|---|---|---|---|
| Phase 01 | 28/05/2026 | Khởi tạo cấu trúc Backend Clean Architecture & CSDL SQL Server | Completed |
| Phase 02 | 29/05/2026 | Giao diện công khai dành cho Khách trọ | Completed |
| Phase 03 | 30/05/2026 | Giao diện Vận hành & Quản lý tài sản của Chủ nhà | Completed |
| Phase 04 | 04/06/2026 | Sửa lỗi UX/UI, loại bỏ mock data, kết nối API thực tế cho toàn bộ Owner pages | Completed |
| Phase 06 | 07/06/2026 | Luồng Xác nhận nhận phòng/từ chối của Khách thuê | Completed |
| Phase 07 | 08/06/2026 | Trang Quản lý Khách thuê dành cho Chủ nhà, sửa giao diện sidebar/avatar | Completed |
| Phase 08 | 08/06/2026 | Triển Khai & Cải Tiến Tính Năng Hóa Đơn & Chốt Tiền (Chủ nhà & Khách thuê) | Completed |
| Phase 09 | 10/06/2026 | Tích hợp Gửi Email Thông Báo Tự Động Song Song Cho Hợp Đồng & Hóa Đơn | Completed |
| Phase 10 | 24/07/2026 | Hệ thống Quản lý Gói Cước (Subscription) toàn diện - Chủ nhà & Admin | Completed |
| Phase 11 | 24/07/2026 | Quản lý Tòa Nhà cho Admin - Khóa/Mở tòa nhà có migration CSDL | Completed |
| Phase 12 | 25/07/2026 | Cải tiến InvoiceService: bổ sung interface, repository và kết hợp hóa đơn Tenant Online/Offline | Completed |

---

# [Phase 10] Hệ thống Quản lý Gói Cước (Subscription) toàn diện - Chủ nhà & Admin

## Ngày thực hiện

```text
24/07/2026
```

## Đã hoàn thành

- [x] **Hệ thống giới hạn gói cước (`SubscriptionLimits.cs`)**:
  - Định nghĩa các hằng số giới hạn cho gói Free (1 tòa, 10 phòng, 2 AI Audit/tháng) và gói Pro (không giới hạn).
  - Cung cấp các phương thức tĩnh `GetMaxBuildings`, `GetMaxRooms`, `GetMaxAiAudits` để `SubscriptionService` và các Service khác tra cứu ngưỡng giới hạn.
- [x] **Cập nhật enum `SubscriptionStatus`**:
  - Bổ sung trạng thái `Expired` để phân biệt gói đã hết hạn tự nhiên với gói bị Admin thu hồi (`Cancelled`).
- [x] **Interface `ISubscriptionRepository` và `ISubscriptionService`**:
  - Khai báo phương thức `GetAllSubscriptionsAsync(string? status)` hỗ trợ lọc theo trạng thái.
  - Bổ sung `ApproveSubscriptionAsync`, `RejectSubscriptionAsync`, `RevokeSubscriptionAsync` cho luồng phê duyệt của Admin.
- [x] **`SubscriptionRepository.cs`** - Hiện thực hóa toàn bộ truy vấn CSDL:
  - `GetAllSubscriptionsAsync`: trả về danh sách đăng ký kèm thông tin User, hỗ trợ lọc `pending/active/rejected/cancelled/expired`.
  - `GetByIdAsync`: nạp đầy đủ navigation property `User` kèm `Subscription`.
- [x] **`SubscriptionService.cs`** - Business logic hoàn chỉnh:
  - `GetSubscriptionStatusAsync`: kiểm tra và tự động hạ về gói Free khi hết hạn, trả về thống kê sử dụng tòa/phòng/AI Audit.
  - `RequestUpgradeAsync`: tạo bản ghi `Subscription` với trạng thái `Pending`, sinh mã QR VietQR hoặc thông tin chuyển khoản thủ công.
  - `HandlePayOSWebhookAsync`: xác thực và tự kích hoạt gói khi có thanh toán qua VietQR.
  - `ApproveSubscriptionAsync` / `RejectSubscriptionAsync` / `RevokeSubscriptionAsync`: duyệt, từ chối, thu hồi gói kèm thông báo hệ thống cho Chủ nhà.
- [x] **`SubscriptionController.cs`** - API endpoints:
  - Bổ sung endpoints `GET /api/subscriptions/admin/all`, `POST /api/subscriptions/admin/{id}/approve`, `POST /api/subscriptions/admin/{id}/reject`, `POST /api/subscriptions/admin/{id}/revoke`.
  - Bảo vệ routes bằng `[Authorize(Roles = "Admin")]`.
- [x] **Frontend `Subscriptions.tsx` (Admin)**:
  - Dashboard quản lý gói cước toàn diện: bảng danh sách, lọc theo trạng thái, xem ảnh biên lai chuyển khoản.
  - Modal phê duyệt/từ chối/thu hồi có ô nhập lý do.
  - Hiển thị badge trạng thái màu sắc rõ ràng (Pending/Active/Rejected/Cancelled/Expired).
- [x] **Frontend `Subscription.tsx` (Owner)**:
  - Hiển thị thống kê sử dụng tòa nhà/phòng/AI Audit so với ngưỡng giới hạn gói.
  - Thanh progress bar trực quan cho từng chỉ số.
  - Form đăng ký nâng cấp gói với lựa chọn VietQR và chuyển khoản thủ công.

---

# [Phase 11] Quản lý Tòa Nhà cho Admin - Khóa/Mở tòa nhà có migration CSDL

## Ngày thực hiện

```text
24/07/2026
```

## Đã hoàn thành

- [x] **Migration CSDL `AddBuildingLockStatus`**:
  - Thêm cột `IsLocked` (bool, mặc định `false`) và `LockReason` (nvarchar, nullable) vào bảng `Buildings`.
  - Cập nhật `ApplicationDbContextModelSnapshot` và `BuildingConfiguration` tương ứng.
- [x] **Entity `Building.cs`**:
  - Bổ sung property `IsLocked` và `LockReason` vào Domain Entity.
- [x] **`IAdminBuildingService` và `AdminBuildingService.cs`**:
  - `GetAllBuildingsAsync`: truy vấn toàn bộ tòa nhà kèm thống kê phòng (Occupied/Maintenance/Vacant), thông tin chủ nhà và trạng thái khóa.
  - `ToggleLockBuildingAsync`: toggle khóa/mở tòa nhà, cascade ẩn/hiện (`HiddenByOwner`, `IsPublished`) tất cả phòng thuộc tòa, tạo thông báo hệ thống tới Chủ nhà kèm lý do.
- [x] **`AdminBuildingsController.cs`**:
  - Bổ sung endpoint `POST /api/admin/buildings/{id}/toggle-lock` nhận body `{ reason }` từ Admin.
  - Route `GET /api/admin/buildings` trả về danh sách đầy đủ tòa nhà toàn hệ thống.
- [x] **`PropertyService.cs`**:
  - Cập nhật logic `CreateBuildingAsync` / `UpdateBuildingAsync` để map `IsLocked` và `LockReason` vào DTO response.
- [x] **`PropertyDtos.cs` và `AdminBuildingDto.cs`**:
  - Bổ sung field `IsLocked` và `LockReason` vào các DTO phản hồi tương ứng.
- [x] **Frontend `Buildings.tsx` (Admin)**:
  - Bảng quản lý tòa nhà toàn hệ thống với indicator trạng thái Locked/Active.
  - Nút "Khóa / Mở khóa" kèm modal nhập lý do khóa.
  - Hiển thị thông tin chủ nhà, số phòng, giá dịch vụ cho từng tòa nhà.
- [x] **Frontend `PropertyDetail.tsx` và `PropertyList.tsx` (Owner)**:
  - Hiển thị cảnh báo khi tòa nhà bị khóa bởi Admin, bao gồm lý do khóa.

---

# [Phase 12] Cải tiến InvoiceService: bổ sung interface, repository và kết hợp hóa đơn Tenant Online/Offline

## Ngày thực hiện

```text
25/07/2026
```

## Đã hoàn thành

- [x] **Bổ sung method `GetInvoicesByTenantEmailAsync` vào `IInvoiceRepository`**:
  - Khai báo phương thức truy vấn hóa đơn theo email `TemporaryTenantEmail` của khách thuê offline/online.
- [x] **Hiện thực `GetInvoicesByTenantEmailAsync` trong `InvoiceRepository.cs`**:
  - So sánh email không phân biệt hoa thường (lowercase), lọc hợp đồng chưa bị xóa, eager-load đầy đủ Room/Floor/Building/Payments.
- [x] **Cải tiến `GetTenantInvoicesAsync` trong `InvoiceService.cs`**:
  - Sau khi tải hóa đơn theo `TenantId`, bổ sung logic lấy thêm hóa đơn theo `TemporaryTenantEmail` (khách thuê offline có email trùng với tài khoản hệ thống).
  - Dùng `HashSet<int>` để deduplicate, tránh hiển thị hóa đơn trùng lặp.
  - Sắp xếp kết hợp theo `InvoiceDate` giảm dần và `Id` giảm dần để đảm bảo thứ tự nhất quán.
- [x] **Cải tiến `BuildingRepository.cs`**:
  - Bổ sung method hỗ trợ lấy tòa nhà với đầy đủ navigation Floors/Rooms phục vụ thống kê sử dụng của SubscriptionService.
- [x] **Frontend `AdminLayout.tsx`, `Dashboard.tsx`, `Rooms.tsx`, `Users.tsx`**:
  - Bổ sung menu mục Subscriptions và Buildings vào sidebar Admin.
  - Dashboard Admin: bổ sung widgets thống kê tổng quan (tổng tòa nhà, tổng phòng, người dùng mới tháng này, doanh thu).
  - Rooms Management: bảng quản lý phòng toàn hệ thống với lọc trạng thái.
  - Users Management: bảng quản lý người dùng toàn hệ thống với tìm kiếm, lọc vai trò và chức năng cấm/bỏ cấm tài khoản.
- [x] **Frontend `AuthContext.tsx` và `Login.tsx`**:
  - Đồng bộ trạng thái đăng nhập và vai trò Admin/Owner/Tenant để điều hướng chính xác.
- [x] **Frontend `MyRoom.tsx` (Tenant)**:
  - Bổ sung hiển thị cảnh báo khi phòng/tòa nhà bị khóa bởi Admin.
- [x] **Frontend `api.ts`**:
  - Bổ sung các hàm gọi API cho Admin Buildings, Admin Subscriptions và Tenant Invoice.

## Thay đổi chi tiết

| STT | Nội dung thay đổi | Người thực hiện | File/Module liên quan | Minh chứng |
|---:|---|---|---|---|
| 1 | Bổ sung `GetInvoicesByTenantEmailAsync` vào interface | Phan Hoài An | [IInvoiceRepository.cs](file:///d:/Ky8/PRN232/Project/prn232-su26-ai-audit-project-prn232_se18d05_group-07/RoomHub.Backend/RoomHub.Application/Common/Interfaces/IInvoiceRepository.cs) | Commit 955ebf5 |
| 2 | Hiện thực truy vấn email trong InvoiceRepository | Phan Hoài An | [InvoiceRepository.cs](file:///d:/Ky8/PRN232/Project/prn232-su26-ai-audit-project-prn232_se18d05_group-07/RoomHub.Backend/RoomHub.Infrastructure/Persistence/Repositories/InvoiceRepository.cs) | Commit 955ebf5 |
| 3 | Cải tiến GetTenantInvoicesAsync kết hợp online/offline | Phan Hoài An | [InvoiceService.cs](file:///d:/Ky8/PRN232/Project/prn232-su26-ai-audit-project-prn232_se18d05_group-07/RoomHub.Backend/RoomHub.Application/Services/InvoiceService.cs) | Commit 955ebf5 |
| 4 | Hệ thống Subscription Service và Repository hoàn chỉnh | Phan Hoài An | [SubscriptionService.cs](file:///d:/Ky8/PRN232/Project/prn232-su26-ai-audit-project-prn232_se18d05_group-07/RoomHub.Backend/RoomHub.Application/Services/SubscriptionService.cs), [SubscriptionRepository.cs](file:///d:/Ky8/PRN232/Project/prn232-su26-ai-audit-project-prn232_se18d05_group-07/RoomHub.Backend/RoomHub.Infrastructure/Persistence/Repositories/SubscriptionRepository.cs) | Commit 2a6e467 |
| 5 | SubscriptionController endpoints cho Admin | Phan Hoài An | [SubscriptionController.cs](file:///d:/Ky8/PRN232/Project/prn232-su26-ai-audit-project-prn232_se18d05_group-07/RoomHub.Backend/RoomHub.API/Controllers/SubscriptionController.cs) | Commit 2a6e467 |
| 6 | Migration CSDL thêm IsLocked/LockReason cho Buildings | Phan Hoài An | [AddBuildingLockStatus.cs](file:///d:/Ky8/PRN232/Project/prn232-su26-ai-audit-project-prn232_se18d05_group-07/RoomHub.Backend/RoomHub.Infrastructure/Migrations/20260724171413_AddBuildingLockStatus.cs), [Building.cs](file:///d:/Ky8/PRN232/Project/prn232-su26-ai-audit-project-prn232_se18d05_group-07/RoomHub.Backend/RoomHub.Domain/Entities/Building.cs) | Commit fa081f1 |
| 7 | AdminBuildingService: GetAllBuildings & ToggleLock | Phan Hoài An | [AdminBuildingService.cs](file:///d:/Ky8/PRN232/Project/prn232-su26-ai-audit-project-prn232_se18d05_group-07/RoomHub.Backend/RoomHub.Infrastructure/Services/AdminBuildingService.cs) | Commit fa081f1 |
| 8 | AdminBuildingsController API endpoints | Phan Hoài An | [AdminBuildingsController.cs](file:///d:/Ky8/PRN232/Project/prn232-su26-ai-audit-project-prn232_se18d05_group-07/RoomHub.Backend/RoomHub.API/Controllers/AdminBuildingsController.cs) | Commit b22ab05, fa081f1 |
| 9 | Frontend Admin: Dashboard, Buildings, Subscriptions, Users, Rooms | Phan Hoài An | Buildings.tsx, Subscriptions.tsx, Dashboard.tsx, Users.tsx, Rooms.tsx | Commit 2a6e467, b22ab05, fa081f1, 955ebf5 |
| 10 | Frontend Owner: PropertyDetail, PropertyList cảnh báo khóa tòa | Phan Hoài An | PropertyDetail.tsx, PropertyList.tsx | Commit fa081f1 |
