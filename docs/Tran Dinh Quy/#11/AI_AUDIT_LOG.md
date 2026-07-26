# AI Audit Log - Đợt cập nhật #11

## Thông tin

| Mục | Nội dung |
|---|---|
| Sinh viên | Trần Đình Quý |
| MSSV | DE180286 |
| Nhánh | `bugfix/de180286-favorite-public-listing-consistency` |
| Công cụ AI | Codex (GPT-5) |
| Ngày thực hiện | 26/07/2026 |

## Phạm vi AI hỗ trợ

| Hạng mục | Hỗ trợ | Kiểm chứng |
|---|---|---|
| Browse | Rà pagination và phát hiện page 1 trộn listing API với mock ID cộng 100000. | Browse chỉ dùng `data.items`, `total` và `totalPages` từ API. |
| Detail | Loại fallback mock ở detail, gallery và similar rooms. | ID không tồn tại hiển thị error state; gallery chỉ dùng `ImageUrls` từ API. |
| Favorite | Siết icon theo room API và rollback khi request lỗi. | Node tests 2/2 cho optimistic add/remove rollback. |
| Backend | Chỉ cho favorite listing đang public và approved. | Service tests gồm listing không hợp lệ và pagination. |
| Seed | Phát hiện demo user/building/room chạy ở mọi environment. | `DbInitializer.SeedDataAsync` chỉ gọi trong Development; startup migration vẫn chạy ở mọi environment như trước. |

## Kết quả

Favorites và public listing dùng cùng nguồn dữ liệu thật. Mock room không còn tham gia runtime browse, detail, similar room, pagination hoặc favorite; lỗi API có loading/empty/error state rõ ràng.
