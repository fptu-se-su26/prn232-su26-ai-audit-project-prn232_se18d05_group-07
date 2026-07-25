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

- Lập trình đầy đủ (full-stack) chức năng **Lịch sử xem phòng** cho người thuê, dùng entity `BookingHistory`.
- Thêm cột `TenantId` vào bảng `BookingHistories` (tạo migration), tự động ghi log khi người thuê đã đăng nhập mở xem chi tiết một phòng.

### Mô tả mục tiêu sử dụng AI

```text
Sau khi rà soát main mới nhất, phần "đặt lịch xem phòng" (RoomViewingBooking) đã được thành viên khác làm. Phần còn
thiếu là "lịch sử xem phòng" — ghi lại những phòng người thuê đã bấm xem chi tiết. Dùng Claude Code để bổ sung
TenantId cho BookingHistory (migration), viết lát cắt DTO → Repository → Service → Controller → DI, và hook auto-log
ở trang chi tiết phòng. Sinh viên định hướng phạm vi (tránh trùng phần đã có), quyết định thiết kế và kiểm chứng.
```

---

## 4. Nhật ký sử dụng AI chi tiết

### Lần sử dụng AI số 1

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng | 25/07/2026 |
| Công cụ AI | Claude (Claude Code - Opus 4.8) |
| Mục đích sử dụng | Rà soát chức năng người thuê còn thiếu trên main mới |
| Phần việc liên quan | Requirement Analysis |
| Mức độ sử dụng | Hỗ trợ nhiều |

#### 4.1. Prompt đã sử dụng

```text
chuyển qua nhánh main pull src code mới nhất từ main về xem thử chức năng nào của người thuê trọ chưa hoàn thành thì
tạo nhánh mới tương tự để code cho tôi ... clean sạch sẽ code ... chạy hoàn chỉnh xem code chuẩn chưa có bị lỗi hay k
```

#### 4.2. Kết quả AI gợi ý

AI cập nhật main, phát hiện "đặt lịch xem phòng" (RoomViewingBooking + TenantViewingBookingsController) đã có, nên phần còn thiếu thực sự là "lịch sử xem phòng" dùng bảng `BookingHistory` (đang trống, thiếu liên kết người thuê).

#### 4.3. Phần sinh viên/nhóm đã sử dụng từ AI

Chọn làm "Lịch sử xem phòng" để không trùng với phần đã có.

#### 4.5. Minh chứng

- Kết quả rà soát controller/entity trong hội thoại.

---

### Lần sử dụng AI số 2

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng | 25/07/2026 |
| Công cụ AI | Claude (Claude Code - Opus 4.8) |
| Mục đích sử dụng | Migration + backend + frontend |
| Phần việc liên quan | Database / Backend / Frontend |
| Mức độ sử dụng | Sinh chính nội dung |

#### 4.1. Prompt đã sử dụng

```text
(tiếp tục) thêm TenantId cho BookingHistory, tạo migration, viết API lịch sử xem phòng và trang cho người thuê, tự
động ghi log khi xem chi tiết phòng
```

#### 4.2. Kết quả AI gợi ý

- Thêm `TenantId` + navigation vào entity `BookingHistory` và cấu hình EF (FK + index).
- Migration `AddTenantIdToBookingHistory` (chỉ thêm cột + index + khóa ngoại).
- Backend: `BookingHistoryDtos`, `IBookingHistoryRepository`/`BookingHistoryRepository`, `IBookingHistoryService`/`BookingHistoryService` (có chống trùng: xem lại cùng phòng thì cập nhật thời điểm), `BookingHistoryController` 4 endpoint, đăng ký DI.
- Frontend: trang `BookingHistory.tsx` + điều hướng, và hook auto-log ở `RoomDetail.tsx` (chỉ khi đăng nhập vai trò Tenant, bỏ qua phòng mock, nuốt lỗi).

#### 4.3. Phần sinh viên/nhóm đã sử dụng từ AI

Áp dụng toàn bộ vào nhánh `feature/de180358-tenant-booking-history`.

#### 4.4. Phần sinh viên/nhóm tự chỉnh sửa hoặc cải tiến

Chốt cơ chế chống trùng (mỗi phòng một dòng, cập nhật thời điểm mới nhất) và lưu giá tại thời điểm xem (`PriceAtBooking`).

#### 4.5. Minh chứng

- `BookingHistoryController.cs`, `BookingHistoryService.cs`, `BookingHistory.tsx`, migration `AddTenantIdToBookingHistory`.

---

## 5. Bảng tổng hợp mức độ sử dụng AI

| Hạng mục | Không dùng AI | AI hỗ trợ ít | AI hỗ trợ nhiều | AI sinh chính | Ghi chú |
|---|:---:|:---:|:---:|:---:|---|
| Phân tích yêu cầu |  |  | [x] |  | Tránh trùng phần đã có |
| Thiết kế database |  |  | [x] |  | Thêm TenantId + migration |
| Code frontend |  |  |  | [x] | Trang + hook auto-log |
| Code backend |  |  |  | [x] | DTO/Repo/Service/Controller |
| Debug lỗi |  | [x] |  |  | Xử lý SQL chậm khi migrate/chạy |
| Kiểm thử sản phẩm |  |  | [x] |  | Chạy thử API bằng curl |
| Tối ưu code |  | [x] |  |  | Commit sạch |
| Viết báo cáo |  |  | [x] |  | Soạn nháp 4 file audit |

---

## 6. Các lỗi hoặc hạn chế từ AI

| STT | Lỗi/hạn chế từ AI | Cách phát hiện | Cách xử lý/cải tiến |
|---:|---|---|---|
| 1 | Auto-log có thể ghi cả phòng mock hoặc khi chưa đăng nhập | Rà soát RoomDetail | Chỉ ghi khi vai trò Tenant, bỏ qua roomId phòng mock (>=100000) |
| 2 | Xem lại cùng một phòng sẽ tạo nhiều dòng trùng | Suy nghĩ về UX | Chống trùng: cập nhật thời điểm dòng cũ thay vì thêm mới |

---

## 7. Kiểm chứng kết quả AI

- Build backend thành công (0 lỗi). Migration `AddTenantIdToBookingHistory` áp dụng thành công vào DB (Done).
- Typecheck frontend cho các file của chức năng đạt (các lỗi còn lại thuộc feature khác của nhóm do thiếu package cục bộ).
- Chạy thử API thật trên cổng phụ 5299: đăng nhập tenant1, POST ghi xem phòng (roomId=1) trả về đúng, POST lại cùng phòng chỉ cập nhật thời điểm (không tạo trùng), GET trả về đúng 1 mục, DELETE toàn bộ thành công.

---

## 8. Đóng góp cá nhân hoặc đóng góp nhóm

| Thành viên | MSSV | Nhiệm vụ chính | Có sử dụng AI không? | Minh chứng đóng góp |
|---|---|---|---|---|
| Nguyễn Hồng An | DE180358 | Lập trình Lịch sử xem phòng (FE+BE+migration), viết tài liệu | Có | Nhánh `feature/de180358-tenant-booking-history` |

---

## 9. Reflection cuối bài

### 9.1. AI đã hỗ trợ em ở điểm nào?
Giúp rà soát nhanh phần đã có trên main để chọn đúng phần còn thiếu, và dựng nhanh lát cắt full-stack kèm migration.

### 9.2. Phần nào em không sử dụng theo gợi ý của AI? Vì sao?
Không cho auto-log chạy vô điều kiện; giới hạn theo vai trò và chống trùng để dữ liệu gọn.

### 9.3. Nếu không có AI, phần nào sẽ khó khăn nhất?
Việc thêm cột vào entity cũ và tạo migration đúng chuẩn giữa nhiều migration mới của nhóm.

---

## 10. Cam kết học thuật

Sinh viên cam kết nội dung sử dụng trợ lý AI được ghi nhận hoàn toàn trung thực và chịu trách nhiệm với sản phẩm cuối cùng.

| Sinh viên xác nhận | Ngày xác nhận |
|---|---|
| Nguyễn Hồng An | 25/07/2026 |
