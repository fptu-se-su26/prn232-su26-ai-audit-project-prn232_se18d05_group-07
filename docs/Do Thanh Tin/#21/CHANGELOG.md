# Changelog

## 1. Project Information

| Field | Value |
|---|---|
| Student ID | DE180794 |
| Student | Do Thanh Tin |
| Issue | #21 |
| Repository | https://github.com/fptu-se-su26/prn232-su26-ai-audit-project-prn232_se18d05_group-07 |
| Completion Date | 06/06/2026 |

---

## 2. Phase Overview

| Phase | Scope | Status |
|---|---|---|
| Phase 01 | Moderation schema + migrations | Completed |
| Phase 02 | AI moderation pipeline (Groq + Gemini) | Completed |
| Phase 03 | Listing service + owner/public/admin API | Completed |
| Phase 04 | Frontend validation, owner actions, admin UI | Completed |
| Phase 05 | Audit docs + SKILL.md commit workflow | Completed |

---

# [Phase 01] Moderation Schema & Database

**Date:** 05/06/2026  
**Author:** Do Thanh Tin (DE180794)  
**AI Support:** Cursor — entity and migration design

### Changes
- Added `ModerationStatus` enum: Pending, Approved, Rejected, Flagged
- Extended `Room` with `ModerationRemarks`, `ListingScore`, `AIFormattedDescription`, `HiddenByOwner`
- Migrations: `AddListingModeration`, `FixModelWarnings`, `AddHiddenByOwner`
- EF configuration: `RoomConfiguration`, `SubscriptionConfiguration`

### Bugs Fixed
- `HiddenByOwner` migration missing Designer.cs → EF skipped migration → API 500 `Invalid column name`

---

# [Phase 02] AI Moderation Pipeline

**Date:** 05/06/2026

### Changes
- `ModerationManager`: 3-stage pipeline (rules → heuristic → AI)
- `GroqModerationService`: text + vision fallback
- `GeminiModerationService`: primary vision provider
- `ListingModerationRules`, `ListingContentHeuristics`, `ModerationMessageCatalog`
- Scoring: Data 15% + Content 45% + Images 40%

---

# [Phase 03] Backend API

**Date:** 05–06/06/2026

### Changes
- `ListingService`: moderation on publish/update, delete, duplicate, validate-content
- `PublicListingsController`: public GET listings (Approved + Published only)
- `ListingsController`: validate-content, get/delete/duplicate, moderation response
- `AdminModerationController` + `AdminModerationService`: approve/reject Flagged listings
- `DbInitializer`: seed admin `admin@roomhub.vn`, auto-migrate on startup

---

# [Phase 04] Frontend

**Date:** 05–06/06/2026

### Changes
- `listingValidation.ts`: client validation mirroring backend, realtime at step 2
- `ListingCreate.tsx`: price/area checklist, no blocking AI call on Next
- `ListingList.tsx`: 5 menu actions (detail, hide, view public, duplicate, delete)
- `Browse.tsx` + `RoomDetail.tsx`: consume public listings API
- `Moderation.tsx` + `Rooms.tsx`: admin reviews real Flagged listings from API

---

# [Phase 05] Git & Audit

**Date:** 06/06/2026

### Changes
- Removed `.vs/` from git tracking
- No secrets committed (local keys in `appsettings.Development.json`)
- Split into multiple `[DE180794]` commits with `Refs #21`
- Added 4 audit files under `docs/Do Thanh Tin/#21/`
