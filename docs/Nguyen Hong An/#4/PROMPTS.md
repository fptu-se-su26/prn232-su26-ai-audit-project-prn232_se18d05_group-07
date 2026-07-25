# Prompt Log

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
| Ngày cập nhật gần nhất | 25/07/2026 |

---

## 2. Mục đích của file Prompt Log

Ghi lại các prompt quan trọng khi thực hiện chức năng **Lịch sử xem phòng** cho người thuê.

---

## 3. Công cụ AI đã sử dụng

- [ ] ChatGPT
- [ ] Gemini
- [x] Claude
- [ ] GitHub Copilot
- [ ] Cursor
- [ ] Antigravity
- [ ] Microsoft Copilot

---

## 4. Bảng tổng hợp prompt đã sử dụng

| STT | Ngày | Công cụ AI | Mục đích | Prompt tóm tắt | Kết quả chính | Có sử dụng vào bài không? | Minh chứng |
|---:|---|---|---|---|---|---|---|
| 1 | 25/07/2026 | Claude | Rà soát & chọn task | Pull main, tìm chức năng người thuê còn thiếu rồi làm | Chọn "Lịch sử xem phòng" (BookingHistory) | Có | Nhánh feature/de180358-tenant-booking-history |
| 2 | 25/07/2026 | Claude | Code + migration | Thêm TenantId, API, trang, auto-log, chạy thử | BE+FE+migration, test API đạt | Có | BookingHistoryController.cs, BookingHistory.tsx |

---

## 5. Prompt chi tiết

---

### Prompt số 1

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng | 25/07/2026 |
| Công cụ AI | Claude (Claude Code - Opus 4.8) |
| Mục đích | Rà soát chức năng người thuê còn thiếu và làm tiếp |
| Phần việc liên quan | Requirement Analysis / Implementation |
| Mức độ sử dụng | Hỏi phân tích + sinh code |

#### 5.1. Prompt nguyên văn

```text
chuyển qua nhánh main pull src code mới nhất từ main về xem thử chức năng nào của người thuê trọ chưa hoàn thành thì
tạo nhánh mới tương tự để code cho tôi sau khi code xong, clean sạch sẽ code và làm theo các bước đã thực hiện sau đó
push lên nhánh vừa tạo cho tôi, khi code và clean chạy hoàn chỉnh xem code chuẩn chưa có bị lỗi hay k
```

#### 5.2. Bối cảnh khi viết prompt

```text
Main đã có thêm nhiều chức năng của các thành viên. Cần chọn đúng phần người thuê còn thiếu, tránh trùng, làm trọn
gói và kiểm chứng chạy thật trước khi push.
```

#### 5.3. Kết quả AI trả về

```text
AI phát hiện phần "đặt lịch xem phòng" đã có, chọn làm "Lịch sử xem phòng" bằng BookingHistory; thêm TenantId +
migration, viết BE/FE, hook auto-log ở trang chi tiết phòng, chạy thử API và commit sạch.
```

#### 5.4. Kết quả đã áp dụng vào bài

```text
Toàn bộ nằm trong nhánh feature/de180358-tenant-booking-history.
```

#### 5.6. Đánh giá chất lượng prompt

- [x] Prompt rõ ràng
- [x] Prompt có đủ bối cảnh
- [x] Prompt tạo ra kết quả tốt

---

## 6. Prompt quan trọng nhất

### 6.1. Prompt được chọn

```text
xem thử chức năng nào của người thuê trọ chưa hoàn thành thì tạo nhánh mới ... chạy hoàn chỉnh xem code chuẩn chưa
```

### 6.2. Vì sao prompt này quan trọng?

```text
Buộc phải đối chiếu với main mới để tránh trùng lặp và yêu cầu kiểm chứng chạy thật, giúp chọn đúng phần việc và
đảm bảo chất lượng.
```

---

## 7. Prompt chưa hiệu quả

### 7.1. Prompt chưa hiệu quả

```text
dotnet ef database update (khi SQL Server phản hồi chậm)
```

### 7.2. Vì sao prompt này chưa hiệu quả?

```text
SQL Server Express trên máy bắt tay rất chậm nên nhiều lần apply migration và đăng nhập bị timeout.
```

### 7.3. Cách cải thiện prompt

```text
Tăng Connect Timeout/Command Timeout trong chuỗi kết nối và chạy một tiến trình duy nhất; dùng SQL auth (sa) kết nối
ổn định hơn Trusted_Connection tới localhost trong môi trường này.
```
