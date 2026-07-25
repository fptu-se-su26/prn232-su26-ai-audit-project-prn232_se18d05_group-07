# Changelog

## 1. Quy định ghi Changelog

File này ghi lại các thay đổi khi thực hiện chức năng **Lịch sử xem phòng** cho người thuê của sinh viên Nguyễn Hồng An.

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
| Phase 03 | 25/07/2026 | Thêm TenantId + migration cho BookingHistory | Completed |
| Phase 04 | 25/07/2026 | Implementation: Lịch sử xem phòng (FE + BE) | Completed |
| Phase 05 | 25/07/2026 | Chạy thử API thật + typecheck | Completed |

---

# [Phase 04] Chức năng Lịch sử xem phòng cho người thuê

## Ngày thực hiện

```text
25/07/2026
```

## Đã hoàn thành

- [x] Tạo nhánh riêng `feature/de180358-tenant-booking-history` từ `main` mới nhất
- [x] Thêm `TenantId` (+ navigation) vào entity `BookingHistory`, cập nhật `BookingHistoryConfiguration` (FK + index)
- [x] Migration `AddTenantIdToBookingHistory` (thêm cột + index + khóa ngoại), đã apply vào DB
- [x] DTO: `LogRoomViewRequest`, `BookingHistoryDto`
- [x] Repository: `IBookingHistoryRepository` + `BookingHistoryRepository`
- [x] Service: `IBookingHistoryService` + `BookingHistoryService` (chống trùng: cùng phòng thì cập nhật thời điểm; lưu giá tại thời điểm xem)
- [x] Controller: `BookingHistoryController` với 4 endpoint
- [x] Đăng ký DI repository & service
- [x] Frontend: trang `BookingHistory.tsx` (xem lại, xóa từng mục, xóa tất cả) + route + menu "Lịch sử xem phòng"
- [x] Auto-log ở `RoomDetail.tsx` khi người thuê đã đăng nhập mở chi tiết phòng (bỏ qua phòng mock, nuốt lỗi)
- [x] Build backend 0 lỗi; test API thật (login/log/dedupe/get/clear) đạt

## Thay đổi chi tiết

| STT | Nội dung thay đổi | Người thực hiện | File/Module liên quan | Minh chứng |
|---:|---|---|---|---|
| 1 | Thêm TenantId + navigation | Nguyễn Hồng An | `Domain/Entities/BookingHistory.cs` | Commit Git |
| 2 | Cấu hình EF FK + index | Nguyễn Hồng An | `Persistence/Configurations/BookingHistoryConfiguration.cs` | Commit Git |
| 3 | Migration thêm cột TenantId | Nguyễn Hồng An | `Migrations/*_AddTenantIdToBookingHistory.cs` | Commit Git |
| 4 | DTO | Nguyễn Hồng An | `DTOs/BookingHistory/BookingHistoryDtos.cs` | Commit Git |
| 5 | Repository | Nguyễn Hồng An | `IBookingHistoryRepository.cs`, `BookingHistoryRepository.cs` | Commit Git |
| 6 | Service | Nguyễn Hồng An | `IBookingHistoryService.cs`, `BookingHistoryService.cs` | Commit Git |
| 7 | Controller 4 endpoint | Nguyễn Hồng An | `API/Controllers/BookingHistoryController.cs` | Commit Git |
| 8 | Đăng ký DI | Nguyễn Hồng An | `Infrastructure/DependencyInjection.cs` | Commit Git |
| 9 | Trang lịch sử xem phòng + điều hướng | Nguyễn Hồng An | `Frontend/src/pages/tenant/BookingHistory.tsx`, `App.tsx`, `TenantLayout.tsx` | Commit Git |
| 10 | Auto-log khi xem chi tiết phòng | Nguyễn Hồng An | `Frontend/src/pages/RoomDetail.tsx` | Commit Git |

## API endpoints

| Method | Route | Quyền | Mô tả |
|---|---|---|---|
| POST | `/api/tenant/booking-history` | Tenant | Ghi lại việc xem một phòng (chống trùng) |
| GET | `/api/tenant/booking-history` | Tenant | Lịch sử xem phòng của tôi |
| DELETE | `/api/tenant/booking-history/{id}` | Tenant | Xóa 1 mục |
| DELETE | `/api/tenant/booking-history` | Tenant | Xóa toàn bộ |

## AI có hỗ trợ không?

- [x] Có
- [ ] Không

Nếu có, mô tả AI đã hỗ trợ phần nào:

```text
Claude Code sinh mã backend/frontend và migration theo mẫu chức năng lịch sử trước đó, hook auto-log ở trang chi tiết
phòng, và chạy thử API thật. Sinh viên định hướng (tránh trùng phần đã có), quyết định chống trùng và kiểm chứng.
```

## Commit/Screenshot minh chứng

```text
Nhánh: feature/de180358-tenant-booking-history
Kiểm thử: chạy API bản build tạm trên cổng 5299; POST cùng phòng 2 lần chỉ giữ 1 dòng (dedupe), GET và DELETE đúng.
```

## Ghi chú

```text
"Đặt lịch xem phòng" (RoomViewingBooking) đã được thành viên khác làm; chức năng này bổ sung phần "lịch sử xem phòng"
(ghi lại phòng đã xem) nên không trùng lặp.
```

---

## 4. Tổng kết thay đổi cuối chức năng

### 4.1. Các chức năng đã hoàn thành

| STT | Chức năng | Trạng thái | Minh chứng | Ghi chú |
|---|---|---|---|---|
| 1 | Tự động ghi phòng đã xem cho người thuê | Completed | POST /api/tenant/booking-history | Hook ở RoomDetail |
| 2 | Xem lại, xóa từng mục | Completed | GET/DELETE /api/tenant/booking-history | Trang BookingHistory |
| 3 | Xóa toàn bộ lịch sử | Completed | DELETE /api/tenant/booking-history | Có xác nhận |

---

## 5. Cam kết cập nhật Changelog

Sinh viên cam kết rằng nội dung changelog phản ánh đúng các thay đổi thực tế đã thực hiện.

| Sinh viên xác nhận | Ngày xác nhận |
|---|---|
| Nguyễn Hồng An | 25/07/2026 |
