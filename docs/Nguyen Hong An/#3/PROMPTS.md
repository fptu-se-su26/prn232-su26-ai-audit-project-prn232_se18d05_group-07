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
| Ngày bắt đầu | 12/07/2026 |
| Ngày cập nhật gần nhất | 12/07/2026 |

---

## 2. Mục đích của file Prompt Log

Ghi lại các prompt quan trọng khi thực hiện chức năng **Lịch sử tìm kiếm** cho người thuê: hỏi AI điều gì, mục đích, AI trả lời gì, có áp dụng không và đã kiểm chứng ra sao.

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
| 1 | 12/07/2026 | Claude | Xác định vị trí | Lịch sử tìm kiếm cho chủ trọ hay người thuê, nằm ở đâu | Khẳng định cho người thuê, đặt trong khu tenant | Có | Hội thoại |
| 2 | 12/07/2026 | Claude | Code full-stack | Làm đầy đủ Lịch sử tìm kiếm theo quy trình như phần Đánh giá | BE + FE + hook Browse, chạy thử rồi push | Có | Nhánh feature/de180358-tenant-search-history |

---

## 5. Prompt chi tiết

---

### Prompt số 1

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng | 12/07/2026 |
| Công cụ AI | Claude (Claude Code - Opus 4.8) |
| Mục đích | Xác định đối tượng và vị trí chức năng |
| Phần việc liên quan | Requirement Analysis |
| Mức độ sử dụng | Hỏi phân tích |

#### 5.1. Prompt nguyên văn

```text
lịch sử tìm kiếm này cho chủ trọ hay cho thuê ... lịch sử tìm kiếm này nó nằm ở chỗ nào vậy
```

#### 5.2. Bối cảnh khi viết prompt

```text
Cần chốt đối tượng sử dụng và nơi đặt chức năng trước khi code.
```

#### 5.3. Kết quả AI trả về

```text
Chức năng dành cho người thuê (và khách đi tìm phòng): hiển thị trong menu khu người thuê, dữ liệu được ghi lại từ
trang tìm phòng Browse.
```

#### 5.4. Kết quả đã áp dụng vào bài

```text
Đặt trang trong khu tenant và hook ghi log ở Browse.
```

#### 5.6. Đánh giá chất lượng prompt

- [x] Prompt rõ ràng
- [x] Prompt tạo ra kết quả tốt

---

### Prompt số 2

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng | 12/07/2026 |
| Công cụ AI | Claude (Claude Code - Opus 4.8) |
| Mục đích | Hiện thực hóa đầy đủ chức năng |
| Phần việc liên quan | Backend + Frontend + Kiểm thử |
| Mức độ sử dụng | Hỏi sinh code |

#### 5.1. Prompt nguyên văn

```text
rồi bạn hãy làm đầy đủ phần lịch sử tìm kiếm cho tôi theo đúng quy trình như khi nảy làm phần đánh giá, làm xong
hoàn chỉnh xem code chạy chuẩn chỉnh chưa rồi đã push lên git nhé push lên nhánh vừa tạo còn tôi tự merge vô main
```

#### 5.2. Bối cảnh khi viết prompt

```text
Yêu cầu làm trọn gói, kiểm chứng chạy thật trước khi push, và chỉ push lên nhánh riêng để tự merge.
```

#### 5.3. Kết quả AI trả về

```text
AI dựng lát cắt backend và frontend, chạy thử API thật bằng curl (login, log, get, delete), rồi commit sạch và push.
```

#### 5.4. Kết quả đã áp dụng vào bài

```text
Toàn bộ code nằm trong nhánh feature/de180358-tenant-search-history.
```

#### 5.6. Đánh giá chất lượng prompt

- [x] Prompt rõ ràng
- [x] Prompt có đủ bối cảnh
- [x] Prompt tạo ra kết quả tốt

---

## 6. Prompt quan trọng nhất

### 6.1. Prompt được chọn

```text
làm đầy đủ phần lịch sử tìm kiếm ... làm xong hoàn chỉnh xem code chạy chuẩn chỉnh chưa rồi đã push
```

### 6.2. Vì sao prompt này quan trọng?

```text
Đặt ra tiêu chí rõ ràng: hoàn chỉnh và phải kiểm chứng chạy thật trước khi push, giúp đầu ra đáng tin cậy.
```

---

## 7. Prompt chưa hiệu quả

### 7.1. Prompt chưa hiệu quả

```text
(không có prompt nào gây lỗi đáng kể trong chức năng này)
```

### 7.2. Vì sao prompt này chưa hiệu quả?

```text
Không áp dụng.
```

### 7.3. Cách cải thiện prompt

```text
Không áp dụng.
```
