# Prompt Log - Đợt cập nhật #8

## Công cụ AI

- Codex (GPT-5)

## Prompt đã sử dụng

| STT | Mục đích | Prompt thực tế/tóm tắt | Kết quả áp dụng |
|---:|---|---|---|
| 1 | Tiếp tục backlog | “Tiếp tục tạo nhánh và xử lí chức năng thứ 2, lưu ý tôi đã merge source code hồi nãy vào main.” | Đồng bộ main sau PR #54 và tạo `bugfix/de180286-review-moderation-integration`. |
| 2 | Bối cảnh kế hoạch | Người dùng chỉ định `docs/DE180286_IMPLEMENTATION_SCOPE.md`. | Thực hiện đúng FIX-02: route, DTO null-safe, reason validation và thay prompt bằng modal. |

## Ràng buộc đã áp dụng

- Bắt đầu từ main đã merge FIX-01.
- Giữ hai file kế hoạch untracked ngoài commit feature.
- Không sửa migration cũ và không tạo migration khi schema không đổi.
- Backend là nguồn chuẩn của report reason catalog.
- Chỉ chấp nhận reason code trong catalog.
- `Other` yêu cầu mô tả.
- Không dereference navigation legacy khi có thể null.
- Không dùng browser `prompt` cho report/moderation.
- UI phải có loading, error và validation state.
- Test toàn backend và build frontend trước khi commit.

## Kiểm tra sau khi áp dụng

- Backend Release tests: 29/29 thành công.
- Frontend production build: thành công.
- TypeScript compile: thành công.
- Full ESLint còn technical debt có sẵn; targeted review page không còn lỗi mới.
- package-lock không bị sửa.
- Chưa commit/push tại thời điểm soạn tài liệu.
