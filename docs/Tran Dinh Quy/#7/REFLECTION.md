# AI Learning Reflection - Đợt cập nhật #7

## Điều đã học

- Authorization không chỉ là kiểm tra tenant có sở hữu review hay không. Mỗi moderation state còn quyết định tenant được phép thực hiện transition nào.
- Một lệnh cập nhật nội dung tưởng như đơn giản có thể vô hiệu hóa toàn bộ quyết định moderation nếu service gán trạng thái đích cố định.
- `Hidden` và `Removed` có ý nghĩa khác nhau:
  - `Hidden` có thể cho tác giả cơ hội chỉnh sửa và gửi duyệt lại.
  - `Removed` là quyết định gỡ; tác giả không được tự thay đổi để khôi phục.
- Trạng thái sau chỉnh sửa phải được suy ra từ trạng thái trước, không nên luôn đặt `Visible`.
- Public query chỉ lấy `Visible` là cần thiết nhưng chưa đủ; write path cũng phải bảo vệ không cho actor không có quyền tạo ra trạng thái `Visible`.
- Audit log và revision history phục vụ hai mục tiêu khác nhau:
  - Audit log trả lời ai đã làm gì và khi nào.
  - Revision history lưu phiên bản dữ liệu trước/sau có cấu trúc.
- Side effect cần gắn với transition thật. Notification chỉ nên gửi khi `Hidden -> Pending`, không gửi lặp cho mỗi lần sửa khi review vốn đã `Pending`.
- Regression test theo bảng trạng thái hiệu quả hơn chỉ test happy path. Một test thất bại trong quá trình triển khai đã giúp phát hiện notification condition quá rộng.
- Migration nên được scaffold sau khi model compile, và không được sửa migration đã merge.

## Cách kiểm chứng kết quả AI

- Đọc trực tiếp `ReviewService.UpdateReviewAsync` trước khi sửa để xác nhận nguyên nhân gốc.
- Đối chiếu `ReviewRepository.GetByRoomIdAsync` để xác nhận review trở lại `Visible` sẽ xuất hiện trong public list và average.
- Rà `ReviewModerationService` để hiểu ý nghĩa các action `hide`, `remove`, `restore`.
- Kiểm tra `ReviewRevision`, EF configuration, quan hệ và index.
- Kiểm tra migration mới cùng `ApplicationDbContextModelSnapshot`.
- Chạy build toàn solution sau thay đổi interface/repository/domain.
- Chạy test sau khi thêm test mới; đọc failure thay vì thay đổi expectation tùy tiện.
- Điều chỉnh notification theo transition `Hidden -> Pending`, sau đó chạy lại toàn bộ 19 tests.
- Chạy `git diff --check` để kiểm tra whitespace.
- Giữ hai file kế hoạch ngoài commit code của bug fix.

## Hạn chế và bước tiếp theo

- Migration chưa được chạy trên SQL Server sạch hoặc database đang có dữ liệu review.
- Chưa có API integration test với JWT thật; test hiện tại tập trung vào application service.
- `ReviewRevision` chưa có API/UI để Administrator xem lịch sử; phạm vi này chỉ lưu dữ liệu.
- Nội dung notification và exception hiện dùng tiếng Anh trong phần code mới, cần thống nhất localization với toàn dự án ở task tiếp theo nếu nhóm yêu cầu.
- Chưa kiểm tra concurrency khi tenant gửi hai request update cùng lúc; có thể bổ sung row version cho `Review`.
- Chưa có AI moderation cho review; đây là chức năng mới dự kiến thực hiện sau khi các gap review P0 được sửa.
- Các cảnh báo dependency mức High chưa được xử lý trong nhánh này.
- GitHub Issue, commit, push và PR chưa hoàn thành tại thời điểm soạn tài liệu.

## Cải tiến cá nhân

Trước khi sửa một workflow có trạng thái, cần lập bảng gồm trạng thái nguồn, actor, hành động, trạng thái đích và side effect. Với lỗi này, bảng tối thiểu phải bao gồm:

| Trạng thái trước | Tenant sửa | Trạng thái sau | Side effect |
|---|---|---|---|
| `Visible` | Cho phép | `Visible` | Revision + audit |
| `Pending` | Cho phép | `Pending` | Revision + audit |
| `Hidden` | Cho phép | `Pending` | Revision + audit + notification |
| `Removed` | Từ chối | `Removed` | Không lưu |

Cách biểu diễn này giúp code và test thống nhất, đồng thời tránh side effect chạy theo trạng thái đích mà không xét transition thực tế.

## Cam kết

Đây là bản nháp do AI hỗ trợ soạn từ lịch sử làm việc thực tế. Tôi sẽ tự đọc lại, đối chiếu code và kết quả kiểm thử, chỉnh sửa nội dung chưa đúng và tự ký trước khi commit tài liệu.

- Người xác nhận: **[SINH VIÊN TỰ KÝ]**
- Ngày xác nhận: **[SINH VIÊN TỰ ĐIỀN]**
