# AI Audit Log

## 1. Thông tin chung

| Thông tin | Nội dung |
|---|---|
| Môn học | Lập trình C# |
| Mã môn học | PRN232 |
| Lớp | SE18D05 |
| Học kỳ | SU26 |
| Tên bài tập / Project | RoomHub - Quản lý phòng/nhà trọ (Tách biệt FE-BE) |
| Tên sinh viên / Nhóm | Nguyễn Hồng An / Nhóm 07 |
| MSSV / Danh sách MSSV | DE180358 |
| Giảng viên hướng dẫn | Thầy Lê Thiện Nhật Quang |
| Ngày bắt đầu | 12/07/2026 |
| Ngày hoàn thành | 12/07/2026 |

---

## 2. Công cụ AI đã sử dụng

- [ ] ChatGPT
- [ ] Gemini
- [x] Claude
- [ ] GitHub Copilot
- [ ] Cursor
- [ ] Antigravity
- [ ] Perplexity
- [ ] Microsoft Copilot

> Cụ thể: Claude Code (mô hình Opus 4.8) chạy trong terminal của VS Code.

---

## 3. Mục tiêu sử dụng AI

- Lập trình đầy đủ (full-stack) chức năng **Lịch sử tìm kiếm** cho người thuê: ghi lại lượt tìm phòng, xem lại, xóa từng mục và xóa tất cả.
- Tự động ghi log khi người thuê đã đăng nhập thực hiện tìm kiếm ở trang Browse (không ảnh hưởng khách vãng lai).

### Mô tả mục tiêu sử dụng AI

```text
Dùng Claude Code để hiện thực hóa chức năng Lịch sử tìm kiếm theo đúng convention đã dùng ở chức năng Đánh giá
(DTO → Repository → Service → Controller → Dependency Injection ở backend; trang tenant + điều hướng ở frontend),
và hook ghi log vào hàm submit tìm kiếm của trang Browse. Sinh viên định hướng phạm vi, quyết định thiết kế và
kiểm chứng bằng chạy thử thật.
```

---

## 4. Nhật ký sử dụng AI chi tiết

### Lần sử dụng AI số 1

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng | 12/07/2026 |
| Công cụ AI | Claude (Claude Code - Opus 4.8) |
| Mục đích sử dụng | Lập trình backend Lịch sử tìm kiếm |
| Phần việc liên quan | Backend / API, Service, Repository |
| Mức độ sử dụng | Sinh chính nội dung |

#### 4.1. Prompt đã sử dụng

```text
rồi bạn hãy làm đầy đủ phần lịch sử tìm kiếm cho tôi theo đúng quy trình như khi nảy làm phần đánh giá, làm xong
hoàn chỉnh xem code chạy chuẩn chỉnh chưa rồi đã push lên git nhé push lên nhánh vừa tạo còn tôi tự merge vô main
```

#### 4.2. Kết quả AI gợi ý

AI tạo lát cắt backend: `SearchHistoryDtos.cs`, `ISearchHistoryRepository` + `SearchHistoryRepository`, `ISearchHistoryService` + `SearchHistoryService`, `SearchHistoryController` với 4 endpoint, và đăng ký DI. Không cần migration vì bảng `SearchHistories` đã tồn tại.

#### 4.3. Phần sinh viên/nhóm đã sử dụng từ AI

Áp dụng toàn bộ vào nhánh `feature/de180358-tenant-search-history`.

#### 4.5. Minh chứng

- `SearchHistoryController.cs`, `SearchHistoryService.cs`

---

### Lần sử dụng AI số 2

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng | 12/07/2026 |
| Công cụ AI | Claude (Claude Code - Opus 4.8) |
| Mục đích sử dụng | Giao diện + tự động ghi log ở Browse |
| Phần việc liên quan | Frontend / React |
| Mức độ sử dụng | Sinh chính nội dung |

#### 4.1. Prompt đã sử dụng

```text
(tiếp tục) trang Lịch sử tìm kiếm trong khu người thuê, và tự động ghi log khi người thuê đã đăng nhập tìm ở Browse
```

#### 4.2. Kết quả AI gợi ý

AI tạo trang `SearchHistory.tsx` (xem lại, tìm lại, xóa từng mục, xóa tất cả, hiển thị bộ lọc dạng chip), gắn route + menu trong `App.tsx` và `TenantLayout.tsx`, và hook ghi log vào `handleSearchSubmit` của `Browse.tsx` (chỉ gọi khi có token, lỗi thì bỏ qua).

#### 4.3. Phần sinh viên/nhóm đã sử dụng từ AI

Tích hợp vào khu vực người thuê và trang Browse dùng chung.

#### 4.4. Phần sinh viên/nhóm tự chỉnh sửa hoặc cải tiến

Chốt việc chỉ ghi log khi đã đăng nhập và nuốt lỗi để không ảnh hưởng khách vãng lai; chuẩn hóa SearchQuery thành JSON để hiển thị lại dễ đọc.

#### 4.5. Minh chứng

- `SearchHistory.tsx`, thay đổi trong `Browse.tsx`

---

## 5. Bảng tổng hợp mức độ sử dụng AI

| Hạng mục | Không dùng AI | AI hỗ trợ ít | AI hỗ trợ nhiều | AI sinh chính | Ghi chú |
|---|:---:|:---:|:---:|:---:|---|
| Phân tích yêu cầu |  |  | [x] |  | Xác định phạm vi cho người thuê |
| Thiết kế kiến trúc hệ thống |  |  | [x] |  | Theo mẫu chức năng Đánh giá |
| Code frontend |  |  |  | [x] | Trang + hook ghi log |
| Code backend |  |  |  | [x] | DTO/Repo/Service/Controller |
| Debug lỗi |  | [x] |  |  |  |
| Kiểm thử sản phẩm |  |  | [x] |  | Chạy thử API bằng curl |
| Tối ưu code |  | [x] |  |  | Commit sạch |
| Viết báo cáo |  |  | [x] |  | Soạn nháp 4 file audit |

---

## 6. Các lỗi hoặc hạn chế từ AI

| STT | Lỗi/hạn chế từ AI | Cách phát hiện | Cách xử lý/cải tiến |
|---:|---|---|---|
| 1 | Ghi log ở Browse có thể chạy cả với vai trò không phải Tenant | Rà soát luồng đăng nhập | Chỉ gọi khi có token và bỏ qua lỗi 403 |
| 2 | Nếu ghi log mỗi thay đổi bộ lọc sẽ bị spam | Đọc logic Browse | Chỉ ghi khi người dùng bấm submit tìm kiếm |

---

## 7. Kiểm chứng kết quả AI

- Build backend thành công (0 lỗi), typecheck frontend đạt (exit 0).
- Chạy thử API thật trên cổng phụ 5299: đăng nhập tenant1 lấy token, gọi POST ghi lượt tìm kiếm, GET lấy lịch sử, DELETE xóa toàn bộ — tất cả trả về đúng.

---

## 8. Đóng góp cá nhân hoặc đóng góp nhóm

| Thành viên | MSSV | Nhiệm vụ chính | Có sử dụng AI không? | Minh chứng đóng góp |
|---|---|---|---|---|
| Nguyễn Hồng An | DE180358 | Lập trình Lịch sử tìm kiếm (FE+BE), viết tài liệu | Có | Nhánh `feature/de180358-tenant-search-history` |

---

## 9. Reflection cuối bài

### 9.1. AI đã hỗ trợ em ở điểm nào?
Tái sử dụng nhanh mẫu chức năng trước để dựng lát cắt full-stack và hook ghi log đúng chỗ.

### 9.2. Phần nào em không sử dụng theo gợi ý của AI? Vì sao?
Không ghi log theo mọi thay đổi bộ lọc để tránh spam; chỉ ghi khi người dùng bấm tìm.

### 9.3. Nếu không có AI, phần nào sẽ khó khăn nhất?
Việc nối đúng vào trang Browse dùng chung mà không làm hỏng trải nghiệm của khách chưa đăng nhập.

---

## 10. Cam kết học thuật

Sinh viên cam kết nội dung sử dụng trợ lý AI được ghi nhận hoàn toàn trung thực và chịu trách nhiệm với sản phẩm cuối cùng.

| Sinh viên xác nhận | Ngày xác nhận |
|---|---|
| Nguyễn Hồng An | 12/07/2026 |
