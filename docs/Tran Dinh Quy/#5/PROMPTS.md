# Prompt Log - Đợt cập nhật #5

## Công cụ AI

- Codex (GPT-5)

## Prompt đã sử dụng

| STT | Mục đích | Prompt thực tế/tóm tắt | Kết quả áp dụng |
|---:|---|---|---|
| 1 | Triển khai feature | “Tôi đã tạo nhánh mới `feature/de180286-admin-analytics-dashboard`, hãy giúp hoàn thành chức năng **#4. Admin dashboard thật theo đúng nội dung mô tả**.” | Đọc đặc tả và code hiện tại; triển khai DTO, analytics service, năm API, UTC date range, aggregate query, indexes/migration, dashboard UI và tests. |
| 2 | Chia commit | “Giúp tôi chia commit và commit theo đúng rule của dự án.” | Chia thay đổi thành bốn commit backend API, frontend, performance/migration và tests theo convention `[DE180286] type: description`; giữ file spec ngoài commit. |
| 3 | Audit đợt 5 | “Giúp tôi tạo thư mục 5 trong Tran Dinh Quy về nội dung làm việc của nhánh này tương tự những thư mục trước đó.” | Tạo bốn tài liệu audit trong `docs/Tran Dinh Quy/#5/` dựa trên thay đổi, commit và kết quả kiểm chứng thực tế. |

## Ràng buộc đã áp dụng

- Chỉ role `Administrator` truy cập dashboard API; dashboard chỉ đọc dữ liệu.
- KPI, biểu đồ và activity phải lấy từ database, không còn dữ liệu hard-code/mock.
- Occupancy rate chỉ dùng room chưa xóa; mẫu số bằng 0 trả 0.
- New users và dữ liệu trong kỳ áp dụng `[from, to)` sau khi chuyển timezone sang UTC.
- Revenue chỉ tính subscription `Active`, không tính Pending/Rejected/Expired.
- Recent activities lấy từ `AuditLogs`.
- Read query dùng `AsNoTracking`, projection và aggregate tại database.
- Date range hỗ trợ 7/30/90 ngày hoặc custom; user growth hỗ trợ day/week/month.
- Không sửa migration cũ; tạo migration mới cho index cần thiết.
- Không đưa file đặc tả đầu vào chưa tracked vào commit.

## Kiểm tra sau khi áp dụng

- `dotnet build RoomHub.Backend/RoomHub.slnx`: thành công.
- `dotnet test RoomHub.Backend/RoomHub.Application.Tests/RoomHub.Application.Tests.csproj --no-restore`: 14/14 test thành công.
- `npm run build`: thành công.
- ESLint riêng hai file dashboard mới: thành công.
- `git diff --check`: thành công.
- Kiểm tra bốn commit đúng convention và đúng nhóm thay đổi.
- Full-repo ESLint không đạt do technical debt có sẵn ở các file ngoài phạm vi; không sửa lan sang feature khác.
