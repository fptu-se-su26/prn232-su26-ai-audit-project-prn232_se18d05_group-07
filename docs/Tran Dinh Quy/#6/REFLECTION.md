# AI Learning Reflection - Đợt cập nhật #6

## Điều đã học

- Quyền review không nên dựa vào việc frontend đang hiển thị “phòng đang thuê”. Backend phải chứng minh quan hệ tenant–room bằng contract của đúng user lấy từ JWT.
- Lưu `ContractId` trên review giúp giải thích vì sao review từng hợp lệ ngay cả khi contract đổi trạng thái về sau.
- Cửa sổ review sau khi kết thúc hợp đồng là policy nghiệp vụ nên đặt trong `SystemSettings`, tránh hard-code 90 ngày ở nhiều nơi.
- Unique constraint ở database là lớp bảo vệ cần thiết ngoài kiểm tra `HasTenantReviewedRoomAsync`, đặc biệt khi hai request tạo review chạy đồng thời.
- Reply của owner và review gốc của tenant có ý nghĩa khác nhau; filtered unique index giúp chỉ áp quy tắc một review cho bản ghi gốc.
- Boolean `IsModerated` không mô tả đủ lifecycle. Enum `Visible`, `Pending`, `Hidden`, `Removed` làm public filtering và admin transition rõ ràng hơn.
- Moderation không nên hard-delete review vì cần evidence, khả năng restore và audit trail. Soft delete/trạng thái Removed giữ được lịch sử xử lý.
- Notification chỉ thông báo kết quả; `AuditLog` mới là nguồn lưu actor, before/after, reason, IP và timestamp cho hành động quản trị.
- Schema legacy cần được xem xét khi tạo migration. Để `ReviewId` nullable cho violation cũ tránh foreign key mới làm migration thất bại trên dữ liệu đã tồn tại.

## Cách kiểm chứng kết quả AI

- Đọc lại `ReviewService` để xác nhận tenant ID lấy từ controller/JWT và contract query lọc đúng tenant, room, status, thời hạn.
- Đối chiếu `ReviewConfiguration` để xác nhận unique index chỉ áp dụng review gốc chưa deleted.
- Rà public repository query để xác nhận `Hidden`, `Removed` và deleted không xuất hiện trong average/count/list.
- Rà report logic để xác nhận không tự report, không report Pending trùng và giới hạn độ dài dữ liệu.
- Rà `AdminReviewsController` để xác nhận role `Administrator` và các endpoint hide/remove/restore/dismiss.
- Rà moderation service để xác nhận notification/audit được tạo cùng thay đổi trạng thái.
- Kiểm tra migration/model snapshot và scaffold lại migration sau khi điều chỉnh compatibility với dữ liệu legacy.
- Chạy backend build, 14 test hiện hữu, TypeScript build, Vite production build và `git diff --check`.
- Kiểm tra Git log có năm commit đúng convention, `Refs #6`, không có `Co-Authored-By` và file spec không bị stage.

## Hạn chế và bước tiếp theo

- Chưa áp dụng migration lên một database sạch và database có `ReviewViolation` legacy; cần chạy migration integration trước khi merge.
- Chưa có test tự động chuyên biệt cho eligibility theo từng contract status, cửa sổ 90 ngày, duplicate review/report và moderation transition.
- Chưa kiểm thử API bằng hai tenant, hai owner và một admin trên dữ liệu thật; cần bổ sung authorization/integration test cho 403, 404, 409.
- `ReviewId` nullable là giải pháp tương thích legacy; về lâu dài nên migrate/đóng các violation cũ rồi cân nhắc chuyển thành required.
- UI report và moderation hiện dùng dialog đơn giản; nên thay bằng modal có reason code cố định, validation và trạng thái loading/error rõ hơn.
- `npm run build` mặc định cần chạy lại sau khi đóng tiến trình đang giữ `dist/assets`.
- Cảnh báo bảo mật của `Microsoft.OpenApi 2.4.1` cần task riêng để nâng cấp và kiểm tra tương thích.

## Cải tiến cá nhân

Với workflow có nhiều trạng thái, cần viết bảng actor–state–transition–side effect trước khi code. Bảng này nên chỉ rõ ai được thao tác, trạng thái nguồn/đích, validation, notification và audit tương ứng. Cách làm đó giúp service, controller, database constraint và UI cùng tuân theo một policy, đồng thời tạo test case đầy đủ hơn.

## Cam kết

Đây là bản nháp do AI hỗ trợ soạn từ lịch sử làm việc thực tế. Tôi sẽ tự đọc lại, đối chiếu code và kết quả kiểm thử, chỉnh sửa nội dung chưa đúng và tự ký trước khi commit tài liệu.

- Người xác nhận: **[SINH VIÊN TỰ KÝ]**
- Ngày xác nhận: **[SINH VIÊN TỰ ĐIỀN]**
