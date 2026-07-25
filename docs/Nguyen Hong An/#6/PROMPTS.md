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

Ghi lại các prompt quan trọng khi thực hiện **Chức năng Dịch vụ (Service Requests)** cho 3 vai trò.

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
| 1 | 25/07/2026 | Claude | Chọn chức năng chính | Còn chức năng nào nhiều tính năng thì làm | Chọn Dịch vụ (3 vai trò) | Có | Nhánh feature/de180358-service-requests |
| 2 | 25/07/2026 | Claude | Backend + Frontend + test | Làm đủ 3 vai trò, chạy thử rồi push | BE + FE 3 trang, test API đạt | Có | ServicesController.cs, ServiceRequests.tsx |

---

## 5. Prompt chi tiết

---

### Prompt số 1

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng | 25/07/2026 |
| Công cụ AI | Claude (Claude Code - Opus 4.8) |
| Mục đích | Chọn chức năng chính còn thiếu |
| Phần việc liên quan | Requirement Analysis |
| Mức độ sử dụng | Hỏi phân tích |

#### 5.1. Prompt nguyên văn

```text
còn chức năng nào nữa không code luôn cho tôi nào, hãy xem kĩ nhé và có tính chọn lọc, chức năng nào chưa code mà
nhiều tính năng chút tức là chức năng chính chút
```

#### 5.2. Bối cảnh khi viết prompt

```text
Cần chọn một chức năng lớn (nhiều tính năng con) còn thiếu để làm, thay vì các chức năng nhỏ lẻ.
```

#### 5.3. Kết quả AI trả về

```text
Rà soát cho thấy Service/ServiceRequest chưa code và là chức năng lớn trải 3 vai trò (admin/tenant/owner) → chọn làm.
```

#### 5.4. Kết quả đã áp dụng vào bài

```text
Làm chức năng Dịch vụ đầy đủ 3 vai trò.
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
làm chức năng Dịch vụ: admin quản lý danh mục, người thuê yêu cầu, chủ trọ xử lý; chạy thử rồi push lên nhánh
```

#### 5.2. Bối cảnh khi viết prompt

```text
Cần làm trọn gói theo các bước đã quen, kiểm chứng chạy thật cả 3 vai trò trước khi push.
```

#### 5.3. Kết quả AI trả về

```text
AI dựng backend 3 controller và frontend 3 trang, chạy thử API bằng curl với 3 tài khoản admin/owner/tenant, commit sạch.
```

#### 5.4. Kết quả đã áp dụng vào bài

```text
Toàn bộ nằm trong nhánh feature/de180358-service-requests.
```

#### 5.6. Đánh giá chất lượng prompt

- [x] Prompt rõ ràng
- [x] Prompt có đủ bối cảnh
- [x] Prompt tạo ra kết quả tốt

---

## 6. Prompt quan trọng nhất

### 6.1. Prompt được chọn

```text
chức năng nào chưa code mà nhiều tính năng chút tức là chức năng chính chút
```

### 6.2. Vì sao prompt này quan trọng?

```text
Định hướng chọn một chức năng lớn, có chiều sâu (nhiều vai trò, nhiều thao tác) thay vì chức năng nhỏ, giúp phần
đóng góp có giá trị rõ rệt.
```

---

## 7. Prompt chưa hiệu quả

### 7.1. Prompt chưa hiệu quả

```text
curl -d '{...tiếng Việt...}' qua Git Bash
```

### 7.2. Vì sao prompt này chưa hiệu quả?

```text
Git Bash mã hóa sai ký tự tiếng Việt trong tham số curl; server xử lý tiếng Việt bình thường.
```

### 7.3. Cách cải thiện prompt

```text
Dùng dữ liệu ASCII khi test bằng curl hoặc gửi body qua file để giữ đúng UTF-8.
```
