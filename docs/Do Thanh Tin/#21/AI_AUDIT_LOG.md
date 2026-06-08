# AI Audit Log

## 1. Thông tin chung

| Thông tin | Nội dung |
|---|---|
| Môn học | Lập trình C# |
| Mã môn học | PRN232 |
| Lớp | SE18D05 |
| Học kỳ | SU26 |
| Tên bài tập / Project | RoomHub - Quản lý phòng/nhà trọ |
| Tên sinh viên / Nhóm | Đỗ Thanh Tín / Nhóm 07 |
| MSSV / Danh sách MSSV | DE180794 |
| Giảng viên hướng dẫn | Thầy Lê Thiện Nhật Quang |
| Ngày bắt đầu | 04/06/2026 |
| Ngày hoàn thành | 06/06/2026 |

---

## 2. Công cụ AI đã sử dụng

- [ ] ChatGPT
- [x] Gemini (Vision API trong pipeline kiểm duyệt ảnh)
- [x] Claude
- [ ] GitHub Copilot
- [x] Cursor
- [ ] Antigravity
- [ ] Perplexity
- [ ] Microsoft Copilot
- [x] Groq (LLM text + Vision fallback trong pipeline kiểm duyệt)
- [ ] Công cụ khác: ....................................

---

## 3. Mục tiêu sử dụng AI

- Phân tích codebase RoomHub và thiết kế pipeline kiểm duyệt tin đăng 3 giai đoạn (rules → heuristic → AI).
- Triển khai backend moderation services (`ModerationManager`, `GroqModerationService`, `GeminiModerationService`).
- Mở rộng `ListingService` tích hợp moderation khi publish/update listing.
- Xây dựng API public listings (`PublicListingsController`) và admin moderation (`AdminModerationController`).
- Validate client-side theo từng bước form đăng tin (`listingValidation.ts`).
- Cập nhật UI owner (ẩn tin, nhân bản, xóa) và admin (duyệt tin Flagged).
- Sửa lỗi migration `HiddenByOwner` và lỗi Browse không kết nối API (HTTP 500).

### Mô tả mục tiêu sử dụng AI

```text
Sử dụng Cursor AI để phân tích yêu cầu nghiệp vụ kiểm duyệt tin đăng, thiết kế pipeline AI chuyên nghiệp,
triển khai backend/frontend, debug lỗi Groq Vision BadRequest, migration thiếu cột HiddenByOwner,
và chuẩn hóa quy trình commit theo SKILL.md của nhóm. Em tự review, test local, và chỉnh sửa logic
nghiệp vụ (giá tối thiểu 500k, diện tích 5–500m², trạng thái Flagged chuyển admin).
```

---

## 4. Nhật ký sử dụng AI chi tiết

### Lần sử dụng AI số 1

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng | 04/06/2026 |
| Công cụ AI | Cursor |
| Mục đích sử dụng | Khảo sát codebase và fix AI moderation không chạy khi đăng bài |
| Phần việc liên quan | Backend / ListingService / DI |
| Mức độ sử dụng | Hỗ trợ nhiều |

#### Prompt đã sử dụng

```text
Khảo sát codebase RoomHub và fix AI moderation không chạy khi owner đăng tin.
```

#### Kết quả AI gợi ý

AI xác định `IModerationService` chưa được đăng ký DI đúng, `ListingService` không gọi moderation khi publish.
Đề xuất sửa `DependencyInjection.cs`, `ListingService.cs`, `ListingsController.cs`.

#### Phần sinh viên đã sử dụng từ AI

Áp dụng đăng ký HttpClient + moderation services, gọi `RunModerationAsync` khi publish/update.

#### Phần sinh viên tự làm

Test đăng tin thực tế, xác nhận `ModerationStatus` được lưu vào DB.

---

### Lần sử dụng AI số 2

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng | 05/06/2026 |
| Công cụ AI | Cursor |
| Mục đích sử dụng | Siết kiểm duyệt và tối ưu pipeline 3 giai đoạn |
| Phần việc liên quan | ModerationManager, Groq/Gemini services |
| Mức độ sử dụng | Sinh chính nội dung, em review và chỉnh |

#### Prompt đã sử dụng

```text
Siết kiểm duyệt (giá 1đ, ảnh anime vẫn được duyệt) và tối ưu pipeline kiểm duyệt chuyên nghiệp.
```

#### Kết quả AI gợi ý

Thêm `ListingModerationRules`, `ListingContentHeuristics`, chấm điểm 15/45/40, Gemini Vision primary + Groq fallback.

#### Phần sinh viên tự làm

Điều chỉnh ngưỡng giá 500.000đ, test ảnh anime bị reject, fix Groq Vision model.

---

### Lần sử dụng AI số 3

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng | 05–06/06/2026 |
| Công cụ AI | Cursor |
| Mục đích sử dụng | Validate từng bước form, admin duyệt tin, owner actions |
| Phần việc liên quan | Frontend + Backend API |
| Mức độ sử dụng | Hỗ trợ nhiều |

#### Prompt đã sử dụng

```text
Validate theo từng bước form; luồng Admin duyệt tin Flagged; 5 chức năng menu tin đăng owner.
```

#### Kết quả AI gợi ý

`listingValidation.ts`, `AdminModerationService`, menu ListingList (xem/ẩn/nhân bản/xóa), migration `HiddenByOwner`.

---

## 5. Nguồn tham khảo

- Tài liệu nhóm: `SKILL.md` (quy trình commit & audit)
- Template audit: `docs/Phan Hoai An/#4/`
- API Groq: https://console.groq.com/docs
- API Gemini: https://ai.google.dev/gemini-api/docs

---

## 6. Cam kết

Tôi xác nhận rằng:

- [x] Các thông tin trong file này phản ánh đúng quá trình sử dụng AI.
- [x] Tôi đã tự đọc lại, hiểu và có thể giải thích các phần liên quan.
- [ ] Tôi chịu trách nhiệm về nội dung bài làm.

**Chữ ký:** [CẦN KÝ — Đỗ Thanh Tín]

**Ngày ký:** [CẦN ĐIỀN]
