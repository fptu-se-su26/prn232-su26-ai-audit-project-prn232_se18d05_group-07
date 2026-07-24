# Prompt Log - Đợt cập nhật #8

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
| Ngày cập nhật gần nhất | 25/07/2026 |

---

## 2. Mục đích của file Prompt Log

File này dùng để ghi lại các prompt quan trọng đã sử dụng trong quá trình thực hiện bài tập, lab, assignment hoặc project.

Sinh viên/nhóm cần ghi lại:
- Đã hỏi AI điều gì.
- Mục đích sử dụng prompt.
- Công cụ AI đã sử dụng.
- AI đã trả lời hoặc gợi ý gì.
- Kết quả đó có được áp dụng vào bài hay không.
- Sinh viên/nhóm đã kiểm tra, chỉnh sửa hoặc cải tiến gì sau khi nhận kết quả từ AI.

---

## 3. Công cụ AI đã sử dụng

Đánh dấu các công cụ AI đã sử dụng.

- [ ] ChatGPT
- [ ] Gemini
- [ ] Claude
- [ ] GitHub Copilot
- [ ] Cursor
- [x] Antigravity
- [ ] Microsoft Copilot
- [ ] Perplexity
- [ ] Công cụ khác: ....................................

---

## 4. Bảng tổng hợp prompt đã sử dụng

| STT | Ngày | Công cụ AI | Mục đích | Prompt tóm tắt | Kết quả chính | Có sử dụng vào bài không? | Minh chứng |
|---:|---|---|---|---|---|---|---|
| 1 | 24/07/2026 | Antigravity | Xây dựng hệ thống Subscription | implement subscription management system with plan limits, status tracking, and admin oversight controllers | Tạo SubscriptionLimits, SubscriptionRepository, SubscriptionService, SubscriptionController với đầy đủ logic duyệt gói | Có | Commit 2a6e467 / File code |
| 2 | 24/07/2026 | Antigravity | Xây dựng Admin Building Management | implement admin building management features and register associated infrastructure services | Tạo IAdminBuildingService, AdminBuildingService, cập nhật DI, trang Buildings Admin | Có | Commit b22ab05 / File code |
| 3 | 24/07/2026 | Antigravity | Thêm tính năng khóa tòa nhà | implement admin building lock/unlock functionality and database schema updates | Tạo Migration AddBuildingLockStatus, cập nhật Building entity, AdminBuildingService ToggleLock | Có | Commit fa081f1 / File code |
| 4 | 25/07/2026 | Antigravity | Cải tiến InvoiceService | implement InvoiceService and supporting repository interfaces for billing management | Bổ sung GetInvoicesByTenantEmailAsync, cải tiến GetTenantInvoicesAsync kết hợp online/offline | Có | Commit 955ebf5 / File code |

---

## 5. Prompt chi tiết

---

### Prompt số 1

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng | 24/07/2026 |
| Công cụ AI | Antigravity |
| Mục đích | Xây dựng hệ thống Subscription từ Domain đến API |
| Phần việc liên quan | SubscriptionLimits, SubscriptionStatus, ISubscriptionRepository, ISubscriptionService, SubscriptionRepository, SubscriptionService, SubscriptionController |
| Mức độ sử dụng | Hỏi phân tích và sinh code |

#### 5.1. Prompt nguyên văn

```text
implement subscription management system with plan limits, status tracking, and admin oversight controllers
```

#### 5.2. Bối cảnh khi viết prompt

Hệ thống RoomHub cần phân biệt Chủ nhà gói Free (giới hạn 1 tòa, 10 phòng, 2 AI Audit/tháng) và gói Pro (không giới hạn). Cần có luồng đăng ký nâng cấp gói qua VietQR và chuyển khoản thủ công, luồng Admin phê duyệt/từ chối/thu hồi gói cước, và trang giao diện quản lý cho cả hai phía.

#### 5.3. Kết quả AI trả về

AI đề xuất kiến trúc phân lớp rõ ràng: Domain (SubscriptionLimits, enum) → Application (Interface, Service) → Infrastructure (Repository) → API (Controller) → Frontend (Admin Subscriptions page, Owner Subscription page). AI viết đầy đủ code từng lớp với đầy đủ logic nghiệp vụ.

#### 5.4. Sự kiểm chứng và cải tiến của sinh viên/nhóm

Em đã kiểm tra logic kiểm tra hết hạn trong `GetSubscriptionStatusAsync`, đảm bảo tự động hạ về Free đúng. Em xem xét lại logic `HandlePayOSWebhookAsync` và bổ sung kiểm tra `sub.UserId != ownerId` để tránh trường hợp người dùng khác kích hoạt gói bằng cách đoán `subscriptionId` trong memo thanh toán — AI ban đầu không có kiểm tra này.

---

### Prompt số 2

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng | 24/07/2026 |
| Công cụ AI | Antigravity |
| Mục đích | Tạo service và register DI cho Admin Building Management |
| Phần việc liên quan | IAdminBuildingService, AdminBuildingService, DependencyInjection |
| Mức độ sử dụng | Sinh code và tích hợp vào dự án |

#### 5.1. Prompt nguyên văn

```text
implement admin building management features and register associated infrastructure services
```

#### 5.2. Bối cảnh khi viết prompt

Admin cần có khả năng xem toàn bộ tòa nhà trên hệ thống (kể cả của Chủ nhà khác), kèm thống kê số phòng occupied/maintenance/vacant, thông tin chủ nhà. Cần tạo `IAdminBuildingService`, `AdminBuildingService` và đăng ký DI trong `DependencyInjection.cs`.

#### 5.3. Kết quả AI trả về

AI thiết kế `GetAllBuildingsAsync` với projection query LINQ tối ưu, tránh lấy thừa dữ liệu, tính `VacantRooms = TotalRooms - OccupiedRooms - MaintenanceRooms`. AI đăng ký service vào DI container đúng Scoped lifecycle.

#### 5.4. Sự kiểm chứng và cải tiến của sinh viên/nhóm

Em đã kiểm tra query không lazy loading và có `AsNoTracking()` đúng. Em chỉnh sửa logic map `District` khi trống thì fallback về `City` để không hiển thị chuỗi rỗng trên giao diện Admin.

---

### Prompt số 3

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng | 24/07/2026 |
| Công cụ AI | Antigravity |
| Mục đích | Bổ sung tính năng Khóa/Mở khóa tòa nhà kèm migration CSDL |
| Phần việc liên quan | Building.cs, BuildingConfiguration, AddBuildingLockStatus migration, AdminBuildingService.ToggleLock |
| Mức độ sử dụng | Sinh code và migration |

#### 5.1. Prompt nguyên văn

```text
implement admin building lock/unlock functionality and database schema updates
```

#### 5.2. Bối cảnh khi viết prompt

Cần lưu trạng thái khóa tòa nhà xuống CSDL (thêm cột `IsLocked` và `LockReason` vào bảng `Buildings`), đồng thời cần cascade ẩn/hiện tất cả phòng thuộc tòa và gửi thông báo đến Chủ nhà khi tòa bị khóa/mở.

#### 5.3. Kết quả AI trả về

AI tạo migration `AddBuildingLockStatus` đúng chuẩn EF Core với `MigrationBuilder.AddColumn`. Trong `ToggleLockBuildingAsync`, AI cascade cập nhật `HiddenByOwner` và `IsPublished` cho tất cả phòng và tạo `Notification` phân biệt `BuildingLocked` / `BuildingUnlocked` kèm nội dung mô tả lý do khóa.

#### 5.4. Sự kiểm chứng và cải tiến của sinh viên/nhóm

Em đã chạy `dotnet ef database update` kiểm tra migration thành công. Em xem xét logic cascade và nhận thấy AI xử lý đúng: khi mở khóa thì bật lại `IsPublished = true`, điều này phù hợp với logic hiển thị phòng trên trang tìm kiếm công khai.

---

### Prompt số 4

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng | 25/07/2026 |
| Công cụ AI | Antigravity |
| Mục đích | Cải tiến InvoiceService kết hợp hóa đơn Tenant Online và Offline |
| Phần việc liên quan | IInvoiceRepository, InvoiceRepository, InvoiceService, BuildingRepository, Frontend Admin |
| Mức độ sử dụng | Sinh code cải tiến và mở rộng |

#### 5.1. Prompt nguyên văn

```text
implement InvoiceService and supporting repository interfaces for billing management
```

#### 5.2. Bối cảnh khi viết prompt

Khách thuê đã có tài khoản nhưng hợp đồng ban đầu được tạo khi họ chưa đăng ký (offline) sẽ bị thiếu hóa đơn vì hóa đơn lưu trong `TemporaryTenantEmail` mà không gắn `TenantId`. Cần một giải pháp để `GetTenantInvoicesAsync` trả về đủ cả hai loại hóa đơn cho cùng một người dùng.

#### 5.3. Kết quả AI trả về

AI đề xuất khai báo method mới `GetInvoicesByTenantEmailAsync` trong `IInvoiceRepository`, hiện thực trong `InvoiceRepository.cs` với truy vấn so sánh email lowercase. Trong `InvoiceService.cs`, AI bổ sung sau bước lấy hóa đơn theo `TenantId` thì tiếp tục lấy theo email và dùng `HashSet<int>` để dedup trước khi trả về.

#### 5.4. Sự kiểm chứng và cải tiến của sinh viên/nhóm

Em đã kiểm tra edge case khi `tenantEmail` là null hoặc empty thì bỏ qua bước query email (AI đã xử lý đúng với `!string.IsNullOrEmpty`). Em xem xét thứ tự sort: AI sắp xếp theo `InvoiceDate` giảm dần và `Id` giảm dần là đúng, đảm bảo nhất quán khi có nhiều hóa đơn cùng tháng.
