# Prompt Log - Đợt cập nhật #4

## Công cụ AI

- Codex (GPT-5)

## Prompt đã sử dụng

| STT | Mục đích | Prompt thực tế/tóm tắt | Kết quả áp dụng |
|---:|---|---|---|
| 1 | Triển khai feature | “Tôi đã tạo nhánh `feature/de180286-admin-user-management`, hãy hoàn thành chức năng **#3. Admin quản lý user và commit theo đúng commit plan**.” | Đọc đặc tả và code hiện tại; triển khai schema, migration, query service, ban/unban, JWT validation, API, UI, notification, audit và tests. |
| 2 | Audit đợt 4 | “Giúp tôi tạo thư mục 4 trong Tran Dinh Quý để mô tả chức năng thực hiện của nhánh này. Và giúp tôi commit.” | Tạo bốn tài liệu audit trong `docs/Tran Dinh Quy/#4/` dựa trên thay đổi, commit và kết quả kiểm chứng thực tế của nhánh. |

## Ràng buộc đã áp dụng

- Chỉ role Administrator truy cập API quản trị user.
- Actor admin lấy từ JWT; không tin `adminId` do frontend gửi.
- Không cho admin tự ban hoặc ban admin hoạt động cuối cùng.
- Reason được trim và phải dài 10–500 ký tự; thời hạn ban phải ở tương lai.
- Không hard delete user và không sửa migration cũ; tạo migration mới.
- Không trả password hash, refresh token, OTP hoặc security stamp trong DTO.
- Mọi ban/unban phải có notification và audit gồm before/after/reason/IP/timestamp.
- Search, filter, sort và pagination được thực hiện server-side.
- Không đưa file đặc tả đầu vào chưa tracked vào commit.

## Kiểm tra sau khi áp dụng

- `dotnet build RoomHub.slnx --no-restore`: thành công.
- `dotnet test RoomHub.Application.Tests/RoomHub.Application.Tests.csproj`: 10/10 test thành công.
- `npm run build`: thành công.
- ESLint riêng `src/pages/admin/Users.tsx` và `src/services/adminUsers.ts`: thành công.
- Kiểm tra sáu commit feature theo đúng tiêu đề và thứ tự commit plan.
- Full-repo ESLint vẫn không đạt do technical debt có sẵn ở các file ngoài phạm vi; không sửa lan sang feature khác.
