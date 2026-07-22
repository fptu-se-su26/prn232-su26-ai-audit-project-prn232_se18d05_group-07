# Changelog - Đợt cập nhật #5

## Thông tin

| Mục | Nội dung |
|---|---|
| Project | RoomHub - Quản lý phòng/nhà trọ |
| Môn học | PRN232 |
| Sinh viên | Trần Đình Quý |
| MSSV | DE180286 |
| Nhánh | `feature/de180286-admin-analytics-dashboard` |
| Ngày thực hiện | 22/07/2026 |

## Hoàn thành

- Tạo DTO và `IAdminDashboardService` cho dữ liệu tổng quan, trạng thái listing, trend user, doanh thu và activity.
- Thêm API chỉ dành cho `Administrator`:
  - `GET /api/admin/dashboard/summary?from=&to=`.
  - `GET /api/admin/dashboard/user-growth?from=&to=&granularity=day|week|month`.
  - `GET /api/admin/dashboard/listing-statuses?from=&to=`.
  - `GET /api/admin/dashboard/subscription-revenue?from=&to=&granularity=month`.
  - `GET /api/admin/dashboard/recent-activities?limit=10`.
- Tổng hợp KPI từ database: tổng/mới user, user theo role, building, room, occupied room, occupancy rate, listing status, subscription status/revenue và maintenance ticket đang mở.
- Chuẩn hóa thời gian client sang UTC và áp dụng khoảng `[from, to)`; kiểm tra thứ tự và giới hạn tối đa 730 ngày.
- Hỗ trợ user growth theo ngày/tuần/tháng và subscription revenue theo tháng; period không có dữ liệu trả 0.
- Dùng `AsNoTracking`, aggregate và projection database để tránh tải toàn bảng vào memory.
- Lấy recent activities từ `AuditLogs`, không dùng activity giả ở frontend.
- Thêm index database cho audit time, listing status/date và subscription status/date.
- Tạo migration mới `20260722160812_AddAdminDashboardIndexes`; không sửa migration cũ.
- Thay toàn bộ KPI, biểu đồ và activity hard-code trong admin dashboard bằng API thật.
- Thêm preset 7/30/90 ngày, custom date range, tooltip, loading skeleton, empty state, error/retry và KPI navigation.
- Thêm test cho role authorization, UTC conversion, invalid range và empty data defaults.

## Commit feature

1. `2c6854a [DE180286] feat: add admin dashboard analytics APIs`
2. `173618c [DE180286] feat: connect admin dashboard KPIs and charts`
3. `ea07795 [DE180286] perf: optimize admin dashboard aggregate queries`
4. `dde9a64 [DE180286] test: cover dashboard filters and empty datasets`

## Kiểm chứng

- Backend build toàn solution: thành công, 0 lỗi.
- Backend tests: 14/14 thành công.
- Frontend production build: thành công.
- ESLint riêng `src/pages/admin/Dashboard.tsx` và `src/services/adminDashboard.ts`: thành công.
- `git diff --check`: thành công.
- Full-repo ESLint còn 203 vấn đề (185 errors, 18 warnings) có sẵn ở nhiều file ngoài phạm vi.
- Còn cảnh báo có sẵn về `Microsoft.OpenApi 2.4.1`, nullable trong `RoomRepository` và kích thước bundle frontend.
- Chưa chạy migration lên database thật trong phiên triển khai.
