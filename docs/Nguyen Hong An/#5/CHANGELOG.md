# Changelog

## 1. Quy định ghi Changelog

File này ghi lại các thay đổi khi thực hiện chức năng **Yêu cầu bảo trì** cho người thuê của sinh viên Nguyễn Hồng An.

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
| Phase 04 | 25/07/2026 | Implementation: Yêu cầu bảo trì (FE + BE) | Completed |
| Phase 05 | 25/07/2026 | Chạy thử API thật + typecheck | Completed |

---

# [Phase 04] Chức năng Yêu cầu bảo trì cho người thuê

## Ngày thực hiện

```text
25/07/2026
```

## Đã hoàn thành

- [x] Tạo nhánh riêng `feature/de180358-tenant-maintenance` từ `main` mới nhất
- [x] DTO: `CreateMaintenanceTicketRequest`, `MaintenanceTicketDto`
- [x] Repository: `IMaintenanceTicketRepository` + `MaintenanceTicketRepository`
- [x] Service: `IMaintenanceTicketService` + `MaintenanceTicketService` (lấy phòng đang thuê qua `IContractService`, tạo trạng thái Open, cho hủy khi chưa xử lý)
- [x] Controller: `MaintenanceController` với 3 endpoint
- [x] Đăng ký DI repository & service
- [x] Frontend: nối `Maintenance.tsx` vào API (tạo, danh sách, hủy), bỏ dữ liệu mẫu và nhãn AI sentiment
- [x] Không cần migration (bảng `MaintenanceTickets` đã có sẵn)
- [x] Build backend 0 lỗi; test API thật (login/tạo/danh sách/hủy) đạt

## Thay đổi chi tiết

| STT | Nội dung thay đổi | Người thực hiện | File/Module liên quan | Minh chứng |
|---:|---|---|---|---|
| 1 | DTO yêu cầu bảo trì | Nguyễn Hồng An | `DTOs/Maintenance/MaintenanceTicketDtos.cs` | Commit Git |
| 2 | Interface + repository | Nguyễn Hồng An | `IMaintenanceTicketRepository.cs`, `MaintenanceTicketRepository.cs` | Commit Git |
| 3 | Interface + service | Nguyễn Hồng An | `IMaintenanceTicketService.cs`, `MaintenanceTicketService.cs` | Commit Git |
| 4 | Controller 3 endpoint | Nguyễn Hồng An | `API/Controllers/MaintenanceController.cs` | Commit Git |
| 5 | Đăng ký DI | Nguyễn Hồng An | `Infrastructure/DependencyInjection.cs` | Commit Git |
| 6 | Nối trang bảo trì vào API | Nguyễn Hồng An | `Frontend/src/pages/tenant/Maintenance.tsx` | Commit Git |

## API endpoints

| Method | Route | Quyền | Mô tả |
|---|---|---|---|
| POST | `/api/tenant/maintenance` | Tenant | Tạo yêu cầu bảo trì cho phòng đang thuê |
| GET | `/api/tenant/maintenance` | Tenant | Danh sách yêu cầu của tôi |
| DELETE | `/api/tenant/maintenance/{id}` | Tenant | Hủy yêu cầu của mình (khi trạng thái Open) |

## AI có hỗ trợ không?

- [x] Có
- [ ] Không

Nếu có, mô tả AI đã hỗ trợ phần nào:

```text
Claude Code sinh mã backend/frontend theo mẫu các chức năng trước, tái dùng IContractService để lấy phòng đang thuê,
và chạy thử API thật. Sinh viên định hướng, bỏ nhãn AI sentiment cho trung thực và kiểm chứng.
```

## Commit/Screenshot minh chứng

```text
Nhánh: feature/de180358-tenant-maintenance
Kiểm thử: chạy API bản build tạm trên cổng 5299; tạo yêu cầu tự gắn đúng phòng đang thuê, danh sách và hủy đều đúng.
```

## Ghi chú

```text
Yêu cầu tạo ra ở trạng thái Open; phía chủ trọ xử lý (chuyển InProgress/Resolved) là phần owner-side, không thuộc phạm vi
lần này. Người thuê chỉ được hủy khi yêu cầu còn Open.
```

---

## 4. Tổng kết thay đổi cuối chức năng

### 4.1. Các chức năng đã hoàn thành

| STT | Chức năng | Trạng thái | Minh chứng | Ghi chú |
|---|---|---|---|---|
| 1 | Người thuê gửi yêu cầu bảo trì | Completed | POST /api/tenant/maintenance | Tự gắn phòng đang thuê |
| 2 | Xem danh sách yêu cầu & trạng thái | Completed | GET /api/tenant/maintenance | Trang Maintenance |
| 3 | Hủy yêu cầu khi chưa xử lý | Completed | DELETE /api/tenant/maintenance/{id} | Chỉ khi Open |

---

## 5. Cam kết cập nhật Changelog

Sinh viên cam kết rằng nội dung changelog phản ánh đúng các thay đổi thực tế đã thực hiện.

| Sinh viên xác nhận | Ngày xác nhận |
|---|---|
| Nguyễn Hồng An | 25/07/2026 |
