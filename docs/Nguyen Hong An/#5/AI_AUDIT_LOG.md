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
| Ngày bắt đầu | 25/07/2026 |
| Ngày hoàn thành | 25/07/2026 |

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

- Lập trình đầy đủ (full-stack) chức năng **Yêu cầu bảo trì** cho người thuê, dùng entity `MaintenanceTicket` (đã có sẵn nhưng chưa có API/giao diện thật).
- Nối trang `Maintenance.tsx` (đang dùng dữ liệu mẫu) vào API thật.

### Mô tả mục tiêu sử dụng AI

```text
Sau khi rà soát main mới nhất, phần Yêu cầu bảo trì là tính năng người thuê còn thiếu thật sự (FE là mock, chưa có
MaintenanceController). Dùng Claude Code để viết lát cắt DTO → Repository → Service → Controller → DI ở backend
(lấy phòng đang thuê qua IContractService), và nối trang Maintenance vào API. Sinh viên định hướng và kiểm chứng.
```

---

## 4. Nhật ký sử dụng AI chi tiết

### Lần sử dụng AI số 1

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng | 25/07/2026 |
| Công cụ AI | Claude (Claude Code - Opus 4.8) |
| Mục đích sử dụng | Rà soát tính năng người thuê còn thiếu |
| Phần việc liên quan | Requirement Analysis |
| Mức độ sử dụng | Hỗ trợ nhiều |

#### 4.1. Prompt đã sử dụng

```text
xem thử còn tính năng nào chưa làm hãy làm luôn cho tôi nào
```

#### 4.2. Kết quả AI gợi ý

AI quét trang FE (mock vs API) và controller backend: Favorites/ViewingBookings/Chat đã xong; còn **Yêu cầu bảo trì** là chưa có backend và FE vẫn mock → chọn làm.

#### 4.3. Phần sinh viên/nhóm đã sử dụng từ AI

Chọn làm chức năng Yêu cầu bảo trì cho người thuê.

#### 4.5. Minh chứng

- Kết quả rà soát trang/controller trong hội thoại.

---

### Lần sử dụng AI số 2

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng | 25/07/2026 |
| Công cụ AI | Claude (Claude Code - Opus 4.8) |
| Mục đích sử dụng | Backend + nối frontend |
| Phần việc liên quan | Backend / Frontend |
| Mức độ sử dụng | Sinh chính nội dung |

#### 4.1. Prompt đã sử dụng

```text
(tiếp tục) viết API yêu cầu bảo trì cho người thuê và nối trang Maintenance vào API thật, chạy thử rồi push
```

#### 4.2. Kết quả AI gợi ý

- Backend: `MaintenanceTicketDtos`, `IMaintenanceTicketRepository`/`MaintenanceTicketRepository`, `IMaintenanceTicketService`/`MaintenanceTicketService` (lấy phòng đang thuê qua `IContractService`, tạo yêu cầu trạng thái Open, cho hủy khi chưa xử lý), `MaintenanceController` 3 endpoint, đăng ký DI.
- Frontend: viết lại `Maintenance.tsx` gọi API (tạo, danh sách, hủy), bỏ dữ liệu mẫu.

#### 4.3. Phần sinh viên/nhóm đã sử dụng từ AI

Áp dụng vào nhánh `feature/de180358-tenant-maintenance`.

#### 4.4. Phần sinh viên/nhóm tự chỉnh sửa hoặc cải tiến

Bỏ nhãn "AI phân tích cảm xúc" trong bản mock cũ vì backend không tính sentiment (khai báo trung thực); chỉ giữ trạng thái xử lý.

#### 4.5. Minh chứng

- `MaintenanceController.cs`, `MaintenanceTicketService.cs`, `Maintenance.tsx`

---

## 5. Bảng tổng hợp mức độ sử dụng AI

| Hạng mục | Không dùng AI | AI hỗ trợ ít | AI hỗ trợ nhiều | AI sinh chính | Ghi chú |
|---|:---:|:---:|:---:|:---:|---|
| Phân tích yêu cầu |  |  | [x] |  | Rà soát mock vs API |
| Thiết kế kiến trúc hệ thống |  |  | [x] |  | Theo mẫu chức năng trước |
| Code frontend |  |  |  | [x] | Nối trang Maintenance |
| Code backend |  |  |  | [x] | DTO/Repo/Service/Controller |
| Debug lỗi |  | [x] |  |  | Xử lý SQL chậm, encoding curl |
| Kiểm thử sản phẩm |  |  | [x] |  | Chạy thử API bằng curl |
| Tối ưu code |  | [x] |  |  | Commit sạch |
| Viết báo cáo |  |  | [x] |  | Soạn nháp 4 file audit |

---

## 6. Các lỗi hoặc hạn chế từ AI

| STT | Lỗi/hạn chế từ AI | Cách phát hiện | Cách xử lý/cải tiến |
|---:|---|---|---|
| 1 | Bản mock có nhãn "AI sentiment" dễ gây hiểu nhầm | Đọc kỹ trang mock | Bỏ nhãn vì backend không tính, giữ trung thực |
| 2 | Cần xác định phòng để gắn yêu cầu | Rà soát nghiệp vụ | Lấy phòng đang thuê qua IContractService thay vì cho client tự nhập |

---

## 7. Kiểm chứng kết quả AI

- Build backend thành công (0 lỗi). Không cần migration (bảng `MaintenanceTickets` đã có sẵn).
- Typecheck frontend cho `Maintenance.tsx` đạt.
- Chạy thử API thật trên cổng phụ 5299: đăng nhập tenant1, POST tạo yêu cầu (tự gắn đúng phòng đang thuê, trạng thái Open), GET trả về đúng, DELETE hủy thành công khi Open, GET lại rỗng.

---

## 8. Đóng góp cá nhân hoặc đóng góp nhóm

| Thành viên | MSSV | Nhiệm vụ chính | Có sử dụng AI không? | Minh chứng đóng góp |
|---|---|---|---|---|
| Nguyễn Hồng An | DE180358 | Lập trình Yêu cầu bảo trì (FE+BE), viết tài liệu | Có | Nhánh `feature/de180358-tenant-maintenance` |

---

## 9. Reflection cuối bài

### 9.1. AI đã hỗ trợ em ở điểm nào?
Giúp rà soát nhanh tính năng còn thiếu và dựng lát cắt full-stack, tái dùng dịch vụ có sẵn (IContractService).

### 9.2. Phần nào em không sử dụng theo gợi ý của AI? Vì sao?
Bỏ nhãn AI sentiment để khai báo trung thực.

### 9.3. Nếu không có AI, phần nào sẽ khó khăn nhất?
Việc tìm đúng dịch vụ có sẵn để lấy phòng đang thuê của người dùng.

---

## 10. Cam kết học thuật

Sinh viên cam kết nội dung sử dụng trợ lý AI được ghi nhận hoàn toàn trung thực và chịu trách nhiệm với sản phẩm cuối cùng.

| Sinh viên xác nhận | Ngày xác nhận |
|---|---|
| Nguyễn Hồng An | 25/07/2026 |
