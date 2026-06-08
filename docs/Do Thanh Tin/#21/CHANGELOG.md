# Changelog

## 1. Thông tin project

| Thông tin | Nội dung |
|---|---|
| MSSV | DE180794 |
| Sinh viên | Đỗ Thanh Tín |
| Issue | #21 |
| Repository | https://github.com/fptu-se-su26/prn232-su26-ai-audit-project-prn232_se18d05_group-07 |
| Ngày hoàn thành | 06/06/2026 |

---

## 2. Tổng quan giai đoạn

| Giai đoạn | Nội dung | Trạng thái |
|---|---|---|
| Phase 01 | Schema moderation + migrations | Completed |
| Phase 02 | AI moderation pipeline (Groq + Gemini) | Completed |
| Phase 03 | Listing service + owner/public/admin API | Completed |
| Phase 04 | Frontend validation, owner actions, admin UI | Completed |
| Phase 05 | Audit docs + commit chuẩn SKILL.md | Completed |

---

# [Phase 01] Schema moderation & database

**Ngày:** 05/06/2026  
**Người thực hiện:** Đỗ Thanh Tín (DE180794)  
**AI hỗ trợ:** Cursor — thiết kế entity và migration

### Thay đổi
- Thêm `ModerationStatus` enum: Pending, Approved, Rejected, Flagged
- Mở rộng `Room`: `ModerationRemarks`, `ListingScore`, `AIFormattedDescription`, `HiddenByOwner`
- Migrations: `AddListingModeration`, `FixModelWarnings`, `AddHiddenByOwner`
- Cấu hình EF: `RoomConfiguration`, `SubscriptionConfiguration`

### Lỗi đã sửa
- Migration `HiddenByOwner` thiếu Designer.cs → EF không apply → API 500 `Invalid column name`

---

# [Phase 02] AI moderation pipeline

**Ngày:** 05/06/2026

### Thay đổi
- `ModerationManager`: pipeline 3 giai đoạn (rules → heuristic → AI)
- `GroqModerationService`: text + vision fallback
- `GeminiModerationService`: vision primary
- `ListingModerationRules`, `ListingContentHeuristics`, `ModerationMessageCatalog`
- Chấm điểm: Dữ liệu 15% + Nội dung 45% + Ảnh 40%

---

# [Phase 03] API backend

**Ngày:** 05–06/06/2026

### Thay đổi
- `ListingService`: moderation khi publish/update, delete, duplicate, validate-content
- `PublicListingsController`: GET listings/public (chỉ Approved + Published)
- `ListingsController`: validate-content, get/delete/duplicate, trả moderation result
- `AdminModerationController` + `AdminModerationService`: duyệt/từ chối tin Flagged
- `DbInitializer`: seed admin `admin@roomhub.vn`, auto-migrate

---

# [Phase 04] Frontend

**Ngày:** 05–06/06/2026

### Thay đổi
- `listingValidation.ts`: validate client mirror backend, realtime bước 2
- `ListingCreate.tsx`: checklist giá/diện tích, không block AI ở bước Next
- `ListingList.tsx`: menu 5 chức năng (chi tiết, ẩn, xem public, nhân bản, xóa)
- `Browse.tsx` + `RoomDetail.tsx`: gọi API public listings
- `Moderation.tsx` + `Rooms.tsx`: admin duyệt tin Flagged thật từ API

---

# [Phase 05] Git & audit

**Ngày:** 06/06/2026

### Thay đổi
- Xóa file `.vs/` khỏi git tracking
- Không commit secret (dùng `appsettings.Development.json` local)
- Tách nhiều commit `[DE180794]` theo chức năng, `Refs #21`
- Thêm 4 file audit trong `docs/Do Thanh Tin/#21/`
