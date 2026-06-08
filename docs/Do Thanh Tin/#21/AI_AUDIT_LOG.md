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
| Start Date | 04/06/2026 |
| Completion Date | 06/06/2026 |

---

## 2. AI Tools Used

- [ ] ChatGPT
- [x] Gemini (Vision API in image moderation pipeline)
- [x] Claude
- [ ] GitHub Copilot
- [x] Cursor
- [ ] Antigravity
- [ ] Perplexity
- [ ] Microsoft Copilot
- [x] Groq (LLM text + Vision fallback in moderation pipeline)
- [ ] Other: ....................................

---

## 3. Purpose of AI Usage

- Analyze the RoomHub codebase and design a 3-stage listing moderation pipeline (rules → heuristic → AI).
- Implement backend moderation services (`ModerationManager`, `GroqModerationService`, `GeminiModerationService`).
- Extend `ListingService` to run moderation on publish/update.
- Build public listings API (`PublicListingsController`) and admin moderation API (`AdminModerationController`).
- Add step-by-step client-side form validation (`listingValidation.ts`).
- Update owner UI (hide, duplicate, delete) and admin UI (review Flagged listings).
- Fix `HiddenByOwner` migration issue and Browse page API error (HTTP 500).

### Summary of AI Usage Goals

```text
I used Cursor AI to analyze listing moderation requirements, design a professional AI pipeline,
implement backend/frontend features, debug Groq Vision BadRequest errors, fix the missing
HiddenByOwner migration column, and standardize commits per the team SKILL.md workflow.
I personally reviewed, tested locally, and adjusted business rules (minimum price 500,000 VND,
area 5–500 m², Flagged status routed to admin review).
```

---

## 4. Detailed AI Usage Log

### AI Usage #1

| Field | Value |
|---|---|
| Date | 04/06/2026 |
| AI Tool | Cursor |
| Purpose | Explore codebase and fix AI moderation not running on publish |
| Related Work | Backend / ListingService / DI |
| Usage Level | Heavy support |

#### Prompt Used

```text
Explore the RoomHub codebase and fix AI moderation not running when the owner publishes a listing.
```

#### AI Suggestion

AI identified that `IModerationService` was not registered correctly in DI and `ListingService`
did not call moderation on publish. Suggested fixes in `DependencyInjection.cs`,
`ListingService.cs`, and `ListingsController.cs`.

#### What I Applied from AI

Registered HttpClient + moderation services and called `RunModerationAsync` on publish/update.

#### What I Did Myself

Tested real listing publish flow and confirmed `ModerationStatus` was persisted to the database.

---

### AI Usage #2

| Field | Value |
|---|---|
| Date | 05/06/2026 |
| AI Tool | Cursor |
| Purpose | Tighten moderation rules and optimize the 3-stage pipeline |
| Related Work | ModerationManager, Groq/Gemini services |
| Usage Level | AI generated main content; I reviewed and adjusted |

#### Prompt Used

```text
Tighten moderation (1 VND price and anime images still approved) and optimize a professional moderation pipeline.
```

#### AI Suggestion

Added `ListingModerationRules`, `ListingContentHeuristics`, scoring weights 15/45/40,
Gemini Vision as primary and Groq as fallback.

#### What I Did Myself

Set minimum price to 500,000 VND, verified anime images are rejected, fixed Groq Vision model.

---

### AI Usage #3

| Field | Value |
|---|---|
| Date | 05–06/06/2026 |
| AI Tool | Cursor |
| Purpose | Step validation, admin review flow, owner listing actions |
| Related Work | Frontend + Backend API |
| Usage Level | Heavy support |

#### Prompt Used

```text
Validate form step-by-step; implement admin review for Flagged listings; add 5 owner listing menu actions.
```

#### AI Suggestion

`listingValidation.ts`, `AdminModerationService`, ListingList menu (view/hide/duplicate/delete),
`HiddenByOwner` migration.

---

## 5. References

- Team workflow: `SKILL.md`
- Audit template: `docs/Phan Hoai An/#4/`
- Groq API: https://console.groq.com/docs
- Gemini API: https://ai.google.dev/gemini-api/docs

---

## 6. Commitment

I confirm that:

- [x] The information in this file accurately reflects my AI usage.
- [x] I have read, understood, and can explain all related parts.
- [ ] I take full responsibility for the submitted work.

**Signature:** [TO SIGN — Do Thanh Tin]

**Date:** [TO FILL IN]
