# Changelog

## 1. Project Information

| Field | Value |
|---|---|
| Student ID | DE180794 |
| Student | Do Thanh Tin |
| Issue | #64 |
| Feature | Personalized Recommendations — "Gợi ý cho bạn" & "Phòng tương tự" |
| Repository | https://github.com/fptu-se-su26/prn232-su26-ai-audit-project-prn232_se18d05_group-07 |
| Branch | `feature/de180794-personalized-recommendations` |
| Completion Date | 26/07/2026 |

---

## 2. Phase Overview

| Phase | Scope | Status |
|---|---|---|
| Phase 01 | Investigate embedding infrastructure; revise the approach | Completed |
| Phase 02 | Backend — DTOs & recommendation scoring service | Completed |
| Phase 03 | Backend — controller & DI registration | Completed |
| Phase 04 | Frontend — API client, reusable row, three placements | Completed |
| Phase 05 | Unit tests | Completed |
| Phase 06 | Commits & audit documentation | Completed |

---

# [Phase 01] Investigation & Revised Approach

**Date:** 26/07/2026
**Author:** Do Thanh Tin (DE180794)
**AI Support:** Claude — infrastructure analysis

### Findings
- `FavoriteRoom` and `SearchHistory` have been collecting data for a long time but were **never used to produce any recommendation**.
- Embeddings are **not persisted**: `RoomAssistantService.GetRoomEmbeddingsAsync` holds them in `IMemoryCache` for 6 hours and re-fetches from Gemini in batches on a miss. A public "similar rooms" widget would call Gemini on every cold cache.

### Decisions
- **Use deterministic scoring instead of embeddings.** Similar-room matching operates on structured attributes (district, price, type, area, amenities), so this costs zero tokens, runs faster, and is testable offline. Embeddings stay with the AI search assistant.
- **Drop `IMemoryCache`.** Its only purpose in the original plan was to shield the embedding API.

### Changes
- Created branch `feature/de180794-personalized-recommendations` from `main` (`85524a4`).

---

# [Phase 02] Backend — DTOs & Scoring Service

**Date:** 26/07/2026
**Author:** Do Thanh Tin (DE180794)
**AI Support:** Claude — scoring model & implementation

### Changes
- Added `RoomHub.Application/Common/DTOs/Recommendations/RecommendationDtos.cs` — `RecommendedRoomDto` (with `MatchScore` and a human-readable `Reason`), `RecommendationListDto`, and the `RecommendationStrategy` constants.
- Added `RoomHub.Application/Common/Interfaces/IRecommendationService.cs`.
- Added `RoomHub.Application/Services/RecommendationService.cs`.

### Scoring model
Both functions sum to exactly 100, so the score reads directly as a percentage.

| Similar rooms | Weight | | For you | Weight |
|---|---:|---|---|---:|
| Same district | 35 | | Preferred district | 40 |
| Price proximity | 30 | | Price near profile median | 30 |
| Same room type | 15 | | Preferred room type | 15 |
| Area proximity | 10 | | Area near profile median | 15 |
| Shared amenities | 10 | | | |

- Proximity decays linearly and reaches 0 at 50% deviation.
- Taste profile: saved rooms weight 3, viewed rooms weight 1, combined with a **weighted median** so one outlier cannot skew the profile.
- The highest-scoring component becomes the `Reason` shown on the card.
- Anonymous visitors, users with no history, and users whose profile matches nothing all fall back to featured listings (highest `ListingScore`) — never an error, never an empty response when listings exist.

### Notes
- **No existing service or repository was modified.** Candidates come from `IRoomRepository.SearchPublicListingsAsync`; because its `PageSize` is clamped to 50, the service issues one query per preferred district (max 3) plus one unfiltered query, then de-duplicates by room id.
- `SearchHistoryRepository` includes `ViewedRoom` but not its `Floor`/`Building`, so viewed rooms contribute price/type/area only; district comes from favourites, whose repository does include the building. This is documented in a code comment.
- `PublicListingService.MapToSummary` is `private`, so a purpose-built DTO was created rather than widening its accessibility.
- Visibility is enforced in the service: deleted, unpublished, owner-hidden and non-approved rooms can never be suggested.
- **No database migration required.**

---

# [Phase 03] Backend — Controller & DI

**Date:** 26/07/2026
**Author:** Do Thanh Tin (DE180794)
**AI Support:** Claude — controller scaffolding

### Changes
- Added `RoomHub.API/Controllers/RecommendationsController.cs`:
  - `GET /api/recommendations/for-you?take=6` — `[AllowAnonymous]`
  - `GET /api/recommendations/similar/{roomId}?take=6` — `[AllowAnonymous]`
- `userId` is read from the `NameIdentifier` claim when present; a missing claim simply means "guest" rather than an error.
- Modified `RoomHub.Infrastructure/DependencyInjection.cs` — **one added line**.

---

# [Phase 04] Frontend — Reusable Recommendation Row

**Date:** 26/07/2026
**Author:** Do Thanh Tin (DE180794)
**AI Support:** Claude — React component

### Changes
- Added `RoomHub.Frontend/src/services/recommendations.ts` — typed client that **swallows errors and returns an empty list**, because recommendations are supplementary and must never break the host page.
- Added `RoomHub.Frontend/src/components/RecommendationRow.tsx`:
  - Horizontally scrolling, snap-aligned card row.
  - Each card shows the image, title, district, price, area, and a **reason badge** ("Cùng khu vực Hải Châu").
  - **Renders `null` entirely when there is nothing to show**, so it can never leave an empty section behind.
  - Cancels its in-flight state update on unmount.
- Placed on three pages, each an additive insertion:
  - `pages/Home.tsx` — "Gợi ý cho bạn"
  - `pages/RoomDetail.tsx` — "Phòng tương tự", after the reviews section
  - `pages/tenant/Dashboard.tsx` — "Gợi ý cho bạn"

---

# [Phase 05] Unit Tests

**Date:** 26/07/2026
**Author:** Do Thanh Tin (DE180794)
**AI Support:** Claude — test design

### Changes
- Added `RoomHub.Application.Tests/RecommendationServiceTests.cs` — 9 tests with hand-written fakes (the project does not use Moq):

| # | Test | Guards |
|---|---|---|
| 1 | Anonymous visitor gets featured listings | No-auth path |
| 2 | Signed in with no history falls back to featured | Cold-start path |
| 3 | Same district + similar price ranked first | Ranking correctness |
| 4 | Saved and viewed rooms excluded from suggestions | No stale repeats |
| 5 | Saved rooms outweigh merely-viewed rooms | Weighting (3 vs 1) |
| 6 | Similar list never contains the anchor room | Obvious-bug guard |
| 7 | Similar prefers same district and comparable price | Ranking correctness |
| 8 | Hidden / unapproved rooms are never suggested | **Visibility leak guard** |
| 9 | No candidates returns empty instead of throwing | Empty-data safety |

### Verification
- Backend build: **0 errors**.
- Frontend `tsc --noEmit`: **0 errors**.
- Test run: **71 passed / 0 failed** (62 pre-existing plus 9 new).
- `git diff` on pre-existing files: **13 insertions, 0 deletions** across 4 files.

---

# [Phase 06] Commits & Documentation

**Date:** 26/07/2026
**Author:** Do Thanh Tin (DE180794)
**AI Support:** Claude — commit split & documentation drafting

### Changes
- Split the work into concern-based commits (all `Refs #64`), with no `Co-Authored-By` lines per team convention.
- Added the 4 required AI-audit files under `docs/Do Thanh Tin/#64/`.

### Notes
- The feature adds **zero AI token cost** at runtime.
- `bin/`, `obj/` and `node_modules/` were not committed.
