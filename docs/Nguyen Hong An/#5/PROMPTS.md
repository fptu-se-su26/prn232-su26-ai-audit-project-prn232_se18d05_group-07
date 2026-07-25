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

Ghi lại các prompt quan trọng khi thực hiện chức năng **Yêu cầu bảo trì** cho người thuê.

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
| 1 | 25/07/2026 | Claude | Rà soát & chọn task | Xem còn tính năng nào chưa làm thì làm luôn | Chọn Yêu cầu bảo trì (còn mock, chưa có backend) | Có | Nhánh feature/de180358-tenant-maintenance |
| 2 | 25/07/2026 | Claude | Code + kiểm thử | Viết API bảo trì và nối trang, chạy thử rồi push | BE + FE, test API đạt | Có | MaintenanceController.cs, Maintenance.tsx |

---

## 5. Prompt chi tiết

---

### Prompt số 1

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng | 25/07/2026 |
| Công cụ AI | Claude (Claude Code - Opus 4.8) |
| Mục đích | Rà soát và chọn tính năng còn thiếu |
| Phần việc liên quan | Requirement Analysis |
| Mức độ sử dụng | Hỏi phân tích |

#### 5.1. Prompt nguyên văn

```text
xem thử còn tính năng nào chưa làm hãy làm luôn cho tôi nào
```

#### 5.2. Bối cảnh khi viết prompt

```text
Sau khi 3 chức năng lịch sử/đánh giá đã merge vào main, cần tìm tính năng người thuê còn thiếu để làm tiếp.
```

#### 5.3. Kết quả AI trả về

```text
Rà soát cho thấy Favorites/ViewingBookings/Chat đã xong; Yêu cầu bảo trì vẫn mock và chưa có controller nên được chọn.
```

#### 5.4. Kết quả đã áp dụng vào bài

```text
Làm chức năng Yêu cầu bảo trì trên nhánh riêng.
```

#### 5.6. Đánh giá chất lượng prompt

- [x] Prompt rõ ràng
- [x] Prompt tạo ra kết quả tốt

---

### Prompt số 2

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng | 25/07/2026 |
| Công cụ AI | Claude (Claude Code - Opus 4.8) |
| Mục đích | Hiện thực hóa và kiểm chứng |
| Phần việc liên quan | Backend + Frontend + Kiểm thử |
| Mức độ sử dụng | Hỏi sinh code |

#### 5.1. Prompt nguyên văn

```text
(tiếp tục) viết API yêu cầu bảo trì cho người thuê và nối trang Maintenance vào API thật, chạy thử rồi push
```

#### 5.2. Bối cảnh khi viết prompt

```text
Cần làm trọn gói theo đúng các bước như những chức năng trước, kiểm chứng chạy thật trước khi push.
```

#### 5.3. Kết quả AI trả về

```text
AI dựng backend (DTO/repo/service/controller/DI), nối trang Maintenance, chạy thử API bằng curl và commit sạch.
```

#### 5.4. Kết quả đã áp dụng vào bài

```text
Toàn bộ nằm trong nhánh feature/de180358-tenant-maintenance.
```

#### 5.6. Đánh giá chất lượng prompt

- [x] Prompt rõ ràng
- [x] Prompt có đủ bối cảnh
- [x] Prompt tạo ra kết quả tốt

---

## 6. Prompt quan trọng nhất

### 6.1. Prompt được chọn

```text
xem thử còn tính năng nào chưa làm hãy làm luôn cho tôi nào
```

### 6.2. Vì sao prompt này quan trọng?

```text
Đòi hỏi rà soát toàn bộ để chọn đúng phần còn thiếu, tránh làm trùng tính năng đã có.
```

---

## 7. Prompt chưa hiệu quả

### 7.1. Prompt chưa hiệu quả

```text
curl -d '{"title":"Vòi nước rò rỉ",...}' (tiếng Việt qua Git Bash)
```

### 7.2. Vì sao prompt này chưa hiệu quả?

```text
Git Bash mã hóa sai ký tự tiếng Việt trong tham số curl khiến JSON gửi lên bị hỏng; server từ chối đúng.
```

### 7.3. Cách cải thiện prompt

```text
Dùng dữ liệu ASCII khi test bằng curl, hoặc gửi body qua file để giữ đúng UTF-8. Server xử lý tiếng Việt bình thường.
```
