# AI Learning Reflection - Đợt cập nhật #8

## Điều đã học

- Một page có trong menu và render tree chưa có nghĩa deep-link hoạt động; routing cần kiểm tra cả parse URL và serialize state về URL.
- Chuỗi reason code là dữ liệu nghiệp vụ, không nên chấp nhận tùy ý chỉ dựa vào độ dài.
- Canonicalization giúp báo cáo và analytics không bị chia nhỏ vì khác chữ hoa/thường.
- Catalog nên do backend sở hữu để frontend không tự định nghĩa policy khác API.
- Dữ liệu legacy có thể phá assumptions của navigation property; admin/evidence screen cần fallback null-safe.
- `prompt` không phù hợp với workflow có catalog, mô tả bắt buộc, loading và API error.
- `npm ci` là kiểm tra tốt cho tính tái lập; việc nó thất bại cho thấy lockfile cần một task riêng, không nên âm thầm sửa trong bugfix.
- Lint script có `eslint .` vẫn quét toàn repo dù truyền thêm file; muốn targeted lint phải gọi binary trực tiếp.

## Cách kiểm chứng kết quả AI

- Đối chiếu `AdminLayout`, `PageType`, `adminMap` và render branch.
- Kiểm tra public report API và `ReviewService.ReportAsync`.
- Thử các reason code đúng, sai, khác hoa/thường và `Other` thiếu description bằng automated tests.
- Rà admin moderation query và UI evidence fallback.
- Chạy toàn bộ backend tests ở Release.
- Cài dependencies không sửa lockfile và chạy TypeScript/Vite production build.
- Gọi eslint trực tiếp cho các file mục tiêu và phân biệt lỗi mới với technical debt cũ.
- Chạy `git diff --check` trước commit.

## Hạn chế và bước tiếp theo

- Chưa có frontend component test hoặc browser E2E cho refresh route và modal.
- Frontend vẫn dùng hash/local state routing; cần task refactor riêng.
- Fallback catalog frontend bị lặp dữ liệu với backend để đảm bảo khả dụng; về lâu dài có thể cache endpoint thay vì hard-code fallback.
- Admin dismiss report vẫn dùng note mặc định; có thể bổ sung modal nhập note ở task UX sau.
- package-lock cần được đồng bộ trong một dependency maintenance PR riêng.
- Full-repo ESLint còn nhiều lỗi ngoài phạm vi.
- Chưa chạy API với SQL Server và nhiều tài khoản thật trong phiên này.

## Cải tiến cá nhân

Khi sửa một integration gap, cần kiểm tra toàn bộ contract theo chuỗi: URL → route mapping → component state → API payload → backend validation → database value → admin display. Chỉ sửa một đầu có thể làm UI đẹp hơn nhưng dữ liệu vẫn không nhất quán.

## Cam kết

Đây là bản nháp do AI hỗ trợ soạn từ lịch sử làm việc thực tế. Tôi sẽ tự đọc lại, đối chiếu code và kết quả kiểm thử, chỉnh sửa nội dung chưa đúng và tự ký trước khi commit tài liệu.

- Người xác nhận: **[SINH VIÊN TỰ KÝ]**
- Ngày xác nhận: **[SINH VIÊN TỰ ĐIỀN]**
