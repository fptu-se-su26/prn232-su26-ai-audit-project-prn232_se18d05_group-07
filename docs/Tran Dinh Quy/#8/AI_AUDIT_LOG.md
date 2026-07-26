# AI Audit Log - Đợt cập nhật #8

## Thông tin

| Mục | Nội dung |
|---|---|
| Sinh viên | Trần Đình Quý |
| MSSV | DE180286 |
| Nhánh | `bugfix/de180286-review-moderation-integration` |
| Công cụ AI | Codex (GPT-5) |
| Ngày thực hiện | 26/07/2026 |

## Phạm vi AI hỗ trợ

| Hạng mục | AI hỗ trợ | Kiểm chứng đã thực hiện |
|---|---|---|
| Đồng bộ nhánh | Kiểm tra main, xác minh audit #7 trùng commit đã merge và tạo lại FIX-02 từ main mới. | Nhánh bắt đầu từ merge PR #54, commit `71b5376`. |
| Route audit | Đối chiếu menu, page type, render và hash map để tìm mapping bị thiếu. | Bổ sung `review-moderation` và frontend build thành công. |
| Backend validation | Thiết kế catalog reason code có canonicalization và rule description cho `Other`. | Thêm unit tests cho code hợp lệ, hoa/thường, mã lạ và payload không hợp lệ. |
| Legacy safety | Phát hiện dereference `Tenant.FullName` và các evidence field có thể thiếu. | Backend dùng fallback null-safe; UI hiển thị fallback cho room/contract. |
| Public UI | Thay `prompt` bằng form modal có catalog từ API, validation, loading và error. | TypeScript/Vite production build thành công. |
| Admin UI | Viết lại moderation page để loại `prompt`, thêm evidence fallback và modal action. | Targeted file được rà lại; frontend production build thành công. |
| Regression test | Mở rộng test service và thêm catalog tests. | Full backend Release test đạt 29/29. |
| Tài liệu | Soạn bốn file audit đợt #8 theo thao tác và kết quả thực tế. | Không ghi đã commit/push khi các bước đó chưa diễn ra. |

## Quyết định và điều chỉnh

- Backend catalog là nguồn chuẩn; frontend tải catalog qua API và có fallback cùng mã để form vẫn sử dụng được khi catalog request lỗi.
- Reason code được lưu ở dạng canonical nhằm tránh dữ liệu `spam`, `SPAM` và `Spam` bị tách nhóm.
- `Other` phải có description để admin có đủ thông tin xử lý.
- Admin moderation reason vẫn là nội dung tự do vì phụ thuộc từng case, nhưng được nhập qua modal và giới hạn 1000 ký tự.
- Deep-link được sửa trong cơ chế routing hiện tại; chưa refactor toàn bộ hash routing trong nhánh bugfix.
- Không sửa package-lock không đồng bộ vì đây là technical debt ngoài phạm vi và có thể kéo theo thay đổi dependency lớn.

## Lỗi gặp phải và cách xử lý

1. Khi pull main, bốn file audit #7 local trùng với file đã merge nhưng Git trên Windows không unlink được.
   - So sánh hash từng file với commit `c5f851c`, xác nhận trùng byte, dọn bản sao và pull lại.
2. Lần pull tiếp theo lỗi DNS tạm thời.
   - Chạy lại `git pull --ff-only`; main fast-forward thành công tới PR #54.
3. `npm ci` thất bại vì package-lock không đồng bộ.
   - Dùng `npm install --no-package-lock --ignore-scripts` để cài local mà không sửa lockfile.
4. Lệnh `npm run lint -- <files>` vẫn lint toàn repository vì script chứa `eslint .`.
   - Gọi eslint binary trực tiếp cho file mục tiêu; ghi nhận lỗi cũ trong `App.tsx`/`RoomDetail.tsx` và sửa lỗi mới trong admin page.

## Kết quả

Review moderation có thể truy cập bằng deep-link, reason code được kiểm soát từ backend, dữ liệu legacy không làm admin detail lỗi null và hai luồng report/moderation không còn dùng `prompt`. Backend tests và frontend production build đều thành công.
