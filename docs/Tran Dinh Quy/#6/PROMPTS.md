# Prompt Log - Đợt cập nhật #6

## Công cụ AI

- Codex (GPT-5)

## Prompt đã sử dụng

| STT | Mục đích | Prompt thực tế/tóm tắt | Kết quả áp dụng |
|---:|---|---|---|
| 1 | Triển khai feature | “Tôi đã tạo nhánh mới `feature/de180286-verified-tenant-review-moderation`, giúp tôi hoàn thành chức năng 5. Review chỉ bởi người thuê thật và moderation review theo đúng mô tả của tài liệu.” | Đọc đặc tả và code hiện tại; triển khai schema, eligibility từ contract, report/moderation API, migration, public/tenant UI, admin UI, notification và audit. |
| 2 | Chia commit | “Giúp tôi commit theo đúng rule của dự án.” | Dùng rule repository, loại file spec khỏi staging và chia thay đổi thành năm commit có prefix `[DE180286]`, body `Refs #6`, không có `Co-Authored-By`. |
| 3 | Audit đợt 6 | “Tạo thư mục 6 chứa các file tương tự các thư mục trên trong Tran Dinh Quy mô tả rõ công việc của nhánh này.” | Soạn bốn file audit trong `docs/Tran Dinh Quy/#6/` dựa trên thay đổi, commit và kết quả kiểm chứng thực tế. |

## Ràng buộc đã áp dụng

- Chỉ tenant có contract hợp lệ của chính họ với đúng room mới được review.
- Không cho contract Draft/Pending review; hỗ trợ cửa sổ review sau khi kết thúc bằng cấu hình hệ thống.
- Một tenant chỉ có một review gốc trên mỗi room; owner reply không phá unique rule.
- Kiểm tra `ReviewBlockedUntil` trước create/update.
- Public API chỉ trả review `Visible`, không trả tenant ID/email nội bộ không cần thiết trên UI.
- Report yêu cầu đăng nhập, không cho tự report và không tạo report Pending trùng.
- Chỉ `Administrator` được truy cập moderation API.
- Admin action tạo notification và audit log; remove yêu cầu reason.
- Thời gian mới được ghi bằng UTC; migration mới được tạo thay vì sửa migration cũ.
- File đặc tả untracked không được stage/commit.

## Kiểm tra sau khi áp dụng

- `dotnet build RoomHub.slnx`: thành công; có cảnh báo dependency/nullable hiện hữu, không có build error.
- `dotnet test RoomHub.Application.Tests/RoomHub.Application.Tests.csproj --no-restore`: 14/14 test hiện hữu thành công.
- TypeScript build: thành công.
- Vite production build sang `.vite-verify`: thành công; output tạm đã được dọn.
- `npm run build` với output mặc định chưa hoàn tất vì `dist/assets` bị tiến trình khác khóa (`EPERM`).
- `git diff --check`: thành công.
- Migration đã scaffold nhưng chưa được áp dụng lên SQL Server trong phiên làm việc.
- Chưa có test tự động mới dành riêng cho review eligibility/moderation trong commit feature này.

