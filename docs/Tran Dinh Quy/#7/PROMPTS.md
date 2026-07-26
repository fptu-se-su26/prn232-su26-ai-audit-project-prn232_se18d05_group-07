# Prompt Log - Đợt cập nhật #7

## Công cụ AI

- Codex (GPT-5)

## Prompt đã sử dụng

| STT | Mục đích | Prompt thực tế/tóm tắt | Kết quả áp dụng |
|---:|---|---|---|
| 1 | Audit toàn dự án | “Kiểm tra xem dự án chức năng nào còn lỗi chưa hoàn thiện, tạo file md list đầy đủ; kiểm tra chức năng AI đã có và đề xuất AI bổ sung; ghi branch và commit đúng chuẩn.” | Audit backend/frontend/tests/configuration; tạo báo cáo gap và AI backlog. |
| 2 | Thu hẹp phạm vi DE180286 | “Tập trung vào các chức năng liên quan đến Tran Dinh Quy bị gap và chọn thêm 4 chức năng mới, ít nhất một tính năng AI.” | Đọc audit #1–#6, xác định các gap thuộc chat, viewing/deposit, favorites, admin và review; lập implementation scope. |
| 3 | Bắt đầu triển khai | “Bắt đầu tạo nhánh và thực hiện theo đúng thứ tự.” | Tạo nhánh `bugfix/de180286-review-moderation-bypass`; audit chi tiết review update; triển khai state transition, revision, audit, notification, migration và tests. |
| 4 | Soạn Issue | Người dùng cung cấp template Bug Report và yêu cầu hoàn thành nội dung Issue. | Soạn tiêu đề, bug description, steps, expected/actual result, evidence, AI usage và fix summary dựa trên kết quả thật. |
| 5 | Soạn audit #7 | “Tạo cho tôi thư mục 7 trong Tran Dinh Quy về nội dung của nhánh này đã thực hiện theo đúng format những thư mục trước đó.” | Tạo bốn file `AI_AUDIT_LOG.md`, `PROMPTS.md`, `CHANGELOG.md`, `REFLECTION.md` trong `docs/Tran Dinh Quy/#7/`. |

## Ràng buộc đã áp dụng

- Chỉ xử lý moderation bypass trong nhánh hiện tại.
- Không tự gán số Issue chưa được người dùng xác nhận khi tạo commit.
- Nhánh phải theo convention `bugfix/de180286-review-moderation-bypass`.
- Commit sau này phải theo `[DE180286] <type>: <description>` và có `Refs #7`.
- Không thêm `Co-Authored-By`.
- Không sửa migration cũ.
- Review `Removed` không được tenant chỉnh sửa.
- Review `Hidden` sau khi sửa không được public ngay mà chuyển sang `Pending`.
- Public API tiếp tục chỉ lấy review `Visible`.
- Revision/audit/notification phải được lưu cùng lần `SaveChangesAsync`.
- Tài liệu chỉ ghi hành động và kết quả đã thực sự xảy ra.

## Kiểm tra sau khi áp dụng

- Backend build: thành công.
- Backend tests: 19/19 thành công.
- Regression tests mới bao phủ bốn moderation status và ownership.
- Migration `AddReviewRevisionHistory` đã scaffold thành công.
- `git diff --check`: thành công.
- Chưa áp dụng migration lên SQL Server.
- Chưa chạy frontend build vì không có thay đổi frontend và môi trường hiện không có `node_modules`.
- Chưa commit/push/tạo PR tại thời điểm soạn vì Issue do sinh viên tự tạo.
