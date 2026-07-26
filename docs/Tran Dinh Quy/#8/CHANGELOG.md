# Changelog - Đợt cập nhật #8

## Thông tin

| Mục | Nội dung |
|---|---|
| Project | RoomHub - Quản lý phòng/nhà trọ |
| Môn học | PRN232 |
| Sinh viên | Trần Đình Quý |
| MSSV | DE180286 |
| Nhánh | `bugfix/de180286-review-moderation-integration` |
| Ngày thực hiện | 26/07/2026 |

## Lỗi được xử lý

- Route `admin-review-moderation` có menu và component nhưng thiếu mapping `review-moderation` trong `App.tsx`, làm deep-link/refresh không khôi phục đúng trang.
- Admin review detail dereference trực tiếp `r.Tenant.FullName`, không an toàn với dữ liệu legacy thiếu navigation.
- API report chỉ kiểm tra reason code có nội dung và dài tối đa 50 ký tự, nên chấp nhận mã tùy ý.
- Public report và admin moderation dùng `prompt`, không có catalog, validation, loading hoặc error state phù hợp.
- Update review bị từ chối bởi moderation rule có thể trả lỗi 500 vì controller chưa chuyển `InvalidOperationException` thành 409.

## Hoàn thành

- Bổ sung mapping `review-moderation -> admin-review-moderation`.
- Thêm `ReviewReportReasonCatalog` với năm mã chuẩn:
  - `Spam`
  - `Abuse`
  - `FalseInformation`
  - `PersonalInformation`
  - `Other`
- Thêm `GET /api/reviews/report-reasons` làm nguồn catalog cho frontend.
- Chuẩn hóa reason code không phân biệt hoa/thường và từ chối mã ngoài catalog.
- Bắt buộc description khi reason là `Other`; tiếp tục giới hạn description 1000 ký tự.
- Làm admin review DTO null-safe khi tenant, room hoặc contract legacy không còn tồn tại.
- Giới hạn moderation reason tối đa 1000 ký tự.
- Thay public report `prompt` bằng modal có select reason, description, validation, counter, loading và error.
- Viết lại admin review moderation UI với loading/error state, evidence fallback và modal xác nhận action.
- Trả HTTP 409 cho update review vi phạm moderation state.
- Thêm test cho catalog, canonicalization, invalid reason và rule `Other`.

## Kiểm chứng

- Backend Release tests: 29/29 thành công.
- Frontend TypeScript/Vite production build: thành công.
- Targeted lint cho file admin moderation mới không phát sinh lỗi sau điều chỉnh.
- Full-repo ESLint vẫn không đạt do hơn 200 lỗi có sẵn ngoài phạm vi.
- `npm ci` không chạy được vì `package-lock.json` có sẵn không đồng bộ với `package.json`; dependencies được cài local bằng `npm install --no-package-lock --ignore-scripts`, không sửa lockfile.
- Frontend build cảnh báo bundle lớn; không có build error.
- Không có migration mới trong nhánh này.
