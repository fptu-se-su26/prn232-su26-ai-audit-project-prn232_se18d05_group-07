# Changelog

## 1. Project Information

| Field | Value |
|---|---|
| Student ID | DE180794 |
| Student | Do Thanh Tin |
| Issue | #41 |
| Feature | AI-Powered Chatbox — Room-Finder Assistant (RAG) |
| Repository | https://github.com/fptu-se-su26/prn232-su26-ai-audit-project-prn232_se18d05_group-07 |
| Completion Date | 24/07/2026 |

---

## 2. Phase Overview

| Phase | Scope | Status |
|---|---|---|
| Phase 01 | Feature design & master prompt approval | Completed |
| Phase 02 | Backend RAG pipeline (MVP) & API endpoint | Completed |
| Phase 03 | Frontend chat widget & integration | Completed |
| Phase 04 | Phase 2 — streaming, memory, semantic search, personalization | Completed |
| Phase 05 | Audit documentation | Completed |

---

# [Phase 01] Feature Design & Master Prompt

**Date:** 22/07/2026
**Author:** Do Thanh Tin (DE180794)
**AI Support:** Claude — codebase analysis & spec drafting

### Changes
- Reviewed the RoomHub codebase and shortlisted modern, UX-oriented features.
- Selected the **AI conversational room-finder (hybrid RAG)** as the first feature.
- Drafted a detailed feature description and a **master prompt** (goal, API contract, 3-step pipeline, guardrails, file list, phased scope).
- Reviewed and **approved the master prompt** before any implementation.

---

# [Phase 02] Backend RAG Pipeline (MVP)

**Date:** 23/07/2026
**Author:** Do Thanh Tin (DE180794)
**AI Support:** Claude — pipeline implementation

### Changes
- Added DTOs in `RoomHub.Application/Common/DTOs/Assistant/AssistantDtos.cs`: `ChatTurn`, `AssistantRequest`, `ExtractedFilter`, `AssistantRoom`, `AssistantResponse`.
- Added interface `IRoomAssistantService` in `RoomHub.Application/Common/Interfaces/`.
- Implemented `RoomHub.Infrastructure/Services/RoomAssistantService.cs` with the hybrid RAG pipeline:
  - **Extract:** one Groq call (`llama-3.3-70b-versatile`, `response_format=json_object`, `temperature=0.1`) turning the message into a structured `ExtractedFilter` with an `intent` classification.
  - **Retrieve:** EF Core query reusing the public-listing conditions (`!IsDeleted && HasListing && IsPublished && ModerationStatus == Approved`), top 5 by `ListingScore`.
  - **Generate:** a second, grounded Groq call that may only reference the retrieved rooms, returning `reply` + `suggestions`.
- Implemented `AssistantController` with `POST /api/assistant/search` marked `[AllowAnonymous]`, plus input validation (non-empty, max 500 chars).
- Registered `IRoomAssistantService` via `AddHttpClient` in `RoomHub.Infrastructure/DependencyInjection.cs`.

### Guardrails
- Reuses the existing Groq call pattern from `GroqModerationService`; no new provider added.
- **Keyword fallback:** when the Groq key is missing or a call fails, the service degrades to a raw keyword filter and a deterministic reply instead of throwing.
- Non-blocking logging of each query into `SearchHistory` for authenticated users (no DB migration required).

---

# [Phase 03] Frontend Chat Widget

**Date:** 24/07/2026
**Author:** Do Thanh Tin (DE180794)
**AI Support:** Claude — React widget & API wiring

### Changes
- Added `RoomHub.Frontend/src/components/ChatAssistant.tsx`: a floating chat button + panel with a greeting, suggestion chips, message list, and clickable room cards navigating to `/room/:id`.
- Extended `RoomHub.Frontend/src/services/api.ts` with `assistantSearch` (POST `/assistant/search`) and supporting TypeScript interfaces.
- Mounted `<ChatAssistant />` on all non-auth pages in `RoomHub.Frontend/src/App.tsx`.

---

# [Phase 04] Phase 2 — Streaming, Memory, Semantic Search, Personalization

**Date:** 24/07/2026
**Author:** Do Thanh Tin (DE180794)
**AI Support:** Claude — Phase 2 enhancements

### Changes
- **Streaming (SSE):**
  - Added `AssistantStreamEvent` (`meta | token | done | error`) to the DTOs.
  - Added `SearchStreamAsync` to `IRoomAssistantService` / `RoomAssistantService` emitting `meta → token → done`.
  - Added `POST /api/assistant/stream` in `AssistantController` writing `text/event-stream` and flushing each chunk (`X-Accel-Buffering: no`).
  - Frontend `assistantStream` consumes the SSE stream via `fetch` + `ReadableStream`, updating the reply token-by-token, with fallback to `assistantSearch`.
- **Conversation memory:** added `AssistantRequest.PreviousFilters`; the extract prompt inherits the previous turn's criteria for refinements (e.g. "rẻ hơn", "gần hơn").
- **Semantic embeddings:**
  - Added `IEmbeddingService` and `RoomHub.Infrastructure/Services/GeminiEmbeddingService.cs` (`text-embedding-004`, single + batch endpoints).
  - Retrieval now tries **strict → semantic → relaxed**: when strict filtering returns nothing, it ranks candidates by cosine similarity, caching room vectors in `IMemoryCache` (already registered).
  - Registered `IEmbeddingService` via `AddHttpClient` in `DependencyInjection.cs`.
- **Personalization:** `BuildUserPreferenceHintAsync` reads recent `SearchHistory` rows for logged-in users to bias defaults and suggestions.

### Notes
- The semantic layer degrades safely: if the Gemini key is missing or any call fails, embeddings return `null` and retrieval simply skips the semantic branch.

---

# [Phase 05] Documentation

**Date:** 24/07/2026
**Author:** Do Thanh Tin (DE180794)
**AI Support:** Claude — documentation drafting

### Changes
- Added the 4 required AI-audit files under `docs/Do Thanh Tin/#41/`: `AI_AUDIT_LOG.md`, `PROMPTS.md`, `CHANGELOG.md`, `REFLECTION.md`.
- Documents describe only what was actually implemented and were reviewed before signing.
