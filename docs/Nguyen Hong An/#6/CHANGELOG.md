# Changelog

## 1. Quy định ghi Changelog

File này ghi lại các thay đổi khi thực hiện **Chức năng Dịch vụ (Service Requests)** của sinh viên Nguyễn Hồng An.

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
| MSSV / Danh sách MSSV | DE180358 |
| Giảng viên hướng dẫn | Thầy Lê Thiện Nhật Quang |
| Repository URL | https://github.com/fptu-se-su26/prn232-su26-ai-audit-project-prn232_se18d05_group-07 |
| Ngày bắt đầu | 25/07/2026 |
| Ngày hoàn thành | 25/07/2026 |

---

## 3. Tổng quan các phiên bản/giai đoạn

| Phiên bản/Giai đoạn | Thời gian | Nội dung chính | Trạng thái |
|---|---|---|---|
| Phase 04 | 25/07/2026 | Implementation: Dịch vụ (Backend 3 vai trò + Frontend 3 trang) | Completed |
| Phase 05 | 25/07/2026 | Chạy thử API 3 vai trò + typecheck | Completed |

---

# [Phase 04] Chức năng Dịch vụ (Service Requests)

## Ngày thực hiện

```text
25/07/2026
```

## Đã hoàn thành

- [x] Tạo nhánh riêng `feature/de180358-service-requests` từ `main` mới nhất
- [x] DTO: danh mục dịch vụ + yêu cầu dịch vụ (`ServiceDtos`)
- [x] Repository: `IServiceRepository`/`ServiceRepository`, `IServiceRequestRepository`/`ServiceRequestRepository`
- [x] Service: `ServiceCatalogService` (CRUD danh mục), `ServiceRequestService` (tạo/hủy/lấy theo tenant, lấy/cập nhật theo owner)
- [x] Controller: `ServicesController` (danh mục + admin CRUD), `TenantServiceRequestsController`, `OwnerServiceRequestsController`
- [x] Đăng ký DI cho 2 repository + 2 service
- [x] Frontend: `tenant/ServiceRequests.tsx`, `owner/ServiceRequests.tsx`, `admin/Services.tsx`
- [x] Gắn route + menu cho 3 khu vực (`App.tsx`, `TenantLayout`, `OwnerLayout`, `AdminLayout`)
- [x] Không cần migration (bảng `Services`, `ServiceRequests` đã có sẵn)
- [x] Build backend 0 lỗi, typecheck frontend exit 0, test API 3 vai trò đạt

## Thay đổi chi tiết

| STT | Nội dung thay đổi | Người thực hiện | File/Module liên quan | Minh chứng |
|---:|---|---|---|---|
| 1 | DTO dịch vụ & yêu cầu | Nguyễn Hồng An | `DTOs/Services/ServiceDtos.cs` | Commit Git |
| 2 | Repository danh mục & yêu cầu | Nguyễn Hồng An | `ServiceRepository.cs`, `ServiceRequestRepository.cs` | Commit Git |
| 3 | Service nghiệp vụ | Nguyễn Hồng An | `ServiceCatalogService.cs`, `ServiceRequestService.cs` | Commit Git |
| 4 | 3 Controller theo vai trò | Nguyễn Hồng An | `ServicesController.cs`, `TenantServiceRequestsController.cs`, `OwnerServiceRequestsController.cs` | Commit Git |
| 5 | Đăng ký DI | Nguyễn Hồng An | `Infrastructure/DependencyInjection.cs` | Commit Git |
| 6 | 3 trang giao diện | Nguyễn Hồng An | `tenant/ServiceRequests.tsx`, `owner/ServiceRequests.tsx`, `admin/Services.tsx` | Commit Git |
| 7 | Điều hướng + menu 3 khu vực | Nguyễn Hồng An | `App.tsx`, `TenantLayout.tsx`, `OwnerLayout.tsx`, `AdminLayout.tsx` | Commit Git |

## API endpoints

| Method | Route | Quyền | Mô tả |
|---|---|---|---|
| GET | `/api/services` | Đã đăng nhập | Danh mục dịch vụ |
| POST | `/api/admin/services` | Admin | Thêm dịch vụ |
| PUT | `/api/admin/services/{id}` | Admin | Sửa dịch vụ |
| DELETE | `/api/admin/services/{id}` | Admin | Xóa dịch vụ |
| POST | `/api/tenant/service-requests` | Tenant | Gửi yêu cầu dịch vụ |
| GET | `/api/tenant/service-requests` | Tenant | Yêu cầu của tôi |
| DELETE | `/api/tenant/service-requests/{id}` | Tenant | Hủy yêu cầu (khi Pending) |
| GET | `/api/owner/service-requests` | PropertyOwner | Yêu cầu từ khách thuê của tôi |
| PUT | `/api/owner/service-requests/{id}/status` | PropertyOwner | Duyệt/Hoàn thành/Từ chối |

## AI có hỗ trợ không?

- [x] Có
- [ ] Không

Nếu có, mô tả AI đã hỗ trợ phần nào:

```text
Claude Code sinh mã backend (3 controller, service, repository, DI) và frontend (3 trang cho 3 vai trò) theo mẫu,
liên kết yêu cầu với hợp đồng, và chạy thử API cả 3 vai trò. Sinh viên định hướng phân quyền, vòng đời trạng thái
và kiểm chứng.
```

## Commit/Screenshot minh chứng

```text
Nhánh: feature/de180358-service-requests
Kiểm thử: chạy API bản build tạm trên cổng 5299; admin tạo dịch vụ → tenant yêu cầu (tự gắn hợp đồng/phòng) → owner
duyệt. Tất cả trả về đúng.
```

## Ghi chú

```text
Yêu cầu dịch vụ gắn với hợp đồng đang hiệu lực của người thuê; chủ trọ chỉ thấy/xử lý yêu cầu của khách thuê thuộc
hợp đồng do mình sở hữu (lọc theo OwnerId). Vòng đời: Pending → Approved/Rejected → Completed.
```

---

## 4. Tổng kết thay đổi cuối chức năng

### 4.1. Các chức năng đã hoàn thành

| STT | Chức năng | Trạng thái | Minh chứng | Ghi chú |
|---|---|---|---|---|
| 1 | Admin quản lý danh mục dịch vụ (CRUD) | Completed | /api/admin/services | Trang admin/Services |
| 2 | Người thuê xem & gửi & hủy yêu cầu | Completed | /api/tenant/service-requests | Trang tenant/ServiceRequests |
| 3 | Chủ trọ xử lý yêu cầu (duyệt/hoàn thành/từ chối) | Completed | /api/owner/service-requests | Trang owner/ServiceRequests |

---

## 5. Cam kết cập nhật Changelog

Sinh viên cam kết rằng nội dung changelog phản ánh đúng các thay đổi thực tế đã thực hiện.

| Sinh viên xác nhận | Ngày xác nhận |
|---|---|
| Nguyễn Hồng An | 25/07/2026 |
