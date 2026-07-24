# AI Audit Log - Đợt cập nhật #8

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
| Ngày bắt đầu | 24/07/2026 |
| Ngày hoàn thành | 25/07/2026 |

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

- Xây dựng toàn bộ hệ thống Subscription (gói cước) cho nền tảng RoomHub bao gồm: `SubscriptionLimits.cs`, `SubscriptionStatus` enum, `ISubscriptionRepository`, `ISubscriptionService`, `SubscriptionRepository.cs`, `SubscriptionService.cs`, `SubscriptionController.cs` và các trang Frontend `Subscriptions.tsx` (Admin) và `Subscription.tsx` (Owner).
- Thiết kế và hiện thực tính năng Quản lý Tòa Nhà cho Admin với khả năng Khóa/Mở khóa tòa nhà, bao gồm EF Core migration `AddBuildingLockStatus`, cập nhật Entity `Building.cs`, `IAdminBuildingService`, `AdminBuildingService.cs`, `AdminBuildingsController.cs` và các trang Frontend `Buildings.tsx`, `PropertyDetail.tsx`, `PropertyList.tsx`.
- Cải tiến `InvoiceService.cs` để kết hợp hóa đơn của khách thuê Online (theo `TenantId`) và Offline (theo `TemporaryTenantEmail`) trong phương thức `GetTenantInvoicesAsync`, bổ sung method `GetInvoicesByTenantEmailAsync` vào `IInvoiceRepository` và `InvoiceRepository.cs`.
- Cải tiến và mở rộng Dashboard Admin, trang quản lý phòng (`Rooms.tsx`), trang quản lý người dùng (`Users.tsx`) và `AdminLayout.tsx`.
- Thực hiện kiểm chứng biên dịch toàn hệ thống.

---

## 4. Nhật ký sử dụng AI chi tiết

---

### Lần sử dụng AI số 1

| Nội dung | Thông tin |
|---|---|
| Giai đoạn | Backend Services / Phase 10 |
| Ngày sử dụng | 24/07/2026 |
| Công cụ AI | Antigravity |
| Mục đích sử dụng | Xây dựng hệ thống Quản lý Gói Cước (Subscription) toàn diện cho Chủ nhà và Admin |
| Phần việc liên quan | SubscriptionLimits, SubscriptionStatus, ISubscriptionRepository, ISubscriptionService, SubscriptionRepository, SubscriptionService, SubscriptionController |
| Mức độ sử dụng | Hỗ trợ nhiều / Sinh chính nội dung |

#### 4.1. Prompt đã sử dụng

```text
implement subscription management system with plan limits, status tracking, and admin oversight controllers
```

*(AI tự động lập kế hoạch và triển khai hệ thống Subscription đầy đủ từ Domain đến Infrastructure đến API)*

#### 4.2. Kết quả AI gợi ý

AI thiết kế và viết code:
- Định nghĩa `SubscriptionLimits.cs` với các hằng số giới hạn gói Free và Pro, phương thức tĩnh tra cứu ngưỡng.
- Cập nhật enum `SubscriptionStatus` bổ sung trạng thái `Expired`.
- Khai báo interface `ISubscriptionRepository` và `ISubscriptionService` với đầy đủ phương thức CRUD và duyệt gói.
- Hiện thực `SubscriptionRepository.cs` với truy vấn lọc theo trạng thái và load đầy đủ thông tin User.
- Hiện thực `SubscriptionService.cs` với toàn bộ business logic: kiểm tra hết hạn, tạo đăng ký, sinh QR VietQR, duyệt/từ chối/thu hồi gói, gửi thông báo hệ thống.
- Cập nhật `SubscriptionController.cs` bổ sung các endpoints Admin.

#### 4.3. Phần sinh viên/nhóm đã sử dụng từ AI

Sử dụng toàn bộ logic backend code ở các Service, Repository và Controller.

#### 4.4. Minh chứng

- Files liên quan: `SubscriptionLimits.cs`, `SubscriptionStatus.cs`, `ISubscriptionRepository.cs`, `ISubscriptionService.cs`, `SubscriptionRepository.cs`, `SubscriptionService.cs`, `SubscriptionController.cs`
- Commit: `2a6e467`

---

### Lần sử dụng AI số 2

| Nội dung | Thông tin |
|---|---|
| Giai đoạn | Backend Services & Database / Phase 11 |
| Ngày sử dụng | 24/07/2026 |
| Công cụ AI | Antigravity |
| Mục đích sử dụng | Xây dựng tính năng Quản lý Tòa Nhà cho Admin: Khóa/Mở khóa tòa nhà có migration CSDL |
| Phần việc liên quan | Building.cs, BuildingConfiguration, AdminBuildingService, AdminBuildingsController, Migration |
| Mức độ sử dụng | Hỗ trợ nhiều / Sinh chính nội dung |

#### 4.1. Prompt đã sử dụng

```text
implement admin building management features and register associated infrastructure services
```

*(Tiếp theo:)*

```text
implement admin building lock/unlock functionality and database schema updates
```

#### 4.2. Kết quả AI gợi ý

AI thiết kế và cập nhật:
- Bổ sung property `IsLocked` và `LockReason` vào Domain Entity `Building.cs` và `BuildingConfiguration.cs`.
- Tạo EF Core migration `AddBuildingLockStatus` thêm 2 cột mới vào bảng `Buildings`.
- Hiện thực `AdminBuildingService.cs` với `GetAllBuildingsAsync` (trả về thống kê phòng theo trạng thái) và `ToggleLockBuildingAsync` (cascade khóa/mở tất cả phòng thuộc tòa, tạo thông báo Chủ nhà).
- Cập nhật `AdminBuildingsController.cs` với endpoints `GET /api/admin/buildings` và `POST /api/admin/buildings/{id}/toggle-lock`.
- Cập nhật `DependencyInjection.cs` đăng ký `IAdminBuildingService` → `AdminBuildingService`.

#### 4.3. Phần sinh viên/nhóm đã sử dụng từ AI

Sử dụng toàn bộ logic backend code ở Service, Controller và Migration.

#### 4.4. Minh chứng

- Files liên quan: `Building.cs`, `BuildingConfiguration.cs`, `AddBuildingLockStatus.cs`, `AdminBuildingService.cs`, `AdminBuildingsController.cs`, `DependencyInjection.cs`
- Commit: `b22ab05`, `fa081f1`

---

### Lần sử dụng AI số 3

| Nội dung | Thông tin |
|---|---|
| Giai đoạn | Backend Services / Phase 12 |
| Ngày sử dụng | 25/07/2026 |
| Công cụ AI | Antigravity |
| Mục đích sử dụng | Cải tiến InvoiceService: kết hợp hóa đơn Tenant Online/Offline, bổ sung interface và repository method |
| Phần việc liên quan | IInvoiceRepository, InvoiceRepository, InvoiceService |
| Mức độ sử dụng | Hỗ trợ nhiều / Sinh chính nội dung |

#### 4.1. Prompt đã sử dụng

```text
implement InvoiceService and supporting repository interfaces for billing management
```

#### 4.2. Kết quả AI gợi ý

AI thiết kế và cập nhật:
- Khai báo `GetInvoicesByTenantEmailAsync(string email)` vào `IInvoiceRepository`.
- Hiện thực phương thức truy vấn trong `InvoiceRepository.cs` với so sánh email không phân biệt hoa thường.
- Cải tiến `GetTenantInvoicesAsync` trong `InvoiceService.cs`: sau khi lấy hóa đơn theo `TenantId`, bổ sung truy vấn theo `TemporaryTenantEmail` và dùng `HashSet<int>` loại bỏ trùng lặp, sắp xếp kết quả nhất quán.
- Cập nhật `BuildingRepository.cs` bổ sung method navigation Floors/Rooms phục vụ thống kê.
- Bổ sung menu Admin (Buildings, Subscriptions) vào `AdminLayout.tsx` và mở rộng các trang Admin Dashboard, Rooms, Users.

#### 4.3. Phần sinh viên/nhóm đã sử dụng từ AI

Sử dụng toàn bộ logic backend code trong `IInvoiceRepository.cs`, `InvoiceRepository.cs`, `InvoiceService.cs` và code Frontend Admin.

#### 4.4. Minh chứng

- Files liên quan: `IInvoiceRepository.cs`, `InvoiceRepository.cs`, `InvoiceService.cs`, `BuildingRepository.cs`, `AdminLayout.tsx`, `Dashboard.tsx`, `Rooms.tsx`, `Users.tsx`
- Commit: `955ebf5`
