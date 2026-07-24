# AI Learning Reflection

## 1. General Information

| Field | Value |
|---|---|
| Student ID | DE180794 |
| Student | Do Thanh Tin |
| Issue | #41 |
| Feature | AI-Powered Chatbox — Room-Finder Assistant (RAG) |
| Completion Date | 24/07/2026 |

---

## 2. Summary of AI Usage

```text
For the AI-powered chatbox, I used Claude (Claude Code) to review the RoomHub codebase, brainstorm
UX-focused features, and design a hybrid RAG room-finder. Crucially, I required the AI to write a
master prompt / specification first, which I read and approved before any code was written. The AI
then implemented the pipeline (Extract -> Retrieve -> Generate) by reusing the project's existing
Groq call pattern and the public-listing query logic, so the new feature stayed consistent with the
codebase. In Phase 2 the AI added SSE streaming, multi-turn memory, Gemini semantic embeddings, and
personalization from SearchHistory. I reviewed each step, checked the guardrails, and confirmed the
feature degrades safely when API keys are absent.
```

---

## 3. Where AI Helped Most

- **Grounded RAG design:** Recognizing that rooms are *structured* data, the AI proposed a hybrid pipeline (NL → structured filter → DB retrieval → grounded generation) rather than naive vector RAG, which is more accurate for rental data and reuses the existing filter logic.
- **Consistency with the codebase:** Reused the `GroqModerationService` call pattern and the `PublicListingsController` query conditions instead of inventing new patterns.
- **Safe degradation:** Designed keyword fallback (no LLM key) and null-returning embeddings so the endpoint never crashes when Groq/Gemini are unavailable.
- **Phase 2 without a migration:** Implemented semantic search and personalization by caching embeddings in the already-registered `IMemoryCache` and reusing the `SearchHistory` table — no schema change.
- **Spec-before-code discipline:** Drafting a master prompt for my approval kept scope explicit and prevented over-engineering.

---

## 4. What I Verified Myself

- **Approval gate:** I read the master prompt and only authorized coding after it matched my intent.
- **Grounding guardrail:** Confirmed the generate-step prompt forbids inventing rooms/prices/phone numbers and that replies reference only retrieved listings.
- **Retrieval correctness:** Checked that the retrieval query uses the same public-listing conditions (`!IsDeleted && HasListing && IsPublished && ModerationStatus == Approved`) so hidden/unapproved rooms never surface.
- **Fallback behavior:** Reasoned through the no-key path — the service returns a keyword result and a deterministic reply instead of throwing.
- **Streaming path:** Verified the SSE order `meta → token → done` and that the frontend falls back to the non-streaming endpoint if the stream fails.
- **Route accuracy:** Corrected the room-detail link to the actual route `/room/:id` (not `/rooms/:id`).

---

## 5. Lessons on Transparent AI Usage

- **Approve the spec first:** For a multi-part AI feature, reviewing a written specification before implementation gives real control over scope and quality.
- **Reuse beats reinvention:** Matching existing patterns (Groq calls, listing queries, memory cache, SearchHistory) made the AI feature safer and easier to defend than introducing new infrastructure.
- **Design for failure:** LLM features must degrade gracefully; verifying the no-key / API-error paths is as important as the happy path.
- **Documenting over co-authoring:** Recording AI usage in these audit files keeps the git history clean per the team's `SKILL.md` convention.

---

## 6. Commitment

I have reviewed and understood every part of this feature and these documents, and they reflect what was actually done.

**Signature:** [Tin — Do Thanh Tin]

**Date:** 24/07/2026
