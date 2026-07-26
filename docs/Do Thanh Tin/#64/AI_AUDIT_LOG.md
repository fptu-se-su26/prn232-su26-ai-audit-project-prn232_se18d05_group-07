# AI Audit Log

## 1. General Information

| Field | Value |
|---|---|
| Course | C# Programming |
| Course Code | PRN232 |
| Class | SE18D05 |
| Semester | SU26 |
| Assignment / Project | RoomHub - Rental Room Management Platform |
| Student / Group | Do Thanh Tin / Group 07 |
| Student ID | DE180794 |
| Instructor | Mr. Le Thien Nhat Quang |
| Start Date | 26/07/2026 |
| Completion Date | 26/07/2026 |

---

## 2. AI Tools Used

- [ ] ChatGPT
- [ ] Gemini
- [x] Claude (Claude Code)
- [ ] GitHub Copilot
- [ ] Cursor
- [ ] Antigravity
- [ ] Perplexity
- [ ] Microsoft Copilot
- [ ] Other: ....................................

---

## 3. Purpose of AI Usage

- Turn behavioural data that RoomHub already collects (`FavoriteRoom`, `SearchHistory`) into actual recommendations, since it was being stored but never used.
- Decide whether semantic embeddings were the right tool for "similar rooms", given the project's limited Gemini quota.
- Build the scoring, the API, and a reusable frontend component placed on three pages.
- Write unit tests that run entirely offline.

### Summary of AI Usage Goals

```text
I used Claude (Claude Code) to add personalised recommendations. The plan I approved earlier said to
use cosine similarity over Gemini embeddings. Before writing code the AI re-read
RoomAssistantService.GetRoomEmbeddingsAsync and reported that embeddings are NOT stored in the
database — they are only held in a 6-hour in-memory cache and re-fetched from Gemini in batches
whenever the cache is cold. Using them for "similar rooms" would have burned quota on every cold
start, which is exactly the token problem I had raised earlier in the project.

The AI argued that "similar rooms" is a structured-data problem (district, price, type, area,
amenities), not a free-text problem, and recommended deterministic scoring instead: zero tokens,
faster, testable offline, and explainable during defence. Embeddings stay where they belong — in the
AI search assistant. I accepted this change of approach.

The result costs no AI tokens at all, required no migration, and modified no existing service or
repository.
```

---

## 4. Detailed Log of Each AI Use

### Session 1 — Investigate the embedding infrastructure

| Item | Content |
|---|---|
| Date | 26/07/2026 |
| Tool | Claude (Claude Code) |
| Purpose | Decide whether to use embeddings for similarity |

**Role:** Backend engineer / technical advisor
**Context:** The approved plan said "cosine similarity on embeddings".
**Request:** Implement personalised recommendations.
**Constraints:** Do not modify existing services or repositories; no migration; watch AI quota.
**Expected Output:** An implementation plan grounded in the real code.

**Result:** The AI found that:
- No embedding column exists anywhere in the schema — a repo-wide search for embedding fields in `Domain` and `Persistence` returned nothing.
- `RoomAssistantService` caches vectors in `IMemoryCache` with a 6-hour sliding expiry, keyed `emb:room:{id}:{hash}`, and calls `EmbedBatchAsync` for cache misses.

It concluded that a "similar rooms" widget on a public page would trigger batch embedding calls whenever the cache was cold, and proposed **deterministic scoring** instead. It also proposed dropping `IMemoryCache` entirely, since the cache in the original plan existed only to shield the embedding API — and `RoomHub.Application` does not currently reference `Microsoft.Extensions.Caching`.

**My decision:** I accepted both changes. They are recorded in `PROMPTS.md` as deviations from the approved plan, with reasons.

---

### Session 2 — Working within the "no modification" constraint

| Item | Content |
|---|---|
| Date | 26/07/2026 |
| Tool | Claude (Claude Code) |
| Purpose | Build the service without touching existing files |

**Result:** Three constraints surfaced during implementation, each reported to me rather than worked around silently:

1. `SearchPublicListingsAsync` clamps `PageSize` to a maximum of 50. Rather than add a repository method, the service issues one query per preferred district (max 3) plus one unfiltered query, then de-duplicates by room id.
2. `PublicListingService.MapToSummary` is `private`, so the existing summary DTO could not be reused. Instead of widening its accessibility, the AI created a purpose-built `RecommendedRoomDto` that also carries a human-readable `Reason` — which turned out better for the UI than the original plan.
3. `SearchHistoryRepository.GetByUserIdAsync` includes `ViewedRoom` but **not** its `Floor`/`Building`, so viewed rooms cannot contribute a district to the taste profile. Favourites can, because `FavoriteRoomRepository.GetPageAsync` does include the building. The AI documented this in a code comment rather than changing the repository, and let viewed rooms contribute price, type and area only.

---

### Session 3 — Scoring design

| Item | Content |
|---|---|
| Date | 26/07/2026 |
| Tool | Claude (Claude Code) |
| Purpose | Make the ranking explainable |

**Result:** Two scoring functions, each summing to exactly 100 so the score is directly readable as a percentage:

| Similar rooms | Weight | | For you | Weight |
|---|---:|---|---|---:|
| Same district | 35 | | Preferred district | 40 |
| Price proximity | 30 | | Price near profile median | 30 |
| Same room type | 15 | | Preferred room type | 15 |
| Area proximity | 10 | | Area near profile median | 15 |
| Shared amenities | 10 | | | |

Saved rooms carry weight 3 in the taste profile, merely-viewed rooms weight 1, combined via a weighted median so a single outlier cannot drag the profile. The highest-scoring component becomes the `Reason` string shown on the card.

---

### Session 4 — Frontend & tests

| Item | Content |
|---|---|
| Date | 26/07/2026 |
| Tool | Claude (Claude Code) |
| Purpose | One reusable component, three placements |

**Result:**
- `components/RecommendationRow.tsx` — a horizontally scrolling card row that **renders nothing at all** when there are no suggestions, so it can never leave an empty section on the page.
- `services/recommendations.ts` swallows API errors and returns an empty list, because recommendations are supplementary and must not break the host page.
- Placed on `Home.tsx`, the end of `RoomDetail.tsx` ("Phòng tương tự"), and `tenant/Dashboard.tsx`.
- 9 unit tests covering the anonymous fallback, ranking, exclusion of already-seen rooms, favourite-over-viewed weighting, the anchor never appearing in its own similar list, hidden/unapproved rooms never being suggested, and empty-data safety.

**Verification I performed:** backend build 0 errors, `tsc --noEmit` 0 errors, test run **71 passed / 0 failed** (62 pre-existing plus 9 new).

---

## 5. Commitment

I confirm the prompts and logs above accurately reflect what was actually done for this task. The decision to drop embeddings in favour of deterministic scoring was mine to approve, and I understand the trade-off: the recommendations cannot capture free-text nuance the way the AI assistant can, but they cost nothing to run and behave identically every time. I can explain every weight in both scoring functions and why no existing file needed to change.

**Student Name:** Do Thanh Tin
**Student ID:** DE180794
**Date:** 26/07/2026
