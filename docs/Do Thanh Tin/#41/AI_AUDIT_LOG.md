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
| Start Date | 22/07/2026 |
| Completion Date | 24/07/2026 |

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

- Explore the existing RoomHub codebase and brainstorm modern, UX-oriented feature ideas suitable for the platform.
- Design an AI room-finder chatbot using a **hybrid RAG** architecture (Natural Language → structured filter → database retrieval → grounded generation) that reuses the project's existing LLM infrastructure (Groq) instead of introducing new dependencies.
- Draft and review a **master prompt / specification** before implementation, so the scope was approved first.
- Implement the backend service pipeline (`RoomAssistantService`) with graceful fallback when the LLM key is missing.
- Add Phase 2 enhancements: **token streaming (SSE)**, **multi-turn conversation memory** (filter inheritance), **semantic embeddings** (Gemini `text-embedding-004`), and **personalization** based on `SearchHistory`.
- Build the React floating chat widget and wire it into the public layout.

### Summary of AI Usage Goals

```text
I used Claude (Claude Code) to read the RoomHub codebase, propose trend-forward UX features,
then design and implement an AI room-finder assistant based on a hybrid RAG pipeline. The AI
helped draft the architecture and master prompt for my approval, scaffold the backend service
(extract -> retrieve -> generate) reusing the existing Groq call pattern and the public listing
query logic, add streaming/semantic/personalization for Phase 2, and build the React chat widget.
I reviewed every design decision, approved the spec before coding, and verified the guardrails
(no fabricated listings, safe fallback without an API key).
```

---

## 4. Detailed Log of Each AI Use

### Session 1 — Codebase review & feature ideation

| Item | Content |
|---|---|
| Date | 22/07/2026 |
| Tool | Claude (Claude Code) |
| Purpose | Understand the project and propose modern, UX-focused features |

**Role:** Product/Tech advisor
**Context:** RoomHub monorepo — .NET Clean Architecture backend (API/Application/Domain/Infrastructure) + React 19/Vite/Tailwind frontend, already integrating Groq & Gemini for content moderation.
**Request:** Read the codebase and suggest trend-forward features; then narrow to those that best optimize user experience.
**Constraints:** Must fit the existing stack and reuse the LLM infrastructure already present.
**Expected Output:** A shortlist of prioritized ideas.

**Result:** AI mapped the domain (roles Admin/Owner/Tenant; entities Room, Contract, Invoice, Message, Review, SearchHistory...) and proposed UX-oriented ideas. I selected the **AI conversational room-finder (RAG)** as the first feature because it reuses the existing Groq/Gemini integration and removes friction from the multi-field search form.

---

### Session 2 — Feature specification & master prompt (approval gate)

| Item | Content |
|---|---|
| Date | 22/07/2026 |
| Tool | Claude (Claude Code) |
| Purpose | Produce a reviewable spec before writing any code |

**Role:** Solution Architect
**Context:** Rooms are structured data in SQL Server; the project has `PublicListingsController` filtering logic and a `GroqModerationService` LLM call pattern.
**Request:** Describe the feature in detail and write a master prompt I can approve before implementation.
**Constraints:** Grounded in the real code; no fabricated data; safe fallback; no DB migration for the MVP (reuse `SearchHistory`).
**Expected Output:** A detailed description + a self-contained master prompt (goal, API contract, 3-step pipeline, guardrails, file list, scope).

**Result:** AI produced a **hybrid RAG** design — Extract (LLM → JSON filter) → Retrieve (EF Core, same conditions as `PublicListingsController`) → Generate (LLM grounded on retrieved rooms only). I reviewed and **approved the master prompt**, then authorized implementation.

---

### Session 3 — Backend implementation (Phase 1 MVP)

| Item | Content |
|---|---|
| Date | 23/07/2026 |
| Tool | Claude (Claude Code) |
| Purpose | Implement the RAG pipeline, controller, and DI wiring |

**Result:** Added `Application/Common/DTOs/Assistant/*`, `IRoomAssistantService`, `Infrastructure/Services/RoomAssistantService.cs` (extract → retrieve → generate), and `AssistantController` exposing `POST /api/assistant/search` as `[AllowAnonymous]`. The Groq call reuses the pattern from `GroqModerationService` (model `llama-3.3-70b-versatile`, `response_format=json_object`, `temperature=0.1`). Implemented a keyword fallback so the endpoint still works when the Groq key is absent, plus non-blocking logging into `SearchHistory`. Registered the service in `DependencyInjection.cs`.

---

### Session 4 — Phase 2 enhancements

| Item | Content |
|---|---|
| Date | 24/07/2026 |
| Tool | Claude (Claude Code) |
| Purpose | Streaming, conversation memory, semantic search, personalization |

**Result:**
- **Streaming (SSE):** added `POST /api/assistant/stream` and `SearchStreamAsync` emitting `meta → token → done` events; the controller writes `text/event-stream` and flushes each chunk.
- **Conversation memory:** `AssistantRequest.PreviousFilters` lets the extract step inherit the previous turn's criteria for refinements ("cheaper", "closer").
- **Semantic embeddings:** new `IEmbeddingService` + `GeminiEmbeddingService` (`text-embedding-004`); the retrieve step falls back to cosine-similarity ranking (cached in `IMemoryCache`) when strict filtering returns nothing.
- **Personalization:** `BuildUserPreferenceHintAsync` reads recent `SearchHistory` rows to bias suggestions/defaults for logged-in users.

---

### Session 5 — Frontend widget

| Item | Content |
|---|---|
| Date | 24/07/2026 |
| Tool | Claude (Claude Code) |
| Purpose | Floating chat UI + API integration |

**Result:** Added `components/ChatAssistant.tsx` (floating button, chat panel, suggestion chips, room cards linking to `/room/:id`, streaming consumption with fallback to the non-streaming endpoint). Extended `services/api.ts` with `assistantSearch` and `assistantStream`, and mounted `<ChatAssistant />` on non-auth pages in `App.tsx`.

---

## 5. Commitment

I confirm the prompts and logs above accurately reflect what was actually done for this task. I reviewed and approved the master prompt before implementation, and verified the guardrails and fallback behavior myself.

**Student Name:** Do Thanh Tin
**Student ID:** DE180794
**Date:** 24/07/2026
