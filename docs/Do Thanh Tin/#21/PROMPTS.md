# Prompt Log

## 1. Thông tin chung

| Thông tin | Nội dung |
|---|---|
| Môn học | Lập trình C# |
| Mã môn học | PRN232 |
| Lớp | SE18D05 |
| Học kỳ | SU26 |
| Tên bài tập / Project | RoomHub - Quản lý phòng/nhà trọ |
| Tên sinh viên / Nhóm | Đỗ Thanh Tín / Nhóm 07 |
| MSSV | DE180794 |
| Giảng viên hướng dẫn | Thầy Lê Thiện Nhật Quang |
| Ngày bắt đầu | 04/06/2026 |
| Ngày cập nhật gần nhất | 06/06/2026 |

---

## 2. Công cụ AI đã sử dụng

- [x] Cursor
- [x] Groq API (runtime, không phải chatbot)
- [x] Gemini API (runtime, không phải chatbot)

---

## 3. Bảng tổng hợp prompt đã sử dụng

| STT | Ngày | Công cụ AI | Mục đích | Prompt tóm tắt | Kết quả chính | Có sử dụng? |
|---:|---|---|---|---|---|---|
| 1 | 04/06 | Cursor | Khảo sát | Khảo sát codebase RoomHub | Hiểu kiến trúc Clean Architecture | Có |
| 2 | 04/06 | Cursor | Fix bug | Fix AI moderation không chạy khi đăng bài | Sửa DI + ListingService | Có |
| 3 | 05/06 | Cursor | Nghiệp vụ | Siết kiểm duyệt giá/ảnh | Rules + scoring pipeline | Có |
| 4 | 05/06 | Cursor | Tối ưu | Pipeline 3 giai đoạn chuyên nghiệp | ModerationManager, Groq/Gemini | Có |
| 5 | 05/06 | Cursor | UX | Validate từng bước form đăng tin | listingValidation.ts | Có |
| 6 | 05/06 | Cursor | Admin | Luồng admin duyệt tin Flagged | AdminModerationService + UI | Có |
| 7 | 06/06 | Cursor | Owner | 5 chức năng menu tin đăng | delete/duplicate/hide/view | Có |
| 8 | 06/06 | Cursor | Debug | Lỗi Browse không kết nối máy chủ | Fix migration HiddenByOwner | Có |
| 9 | 06/06 | Cursor | Git | Chuẩn hóa commit theo SKILL.md | Nhiều commit theo chức năng | Có |

---

## 4. Prompt chi tiết

### Prompt số 1 — Khảo sát codebase

| Nội dung | Thông tin |
|---|---|
| Ngày | 04/06/2026 |
| Công cụ | Cursor |
| Mục đích | Nắm cấu trúc dự án trước khi code |

**Vai trò:** Trợ lý kỹ thuật  
**Bối cảnh:** Dự án RoomHub monorepo ASP.NET Core + React  
**Yêu cầu:** Khảo sát codebase, liệt kê module chính  
**Ràng buộc:** Không sửa code  
**Đầu ra:** Tóm tắt kiến trúc backend/frontend  

```text
Khảo sát codebase RoomHub
```

**Kết quả:** AI mô tả 4 layer backend, frontend routes, DB SQL Server. Em dùng làm bản đồ trước khi implement moderation.

---

### Prompt số 2 — Fix moderation

```text
Fix AI moderation không chạy khi đăng bài
```

**Kết quả:** Sửa `DependencyInjection`, `ListingService`, controller trả về `moderationStatus`. Em test publish tin và xác nhận AI chạy.

---

### Prompt số 3 — Pipeline kiểm duyệt

```text
Siết kiểm duyệt và tối ưu pipeline kiểm duyệt chuyên nghiệp (fix Groq Vision BadRequest)
```

**Kết quả:** `ModerationManager` 3 giai đoạn, `ListingModerationRules`, đổi model Groq Vision. Em tự test ảnh anime bị reject.

---

### Prompt số 4 — Validate & Admin

```text
Validate theo từng bước form; luồng Admin duyệt tin thật (AI chuyển Flagged → Admin xử lý)
```

**Kết quả:** Client validation bước 2, `AdminModerationController`, trang Moderation.tsx gọi API thật.

---

## 5. Cam kết

Tôi xác nhận các prompt trên phản ánh đúng những gì đã sử dụng.

**Chữ ký:** [CẦN KÝ — Đỗ Thanh Tín]

**Ngày ký:** [CẦN ĐIỀN]
