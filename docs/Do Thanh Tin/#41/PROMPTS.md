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
| Start Date | 22/07/2026 |
| Last Updated | 24/07/2026 |

---

## 2. AI Tools Used

- [x] Claude (Claude Code)

---

## 3. Prompt Summary Table

| No. | Date | AI Tool | Purpose | Prompt Summary | Main Result | Applied? |
|---:|---|---|---|---|---|---|
| 1 | 22/07 | Claude | Ideation | Read codebase, suggest modern features | Shortlist of trend-forward UX features | Yes |
| 2 | 22/07 | Claude | Ideation | Focus on features that optimize UX | Prioritized set (conversational search, autofill, realtime...) | Yes |
| 3 | 22/07 | Claude | Design | Describe RAG chatbot + write master prompt | Detailed spec + approved master prompt | Yes |
| 4 | 23/07 | Claude | Backend | Implement Phase 1 pipeline per master prompt | Service + controller + DI + fallback | Yes |
| 5 | 24/07 | Claude | Backend | Complete Phase 2 | Streaming, memory, embeddings, personalization | Yes |
| 6 | 24/07 | Claude | Docs | Draft the 4 AI-audit files per SKILL.md | These audit documents | Yes |

---

## 4. Detailed Prompts

### Prompt #1 — Feature ideation

```text
Đọc codebase và đề xuất cho tôi vài ý tưởng cho các chức năng mang tính thời đại
phù hợp với project này.
```

**Result:** AI summarized RoomHub (rental management: Admin/Owner/Tenant; existing AI moderation via Groq/Gemini, listings, invoices, messaging, reviews, subscriptions) and proposed modern features, noting that the existing LLM keys make AI features low-cost to add.

---

### Prompt #2 — Narrow to UX optimization

```text
Tôi cần các đề xuất mang tính thời đại nhất để tối ưu trải nghiệm của người dùng.
```

**Result:** AI returned a UX-focused, prioritized list (conversational search, streaming assistant, smart autofill, SignalR realtime, optimistic UI, PWA, one-tap payment, OCR meter reading, map search) with a recommended starting set. I chose the **AI conversational room-finder (RAG)**.

---

### Prompt #3 — Spec & master prompt (approval gate)

```text
OK trước mắt tôi cần bạn làm chức năng này: AI Chatbot tư vấn / tìm phòng bằng
ngôn ngữ tự nhiên (RAG). Hãy mô tả chi tiết và viết một master prompt về chức năng
này để tôi xem, thấy ok tôi duyệt rồi mới làm.
```

**Result:** AI produced a detailed description + a self-contained master prompt covering: goal, tech context bound to the real code (`GroqModerationService`, `PublicListingsController`), API contract, the 3-step pipeline (Extract → Retrieve → Generate), guardrails & fallback, file list, and phased scope. I reviewed and approved it (pasted it back verbatim) before any code was written.

**Approved master prompt (summary of the binding spec):**

```text
MASTER PROMPT — RoomHub AI Room-Finder Assistant (RAG)
- Goal: Vietnamese conversational room finder; hybrid RAG (NL -> structured filter
  -> DB retrieval -> grounded generation). MUST NOT fabricate room data.
- Tech: reuse Groq (llama-3.3-70b-versatile, json_object, temp 0.1) like
  GroqModerationService; retrieval reuses PublicListingsController conditions
  (!IsDeleted && HasListing && IsPublished && ModerationStatus==Approved).
- API: POST /api/assistant/search [AllowAnonymous] -> { reply, intent,
  appliedFilters, rooms[], suggestions[] }.
- Pipeline: (1) Extract intent+filter JSON; (2) Retrieve top 5 by ListingScore;
  (3) Generate grounded reply about ONLY the retrieved rooms.
- Guardrails: keyword fallback if no key/LLM error (never throw); validate message;
  log to SearchHistory for logged-in users; no data outside public-listing scope.
- Frontend: floating ChatAssistant widget, room cards -> /room/:id, suggestion chips.
- Phase 1 now: full non-streaming pipeline + widget.
- Phase 2 later: streaming, long conversation memory, semantic embeddings,
  personalization from SearchHistory.
```

---

### Prompt #4 — Implement Phase 1

```text
(Approval of the master prompt) → implement Phase 1 following it exactly.
```

**Result:** AI scaffolded the DTOs, `IRoomAssistantService`, `RoomAssistantService` (extract → retrieve → generate + keyword fallback + SearchHistory logging), `AssistantController` (`POST /api/assistant/search`), and registered the service in `DependencyInjection.cs`, grounded in the real query logic and Groq call pattern.

---

### Prompt #5 — Complete Phase 2

```text
Tiếp tục hoàn thiện phase 2.
```

**Result:** AI added the four Phase-2 items: SSE streaming endpoint + `SearchStreamAsync` (`meta → token → done`); `PreviousFilters` for multi-turn filter inheritance; `IEmbeddingService` + `GeminiEmbeddingService` (`text-embedding-004`) with `IMemoryCache`-cached cosine ranking as a retrieval fallback; and `BuildUserPreferenceHintAsync` reading `SearchHistory` for personalization. Frontend `assistantStream` + widget streaming consumption were added, with fallback to the non-streaming endpoint.

---

### Prompt #6 — Draft audit documents

```text
Đọc file SKILL.md sau đó tạo các file trong docs đúng với chức năng tôi đã làm.
Tôi là Do Thanh Tin.
```

**Result:** AI read `SKILL.md` and the existing `#29` templates, then drafted these four audit files under `docs/Do Thanh Tin/#41/`, describing only what was actually built. I reviewed them for accuracy before signing.

---

## 5. Commitment

I confirm the prompts above accurately reflect the prompts and context I utilized during the development of this task.

**Signature:** Do Thanh Tin
**Date:** 24/07/2026
