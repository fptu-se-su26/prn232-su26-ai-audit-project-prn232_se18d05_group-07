# AI Audit Log - Đợt cập nhật #5

## Phạm vi AI hỗ trợ

| Hạng mục | AI hỗ trợ | Kiểm chứng đã thực hiện |
|---|---|---|
| Phân tích đặc tả | Đọc mục “#4. Admin dashboard thật”, rà dashboard admin đang hard-code, các entity `ApplicationUser`, `Building`, `Room`, `Subscription`, `MaintenanceTicket`, `AuditLog` và conventions API hiện tại. | Đối chiếu KPI, công thức, date range, authorization, hiệu năng và UI với acceptance criteria. |
| API analytics | Tạo DTO, interface, service và năm endpoint summary, user growth, listing statuses, subscription revenue và recent activities. | Backend build thành công; controller được giới hạn bằng role `Administrator`. |
| Aggregate database | Dùng `AsNoTracking`, `CountAsync`, `SumAsync`, `GroupBy` và projection; chỉ lấy các nhóm dữ liệu cần thiết thay vì tải toàn bảng. | Rà truy vấn để xác nhận occupancy, revenue, listing status và user growth được tính ở database hoặc từ tập aggregate nhỏ. |
| Khoảng thời gian | Chuẩn hóa filter thành UTC, dùng khoảng nửa mở `[from, to)`, hỗ trợ day/week/month và lấp kỳ không có dữ liệu bằng giá trị 0. | Unit test xác nhận chuyển offset sang UTC, từ chối khoảng ngày sai/quá dài và dữ liệu rỗng trả số 0. |
| Hiệu năng | Thêm index cho `AuditLogs.CreatedAt`, listing theo trạng thái/ngày tạo và subscription theo trạng thái/ngày tạo. | Tạo migration mới `AddAdminDashboardIndexes` và cập nhật model snapshot, không sửa migration cũ. |
| Frontend | Thay KPI, biểu đồ và activity hard-code bằng API thật; thêm preset 7/30/90 ngày, custom range, loading, empty, error/retry và CTA điều hướng. | Frontend production build và ESLint riêng hai file dashboard thành công. |
| Git và tài liệu | Chia triển khai thành bốn commit đúng convention và soạn bộ tài liệu audit đợt 5. | Kiểm tra Git log; nhánh ahead 4 trước khi tạo tài liệu và file đặc tả đầu vào không nằm trong commit feature. |

## Quyết định và điều chỉnh

- Giữ nguyên owner dashboard và tạo `IAdminDashboardService`/`AdminDashboardController` riêng để không thay đổi contract đang dùng cho chủ trọ.
- Occupancy rate được tính bằng room `Occupied` chia tổng room chưa bị xóa; mẫu số bằng 0 trả `0`.
- New users và các dữ liệu theo kỳ dùng điều kiện `CreatedAt >= from && CreatedAt < to` sau khi đổi input sang UTC.
- Revenue chỉ cộng subscription `Active`; subscription `Pending`, `Expired` và `Rejected` không được tính.
- Listing status chỉ tính room chưa xóa, có listing và được tạo trong khoảng đã chọn.
- Recent activities lấy trực tiếp từ `AuditLogs`, sắp xếp theo `CreatedAt` và `Id`; frontend không tạo activity giả.
- Chuỗi thời gian được lấp đủ period, nhờ đó database rỗng hoặc kỳ không phát sinh dữ liệu vẫn trả danh sách hợp lệ với giá trị 0.
- Giới hạn date range tối đa 730 ngày và `recent-activities` tối đa 50 bản ghi để bảo vệ truy vấn dashboard.
- File đặc tả `docs/FEATURE_IMPLEMENTATION_SPEC_DE180286.md` là đầu vào chưa tracked và không được đưa vào commit feature.

## Kết quả

Dashboard admin đã dùng dữ liệu database cho KPI, user growth, listing status, subscription revenue và recent audit activity. Admin có thể đổi khoảng 7/30/90 ngày hoặc chọn custom range; các widget có trạng thái loading, empty, error/retry và điều hướng đến màn hình quản trị tương ứng. Bốn commit feature đã được tạo theo convention của dự án.
