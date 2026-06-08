# Prompt Log

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
| Last Updated | 06/06/2026 |

---

## 2. AI Tools Used

- [x] Cursor
- [x] Groq API (runtime integration, not chatbot)
- [x] Gemini API (runtime integration, not chatbot)

---

## 3. Prompt Summary Table

| No. | Date | AI Tool | Purpose | Prompt Summary | Main Result | Applied? |
|---:|---|---|---|---|---|---|
| 1 | 04/06 | Cursor | Exploration | Explore RoomHub codebase | Understood Clean Architecture layout | Yes |
| 2 | 04/06 | Cursor | Bug fix | Fix moderation not running on publish | Fixed DI + ListingService | Yes |
| 3 | 05/06 | Cursor | Business rules | Tighten price/image moderation | Rules + scoring pipeline | Yes |
| 4 | 05/06 | Cursor | Optimization | Professional 3-stage pipeline | ModerationManager, Groq/Gemini | Yes |
| 5 | 05/06 | Cursor | UX | Step-by-step listing form validation | listingValidation.ts | Yes |
| 6 | 05/06 | Cursor | Admin flow | Admin review for Flagged listings | AdminModerationService + UI | Yes |
| 7 | 06/06 | Cursor | Owner actions | 5 listing menu actions | delete/duplicate/hide/view | Yes |
| 8 | 06/06 | Cursor | Debug | Browse page server connection error | Fixed HiddenByOwner migration | Yes |
| 9 | 06/06 | Cursor | Git workflow | Standardize commits per SKILL.md | Multiple feature-based commits | Yes |

---

## 4. Detailed Prompts

### Prompt #1 — Codebase Exploration

| Field | Value |
|---|---|
| Date | 04/06/2026 |
| Tool | Cursor |
| Purpose | Understand project structure before implementation |

**Role:** Technical assistant  
**Context:** RoomHub monorepo with ASP.NET Core + React  
**Request:** Explore codebase and list main modules  
**Constraints:** Do not modify code  
**Expected Output:** Architecture summary  

```text
Explore the RoomHub codebase
```

**Result:** AI described the 4 backend layers, frontend routes, and SQL Server DB. I used this as a map before implementing moderation.

---

### Prompt #2 — Fix Moderation

```text
Fix AI moderation not running when publishing a listing
```

**Result:** Fixed `DependencyInjection`, `ListingService`, and controller responses with `moderationStatus`. I tested publish and confirmed AI ran.

---

### Prompt #3 — Moderation Pipeline

```text
Tighten moderation and optimize a professional moderation pipeline (fix Groq Vision BadRequest)
```

**Result:** `ModerationManager` with 3 stages, `ListingModerationRules`, updated Groq Vision model. I tested anime images being rejected.

---

### Prompt #4 — Validation & Admin

```text
Validate form step-by-step; implement real admin review flow (AI sets Flagged → Admin handles)
```

**Result:** Client validation at step 2, `AdminModerationController`, Moderation.tsx calling real API.

---

## 5. Commitment

I confirm the prompts above accurately reflect what I actually used.

**Signature:** [TO SIGN — Do Thanh Tin]

**Date:** [TO FILL IN]
