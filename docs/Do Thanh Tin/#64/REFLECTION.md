# Reflection

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
| Issue | #64 — Personalized Recommendations |
| Date | 26/07/2026 |

---

## 2. What I Set Out to Do

RoomHub had been saving `FavoriteRoom` and `SearchHistory` records for weeks and doing absolutely nothing with them. That is the cheapest kind of feature to build — the expensive part, collecting the data, was already done. I wanted to turn that dormant data into something the user can actually see.

---

## 3. The Decision That Defined This Task

The plan I approved earlier said to use **cosine similarity over Gemini embeddings**. That sounded impressive, and I would have gone along with it.

Before writing any code the AI checked the actual implementation and found two things:

1. Embeddings are **not stored in the database anywhere**.
2. `RoomAssistantService` keeps them in a 6-hour in-memory cache and re-fetches from Gemini in batches whenever the cache is cold.

So a "similar rooms" block on a **public page** — the most-visited page on the site — would have fired Gemini batch calls every time the server restarted or the cache expired. That is precisely the token-exhaustion problem I had raised earlier in this project. I would have shipped the exact thing I was trying to avoid.

The AI's argument for changing course was the part I found genuinely convincing: **"similar rooms" is not a text problem.** Two rooms are similar because of their district, price, size, type and amenities — all structured columns. Embeddings are for when someone types *"phòng yên tĩnh gần trường có ban công"*, and that use case already exists in the AI assistant, where it belongs.

Deterministic scoring gives comparable quality here for zero tokens, runs instantly, and — the part I care about for this course — **I can explain every number in it**.

---

## 4. What I Learned

**A plan approved in the abstract can be wrong once you read the code.** I approved "use embeddings" without knowing whether embeddings were persisted. That single unchecked assumption was the difference between a free feature and one that burns quota on every page load. Approving a plan is not the same as verifying it.

**Pick the cheapest tool that actually solves the problem.** Reaching for AI when arithmetic will do is not sophistication, it is waste. Being able to say *"we deliberately did not use AI here, and here is why"* is a stronger answer in an AI-audit course than using AI everywhere.

**Constraints force better designs.** Three times the "don't modify existing files" rule blocked the easy path, and twice the workaround was better than the original idea:

- `MapToSummary` being `private` forced a purpose-built DTO — which is how the `Reason` field ("Cùng khu vực Hải Châu") got invented. That badge is now the most useful thing on the card, and it would not exist if reuse had been easy.
- `PageSize` being clamped at 50 forced per-district querying, which is actually more targeted than one big unfiltered fetch.
- `SearchHistoryRepository` not including the building forced me to accept that viewed rooms contribute less signal than favourites — which matches reality anyway, since saving a room is a much stronger signal than glancing at it.

---

## 5. Design Details I Am Happy With

- **Weighted median instead of mean** for the price profile. If someone saved four rooms at 3 million and once viewed a 15-million penthouse out of curiosity, a mean would drag their entire profile upward. A median ignores the outlier. Test #5 locks this behaviour in.
- **The component renders `null` when empty.** A recommendation row that shows "Không có gợi ý" is worse than no row at all — it draws attention to a failure. Rendering nothing means a new user with no history simply sees the page they expected.
- **The API client swallows errors.** Recommendations are supplementary. If the endpoint is down, the home page must still work.
- **Test #8 (hidden/unapproved rooms never suggested).** Recommendation endpoints are a classic way to leak records that other endpoints correctly hide, because the visibility filter is easy to forget on a "helper" query. I wanted that written down as a test, not left as an assumption.

---

## 6. What I Would Do Differently

- **Persist embeddings if the assistant grows.** The current in-memory cache means every server restart re-pays the embedding cost for the AI assistant too. Adding a vector column would fix that for both features — but it needs a migration and a re-embedding strategy, so it belongs in its own issue.
- **Verify infrastructure assumptions when writing the plan, not when executing it.** The embedding discovery should have happened when I wrote the master prompt, not two features later.
- **Track a click-through signal.** Right now I have no way to know whether the recommendations are any good. Logging which suggested room a user opens would let me tune the weights with evidence instead of intuition.

---

## 7. Honest Limitations

- The weights (35/30/15/10/10) are reasoned, not measured. I have no data yet to prove they produce better recommendations than a different split. I chose defensible numbers and made them named constants so they are easy to change once real usage data exists.
- Recommendations cannot capture anything that is not a structured column — "quiet", "good landlord", "lots of light" are invisible to this model. That is an accepted trade-off, not an oversight.
- Viewed rooms contribute no district signal, because of the repository's `Include` set. Favourites cover this in practice, but a user who has viewed many rooms and saved none gets a weaker profile than they could.

---

## 8. Self-Assessment

| Aspect | Assessment |
|---|---|
| Understood every line submitted | Yes — I can justify each weight and each fallback path |
| Verified rather than trusted | Yes — build, type-check, and 71/71 tests |
| Regression risk | Very low — 13 added lines across 4 existing files, no deletions, no migration |
| Runtime cost | Zero AI tokens |
| Honest about AI involvement | Yes — the AI wrote the code and proposed the approach change; I approved the change and verified the result |

---

## 9. Commitment

I confirm this reflection accurately describes my own work and reasoning on Issue #64. The decision to abandon embeddings in favour of deterministic scoring was presented to me with evidence and approved by me, and I understand both what it buys and what it gives up.

**Student Name:** Do Thanh Tin
**Student ID:** DE180794
**Date:** 26/07/2026
