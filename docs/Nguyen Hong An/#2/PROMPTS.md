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

File này ghi lại các prompt quan trọng đã dùng khi thực hiện chức năng **Đánh giá phòng/chủ trọ** của sinh viên Nguyễn Hồng An: hỏi AI điều gì, mục đích, công cụ, AI trả lời gì, có áp dụng vào bài không, và đã kiểm tra/chỉnh sửa ra sao.

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
| 1 | 12/07/2026 | Claude | Rà soát | Kiểm tra main + các nhánh xem chức năng nào chưa code, thuộc vai trò nào | Bảng phân loại chức năng thiếu theo chủ trọ/người thuê/admin | Có | Hội thoại làm việc |
| 2 | 12/07/2026 | Claude | Chọn task | Tìm task chưa ai đụng vào | Nhóm "đất trống": Review, SearchHistory, BookingHistory... | Có | Hội thoại làm việc |
| 3 | 12/07/2026 | Claude | Code backend | Làm chức năng Đánh giá cho người thuê | DTO/Repo/Service/Controller + DI | Có | ReviewsController.cs |
| 4 | 12/07/2026 | Claude | Code frontend | Trang chấm sao + xem/xóa đánh giá | MyReviews.tsx + điều hướng | Có | MyReviews.tsx |
| 5 | 12/07/2026 | Claude | Git | Mỗi chức năng một nhánh, push code sạch | Commit gọn, loại bin/obj/package-lock | Có | Nhánh feature/de180358-tenant-reviews |
| 6 | 12/07/2026 | Claude | Hoàn thiện | Thêm chức năng Sửa đánh giá | PUT endpoint + form sửa inline | Có | ReviewsController.cs, MyReviews.tsx |

---

## 5. Prompt chi tiết

---

### Prompt số 1

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng | 12/07/2026 |
| Công cụ AI | Claude (Claude Code - Opus 4.8) |
| Mục đích | Rà soát chức năng chưa code theo vai trò |
| Phần việc liên quan | Requirement Analysis |
| Mức độ sử dụng | Hỏi phân tích |

#### 5.1. Prompt nguyên văn

```text
kiểm tra tất cả các nhánh cũng như trong main xem còn chức năng nào chưa code và nó thuộc về chủ trọ hay người
thuê trọ hay là admin nói rõ cho tôi biết nào
```

#### 5.2. Bối cảnh khi viết prompt

```text
Cần biết bức tranh tổng thể chức năng còn thiếu để chọn phần việc nhận làm, tránh trùng với các thành viên khác.
```

#### 5.3. Kết quả AI trả về

```text
AI liệt kê chức năng chưa code, chia theo Admin / Chủ trọ / Người thuê / Public, và phân biệt "có màn hình mock
nhưng chưa có backend" với "chưa ai đụng vào".
```

#### 5.4. Kết quả đã áp dụng vào bài

```text
Chọn 3 chức năng cho người thuê: Đánh giá, Lịch sử tìm kiếm, Lịch sử đặt/xem phòng.
```

#### 5.6. Đánh giá chất lượng prompt

- [x] Prompt rõ ràng
- [x] Prompt có đủ bối cảnh
- [x] Prompt tạo ra kết quả tốt

---

### Prompt số 2

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng | 12/07/2026 |
| Công cụ AI | Claude (Claude Code - Opus 4.8) |
| Mục đích | Hiện thực hóa chức năng Đánh giá |
| Phần việc liên quan | Backend + Frontend |
| Mức độ sử dụng | Hỏi sinh code |

#### 5.1. Prompt nguyên văn

```text
tôi sẽ làm chức năng đánh giá phòng/chủ trọ và chức năng lịch sử tìm kiếm và lịch sử đặt/xem phòng cho người thuê
```

#### 5.2. Bối cảnh khi viết prompt

```text
Bắt đầu làm từng chức năng một, chức năng đầu tiên là Đánh giá, yêu cầu không code vào main mà tạo nhánh riêng.
```

#### 5.3. Kết quả AI trả về

```text
AI đọc các file mẫu để nắm convention rồi sinh đủ lát cắt backend (DTO, Repository, Service, Controller, DI) và
trang frontend MyReviews, có kiểm tra build/typecheck.
```

#### 5.4. Kết quả đã áp dụng vào bài

```text
Toàn bộ code được đưa vào nhánh feature/de180358-tenant-reviews.
```

#### 5.6. Đánh giá chất lượng prompt

- [x] Prompt rõ ràng
- [x] Prompt tạo ra kết quả tốt

---

### Prompt số 3

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng | 12/07/2026 |
| Công cụ AI | Claude (Claude Code - Opus 4.8) |
| Mục đích | Giữ chuẩn Git của nhóm |
| Phần việc liên quan | Version Control |
| Mức độ sử dụng | Hỏi thao tác |

#### 5.1. Prompt nguyên văn

```text
mỗi khi code xong 1 chức năng phải tạo nhánh riêng, push src code lên nhánh, clear sạch gọn không có code dư thừa
class hay code bẩn
```

#### 5.2. Bối cảnh khi viết prompt

```text
Yêu cầu commit sạch, mỗi chức năng một nhánh để tự merge vào main.
```

#### 5.3. Kết quả AI trả về

```text
AI chỉ stage đúng các file của chức năng (loại bin/obj/node_modules/package-lock), commit theo mẫu [DE180358]
feat: ... không kèm Co-Authored-By, rồi push nhánh.
```

#### 5.4. Kết quả đã áp dụng vào bài

```text
Nhánh feature/de180358-tenant-reviews đã push, commit chỉ chứa 10 file đúng chức năng.
```

#### 5.6. Đánh giá chất lượng prompt

- [x] Prompt rõ ràng
- [x] Prompt tạo ra kết quả tốt

---

## 6. Prompt quan trọng nhất

### 6.1. Prompt được chọn

```text
tôi sẽ làm chức năng đánh giá phòng/chủ trọ ... làm từng chức năng một, bắt đầu với Đánh giá
```

### 6.2. Vì sao prompt này quan trọng?

```text
Đây là prompt khởi động việc hiện thực hóa chức năng, quyết định phạm vi và thứ tự làm việc, giúp đầu ra tập
trung, dễ kiểm thử và dễ merge từng phần.
```

---

## 7. Prompt chưa hiệu quả

### 7.1. Prompt chưa hiệu quả

```text
dotnet ef database update (khi chưa cài .NET 10 SDK)
```

### 7.2. Vì sao prompt này chưa hiệu quả?

```text
Máy chỉ có .NET SDK 9 trong khi dự án nhắm net10.0 nên build fail; ngoài ra DB đã tồn tại sẵn bảng gây lỗi khi
migrate. Đây là vấn đề môi trường, không phải lỗi code.
```

### 7.3. Cách cải thiện prompt

```text
Kiểm tra phiên bản SDK và trạng thái DB trước (dotnet --list-sdks); nếu DB đã có sẵn schema thì drop rồi update
lại, và cài đúng .NET 10 SDK trước khi build.
```
