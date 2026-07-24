# AI Audit Log - Đợt cập nhật #6

## Phạm vi AI hỗ trợ

| Hạng mục | AI hỗ trợ | Kiểm chứng đã thực hiện |
|---|---|---|
| Phân tích đặc tả | Đọc mục “#5. Review chỉ bởi người thuê thật và moderation review”, rà entity `Review`, `ReviewViolation`, `Contract`, `SystemSetting`, notification, audit và luồng UI hiện tại. | Đối chiếu eligibility, authorization, moderation state, report, notification/audit và acceptance criteria với code hiện có. |
| Eligibility review | Bổ sung kiểm tra hợp đồng của đúng tenant và room, các trạng thái hợp lệ, cửa sổ 90 ngày có cấu hình, `ReviewBlockedUntil` và quy tắc một review gốc cho mỗi tenant/phòng. | Backend build thành công; unique filtered index được tạo trong migration mới; public query chỉ lấy review `Visible`. |
| Schema và migration | Mở rộng `Review`, `ReviewViolation`, thêm enum moderation/report, quan hệ contract evidence, report relationship và `ReviewEligibilityDaysAfterContract`. | Migration `AddVerifiedTenantReviewModeration` được scaffold lại sau khi đổi `ReviewId` thành nullable để không phá dữ liệu violation cũ; không sửa migration cũ. |
| Report và moderation API | Thêm eligibility API, report API, hàng đợi report admin, xem evidence, hide/remove/restore và dismiss. | Controller tenant lấy user từ JWT; controller admin giới hạn role `Administrator`; backend build thành công. |
| Notification và audit | Tạo notification cho tác giả review/reporter và `AuditLog` chứa actor, action, entity, before/after, reason và IP khi admin xử lý. | Rà service moderation và xác nhận các thao tác admin gọi `SaveChangesAsync` cùng notification/audit. |
| Frontend public/tenant | Hiển thị rating trung bình, số lượng, danh sách review Visible và nút report ở chi tiết phòng; hiển thị trạng thái/lý do moderation trong My Reviews. | TypeScript build và Vite production build bằng output tạm thành công. |
| Frontend admin | Tạo trang hàng đợi report, xem review và evidence contract, thao tác hide/remove/restore/dismiss; thêm route/menu admin. | TypeScript build và Vite production build bằng output tạm thành công. |
| Git và tài liệu | Chia thay đổi thành năm commit đúng convention `[DE180286]`, thêm `Refs #6` và soạn bộ audit đợt 6. | Kiểm tra Git log, không có `Co-Authored-By`; file đặc tả đầu vào vẫn untracked và không nằm trong năm commit feature. |

## Quyết định và điều chỉnh

- Eligibility dựa trên contract thuộc đúng JWT tenant và đúng room; chấp nhận `Active`, `Renewed`, `Terminated`, `Liquidated`, `Expired` theo model hiện tại.
- Contract đang `Active`/`Renewed` được review; contract đã kết thúc chỉ hợp lệ khi `EndDate` nằm trong cửa sổ cấu hình, mặc định 90 ngày.
- Không tin `tenantId` từ frontend; controller lấy `ClaimTypes.NameIdentifier` từ JWT.
- Review gốc dùng unique filtered index `(TenantId, RoomId)` khi `ParentReviewId IS NULL AND IsDeleted = 0`; reply không bị áp quy tắc này.
- Review tenant xóa được chuyển sang soft delete; review `Hidden`, `Removed` hoặc deleted không xuất hiện trong public summary/list.
- `ReviewViolation.ReviewId` để nullable nhằm giữ tương thích với violation legacy chưa liên kết review; report mới luôn gắn review hợp lệ ở service.
- Một reporter không được tạo nhiều report `Pending` cho cùng review và không được report review của chính mình.
- `remove` bắt buộc có lý do; hành động đạt đúng trạng thái đích được xử lý idempotent, transition report đã xử lý trả conflict khi không hợp lệ.
- File `docs/FEATURE_IMPLEMENTATION_SPEC_DE180286.md` là đầu vào chưa tracked và không được đưa vào commit feature/audit.

## Kết quả

Nhánh đã có eligibility dựa trên bằng chứng hợp đồng, moderation state rõ ràng, report workflow, API admin, notification/audit trail và UI public/tenant/admin. Năm commit feature đã được tạo đúng convention và tham chiếu `Refs #6`. Bộ tài liệu này là bản nháp do AI soạn; sinh viên cần đọc lại, xác minh và tự chịu trách nhiệm trước khi commit/push.

