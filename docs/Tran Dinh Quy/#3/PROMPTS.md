# Prompt Log - Đợt cập nhật #3

## Công cụ AI

- Codex (GPT-5)

## Prompt đã sử dụng

| STT | Mục đích | Prompt thực tế/tóm tắt | Kết quả áp dụng |
|---:|---|---|---|
| 1 | Triển khai feature | “Tôi đã tạo nhánh `feature/de180286-persistent-room-favorites`, hãy hoàn thành chức năng **#2. Favorites thật**.” | Đọc đặc tả, rà cấu trúc hiện tại và triển khai backend, API, UI Favorites thật. |
| 2 | Commit feature | “Giúp tôi commit theo đúng commit plan của mục **#2. Favorites thật**.” | Bổ sung project test, chia code thành đúng năm commit theo tiêu đề được quy định và chạy 4 test. |
| 3 | Audit đợt 3 | “Giúp tôi tạo thư mục 3 trong Tran Dinh Quý để mô tả chức năng thực hiện của nhánh này. Và giúp tôi commit.” | Tạo bốn tài liệu audit trong `docs/Tran Dinh Quy/#3/` dựa trên thay đổi, commit và kết quả kiểm chứng thực tế. |

## Ràng buộc đã áp dụng

- Không tin user ID do frontend gửi; lấy actor từ JWT.
- Chỉ role Tenant dùng endpoint favorite.
- Không sửa migration cũ và không tạo migration khi schema hiện tại đã đáp ứng.
- Add/remove phải idempotent và khóa kép không được tạo duplicate.
- Listing bị ẩn không bị xóa favorite âm thầm.
- Không đưa file đặc tả đầu vào chưa tracked vào các commit feature/docs.

## Kiểm tra sau khi áp dụng

- Đối chiếu đủ endpoint, phân quyền và chính sách listing với đặc tả.
- Build backend và frontend production.
- Chạy test tự động cho các negative case chính.
- Kiểm tra năm commit feature theo đúng thứ tự commit plan.
- Soạn tài liệu chỉ từ các thao tác và kết quả thực sự diễn ra trong phiên làm việc.
