# Changelog

## 1. Quy định ghi Changelog

File này ghi lại các thay đổi quan trọng khi thực hiện chức năng **Lịch sử tìm kiếm** cho người thuê của sinh viên Nguyễn Hồng An.

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
| Ngày bắt đầu | 12/07/2026 |
| Ngày hoàn thành | 12/07/2026 |

---

## 3. Tổng quan các phiên bản/giai đoạn

| Phiên bản/Giai đoạn | Thời gian | Nội dung chính | Trạng thái |
|---|---|---|---|
| Phase 04 | 12/07/2026 | Implementation: Lịch sử tìm kiếm (FE + BE) | Completed |
| Phase 05 | 12/07/2026 | Chạy thử API thật + typecheck | Completed |

---

# [Phase 04] Chức năng Lịch sử tìm kiếm cho người thuê

## Ngày thực hiện

```text
12/07/2026
```

## Đã hoàn thành

- [x] Tạo nhánh riêng `feature/de180358-tenant-search-history` từ `main`
- [x] DTO: `LogSearchRequest`, `SearchHistoryDto`
- [x] Repository: `ISearchHistoryRepository` + `SearchHistoryRepository`
- [x] Service: `ISearchHistoryService` + `SearchHistoryService`
- [x] Controller: `SearchHistoryController` với 4 endpoint
- [x] Đăng ký DI repository & service
- [x] Frontend: trang `SearchHistory.tsx` (xem lại, tìm lại, xóa từng mục, xóa tất cả, hiển thị bộ lọc dạng chip)
- [x] Gắn route `tenant-search-history` + menu "Lịch sử tìm kiếm" trong `App.tsx`, `TenantLayout.tsx`
- [x] Hook tự động ghi log vào `handleSearchSubmit` của `Browse.tsx` (chỉ khi đã đăng nhập)
- [x] Không cần migration (bảng `SearchHistories` đã có sẵn)
- [x] Chạy thử API thật (login/log/get/delete) đạt; build backend + typecheck frontend đạt

## Thay đổi chi tiết

| STT | Nội dung thay đổi | Người thực hiện | File/Module liên quan | Minh chứng |
|---:|---|---|---|---|
| 1 | Tạo DTO cho lịch sử tìm kiếm | Nguyễn Hồng An | `DTOs/SearchHistory/SearchHistoryDtos.cs` | Commit Git |
| 2 | Interface + repository | Nguyễn Hồng An | `ISearchHistoryRepository.cs`, `SearchHistoryRepository.cs` | Commit Git |
| 3 | Interface + service | Nguyễn Hồng An | `ISearchHistoryService.cs`, `SearchHistoryService.cs` | Commit Git |
| 4 | Controller 4 endpoint | Nguyễn Hồng An | `API/Controllers/SearchHistoryController.cs` | Commit Git |
| 5 | Đăng ký DI | Nguyễn Hồng An | `Infrastructure/DependencyInjection.cs` | Commit Git |
| 6 | Trang lịch sử tìm kiếm | Nguyễn Hồng An | `Frontend/src/pages/tenant/SearchHistory.tsx` | Commit Git |
| 7 | Điều hướng + menu | Nguyễn Hồng An | `App.tsx`, `components/tenant/TenantLayout.tsx` | Commit Git |
| 8 | Tự động ghi log ở trang tìm phòng | Nguyễn Hồng An | `Frontend/src/pages/Browse.tsx` | Commit Git |

## API endpoints

| Method | Route | Quyền | Mô tả |
|---|---|---|---|
| POST | `/api/tenant/search-history` | Tenant | Ghi lại một lượt tìm kiếm |
| GET | `/api/tenant/search-history` | Tenant | Lịch sử tìm kiếm của tôi |
| DELETE | `/api/tenant/search-history/{id}` | Tenant | Xóa 1 mục lịch sử |
| DELETE | `/api/tenant/search-history` | Tenant | Xóa toàn bộ lịch sử |

## AI có hỗ trợ không?

- [x] Có
- [ ] Không

Nếu có, mô tả AI đã hỗ trợ phần nào:

```text
Claude Code sinh mã backend và frontend theo mẫu chức năng Đánh giá, hook ghi log vào Browse, và chạy thử API thật
bằng curl trước khi push. Sinh viên định hướng, quyết định (chỉ ghi khi đăng nhập, chống spam) và kiểm chứng.
```

## Commit/Screenshot minh chứng

```text
Nhánh: feature/de180358-tenant-search-history
Kiểm thử: chạy API bản build tạm trên cổng 5299, test login/log/get/delete đều đúng.
```

## Ghi chú

```text
SearchQuery được lưu dạng JSON (từ khóa + bộ lọc) để hiển thị lại thành các chip dễ đọc trên trang lịch sử.
```

---

## 4. Tổng kết thay đổi cuối chức năng

### 4.1. Các chức năng đã hoàn thành

| STT | Chức năng | Trạng thái | Minh chứng | Ghi chú |
|---|---|---|---|---|
| 1 | Tự động ghi lượt tìm kiếm khi người thuê tìm phòng | Completed | POST /api/tenant/search-history | Hook ở Browse |
| 2 | Xem lại, tìm lại, xóa từng mục | Completed | GET/DELETE /api/tenant/search-history | Trang SearchHistory |
| 3 | Xóa toàn bộ lịch sử | Completed | DELETE /api/tenant/search-history | Có xác nhận |

---

## 5. Cam kết cập nhật Changelog

Sinh viên cam kết rằng nội dung changelog phản ánh đúng các thay đổi thực tế đã thực hiện.

| Sinh viên xác nhận | Ngày xác nhận |
|---|---|
| Nguyễn Hồng An | 12/07/2026 |
