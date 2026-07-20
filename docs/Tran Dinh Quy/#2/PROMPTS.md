# Prompt Log - Đợt cập nhật #2

## Công cụ AI

- Codex (GPT-5)

## Prompt chính

| STT | Mục đích | Prompt tóm tắt | Kết quả áp dụng |
|---:|---|---|---|
| 1 | Triển khai feature | “Tôi đã tạo nhánh `feature/de180286-room-viewing-and-deposit`, hãy hoàn thành chức năng đặt lịch xem phòng, giữ phòng và đặt cọc và commit theo file hướng dẫn.” | Phân tích đặc tả, triển khai xuyên suốt domain, application, infrastructure, API và frontend. |
| 2 | Domain và database | Tạo booking entity/state machine riêng, mở rộng deposit và không sửa migration cũ. | Thêm entity, enum, EF configurations, indexes, constraints, row version và migration mới. |
| 3 | Workflow và bảo mật | Lấy actor từ JWT, kiểm tra ownership, availability, lịch trùng, transition và số tiền cọc server-side. | Thêm workflow service, tenant/owner controllers, error envelope, audit và notification. |
| 4 | Expiry và idempotency | Giải phóng room hold hết hạn đúng một lần và xử lý callback/payment theo transaction ID. | Thêm unique filtered transaction ID, hosted expiry service và kiểm tra hợp đồng trước khi giải phóng phòng. |
| 5 | UI và kiểm chứng | Nối Room Detail và màn hình quản lý cho hai vai trò, sau đó build/lint và commit đúng convention. | Thêm service/UI/routes/menu, build backend/frontend, lint file mới và tạo năm commit. |
| 6 | Audit đợt 2 | “Tạo mục thứ 2 về feature này trong Trần Đình Quý tương tự mẫu mục 1 và commit chính xác.” | Soạn bốn file audit trong `docs/Tran Dinh Quy/#2/` từ kết quả thực tế. |

## Kiểm tra sau khi áp dụng

- Đối chiếu endpoint, actor và state transition với `FEATURE_IMPLEMENTATION_SPEC_DE180286.md`.
- Kiểm tra migration không sửa lịch sử migration cũ và có index/constraint cần thiết.
- Build solution backend và production frontend.
- Lint riêng các file frontend mới và ghi nhận trung thực lỗi lint tồn tại sẵn toàn repository.
- Kiểm tra `git diff`, lịch sử commit và không đưa `node_modules`, `dist` hoặc file đặc tả đầu vào vào commit feature.

