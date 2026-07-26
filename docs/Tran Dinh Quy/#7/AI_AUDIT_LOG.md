# AI Audit Log - Đợt cập nhật #7

## Thông tin

| Mục | Nội dung |
|---|---|
| Sinh viên | Trần Đình Quý |
| MSSV | DE180286 |
| Nhánh | `bugfix/de180286-review-moderation-bypass` |
| Công cụ AI | Codex (GPT-5) |
| Ngày thực hiện | 26/07/2026 |

## Phạm vi AI hỗ trợ

| Hạng mục | AI hỗ trợ | Kiểm chứng đã thực hiện |
|---|---|---|
| Audit chức năng | Đọc sáu đợt tài liệu của Trần Đình Quý và đối chiếu `ReviewService`, repository, entity, configuration, migration và tests để xác định moderation bypass. | Xác nhận `UpdateReviewAsync` luôn đặt `ModerationStatus = Visible` và xóa `ModerationReason`. |
| Phân tích lỗi | Phân tích đường tái hiện: admin ẩn/gỡ review, tenant chỉnh sửa, service đưa review trở lại public. | Đối chiếu public repository chỉ lấy `Visible`, do đó việc tự chuyển về `Visible` thực sự làm review xuất hiện lại. |
| Thiết kế state transition | Đề xuất chặn sửa `Removed`; chuyển `Hidden` đã sửa sang `Pending`; giữ nguyên `Visible`/`Pending`. | Viết test cho bốn trạng thái và ownership; 19/19 test toàn solution thành công. |
| Lịch sử chỉnh sửa | Hỗ trợ thiết kế `ReviewRevision` lưu before/after rating, comment, moderation status, actor và UTC timestamp. | Kiểm tra entity, EF configuration, quan hệ, index, migration và model snapshot. |
| Side effect | Hỗ trợ thêm audit log cho mọi lần chỉnh sửa và notification khi review ẩn được sửa, chuyển sang chờ duyệt. | Test xác nhận revision/audit/notification được tạo đúng theo transition. |
| Migration | Hỗ trợ scaffold migration `AddReviewRevisionHistory` sau khi backend compile thành công. | Migration được tạo bằng EF CLI với `--no-build`; chưa áp dụng lên database thật. |
| Automated test | Hỗ trợ tạo fake repository/unit of work và test regression cho moderation bypass. | Lần chạy đầu phát hiện expectation notification của trạng thái `Pending` chưa đúng; code được điều chỉnh và chạy lại đạt 19/19. |
| Git và tài liệu | Hỗ trợ tạo nhánh đúng convention và soạn bốn file audit đợt #7 theo dữ liệu thực tế. | Xác nhận nhánh hiện tại đúng tên; `git diff --check` thành công; chưa tạo commit khi chưa có Issue xác nhận. |

## Quyết định và điều chỉnh

- Không cho tenant chỉnh sửa review `Removed` vì đây là quyết định gỡ nội dung của Administrator.
- Review `Hidden` được phép chỉnh sửa để khắc phục vi phạm, nhưng phải chuyển sang `Pending` và chờ Administrator duyệt lại.
- Review `Visible` khi chỉnh sửa vẫn giữ `Visible`; thay đổi này không mở rộng phạm vi sang tự động kiểm duyệt nội dung.
- Review đã `Pending` tiếp tục giữ `Pending`; không gửi notification lặp chỉ vì tenant chỉnh sửa thêm khi vẫn đang chờ.
- Revision được lưu trong bảng riêng thay vì chỉ ghi JSON audit, giúp truy vấn lịch sử phiên bản có cấu trúc.
- `AuditLog` vẫn được tạo để lưu dấu vết hành động trong hệ thống audit chung.
- Notification chỉ được tạo khi có transition thật từ `Hidden` sang `Pending`.
- Public query hiện có đã lọc `Visible`, vì vậy không cần thay đổi public API trong bug fix này.
- Dùng migration mới và cập nhật snapshot; không sửa migration `AddVerifiedTenantReviewModeration` đã tồn tại.

## Lỗi gặp phải và cách xử lý

1. Lệnh tạo nhánh ban đầu không ghi được `.git/refs` do giới hạn sandbox.
   - Đã yêu cầu quyền tạo nhánh và chạy lại thành công.
2. Máy không có GitHub CLI `gh`.
   - Không tự tạo Issue/PR; sinh viên tự tạo Issue và cung cấp số để hoàn thiện commit/PR.
3. `dotnet ef migrations add` lần đầu báo build failed nhưng output chỉ hiển thị cảnh báo dependency.
   - Backend đã được build riêng thành công; chạy lại EF CLI với `--no-build` và scaffold migration thành công.
4. Lần chạy test đầu có 1 test thất bại vì notification được tạo cả khi review vốn đã `Pending`.
   - Điều chỉnh điều kiện side effect chỉ áp dụng khi trạng thái trước là `Hidden`; chạy lại đạt 19/19.

## Kết quả

Moderation bypass đã được chặn trong code và có regression tests. Review bị gỡ không thể được tenant tự khôi phục; review bị ẩn sau khi sửa phải qua trạng thái chờ duyệt. Mọi lần sửa hợp lệ có revision history và audit log; transition cần duyệt lại có notification. Bộ tài liệu này là bản nháp do AI hỗ trợ, sinh viên phải tự đọc, đối chiếu và ký xác nhận trước khi commit.
