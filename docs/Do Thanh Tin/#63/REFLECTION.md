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
| Issue | #63 — Owner Reports |
| Date | 26/07/2026 |

---

## 2. What I Set Out to Do

I wanted to keep improving RoomHub, but I was worried about a specific thing: the project is now large enough that adding features can quietly break older ones. So instead of asking the AI "what should I build next", I asked it two questions in sequence — *what is unfinished*, and then *will finishing it break anything*.

The second question turned out to matter far more than the first.

---

## 3. The Most Useful Thing I Learned

**A field that is written but never read is dead. A field that is read but never written is a trap.**

The AI initially told me that `ContractStatus.Renewed` and `Expired` were "dead code". When I asked whether these changes would break existing logic, it re-checked and corrected itself: those values *are* read, at `ReviewRepository.cs:83-85`, to decide who is allowed to leave a review. They are simply never written, so every contract stays `Active` forever and that branch never executes.

That means adding an auto-expiry job — which sounds like a harmless improvement — would have silently activated dormant code and potentially revoked tenants' review rights, chat access (`ChatAccessRepository`) and service-request access (`ServiceRequestRepository`), because `ContractStatus.Active` is filtered in roughly twelve different places.

I would not have found this by reading the feature description. I found it only because I asked the regression question explicitly.

---

## 4. The Decision I Am Most Confident About

Splitting **reminders** from **status changes**.

Both the contract feature and the subscription feature had a "safe half" (read the data, send a notification) and a "risky half" (write a new status). Originally they were bundled. Separating them meant I could ship most of the user-visible value with almost no regression risk, and leave the risky half for an issue where I have time to audit all twelve filter sites properly.

I applied the same instinct when picking which of the seven features to do first: the read-only one.

---

## 5. Where the AI Was Genuinely Useful

- **Finding evidence, not opinions.** Every claim it made came with a file and line number I could check myself. When I checked, they were correct — including the two self-corrections.
- **Respecting a constraint under pressure.** Mid-implementation it discovered that EF lazy loading is disabled and `GetInvoicesByOwnerAsync` does not include `Contract.Tenant`, so tenant names would have been `null`. The easy fix would have been to edit the repository — which my own constraint forbade. Instead it joined against `GetContractsByOwnerAsync` by `ContractId`. I consider this the best decision it made in the whole task, because it preserved the "zero regression" property I had asked for rather than quietly relaxing it.
- **Reporting a deviation instead of hiding it.** I had specified that `App.tsx` should need one line. It needed four, because the app uses a hash-based page state machine rather than react-router. It told me this before writing the code rather than after.

---

## 6. Where I Had to Correct or Verify

- The AI first placed the `Sentiment` enum under the review feature. It actually belongs to `MaintenanceTicket`. I caught this when reading the summary table against the entity list.
- The initial claim that `Renewed`/`Expired` were "never used" was wrong, as described above. It corrected this only because I asked the follow-up question — which is a reminder that a confident answer is not the same as a verified one.
- The API was running and locking DLLs during the build. The AI worked around it by building to a temporary output folder instead of killing my process. I checked that this was a *copy* failure and not a *compile* failure before accepting the result.

---

## 7. What I Would Do Differently

- **Create the GitHub Issue first.** `gh` was not authenticated on my machine, so I used `#63` based on the most recent PR number (`#62`) rather than a confirmed issue. I should authenticate `gh` before starting so the issue number in commits and the docs folder is certain.
- **Ask the regression question earlier and by default.** It changed the entire plan. It should be the second question on every feature, not something I happened to think of.

---

## 8. Technical Takeaways

- Adding a value to an enum is cheap; *writing* a new value to a persisted status column is not — the cost is proportional to how many places filter on that column.
- A pure read-only feature is an unusually good first task on a mature codebase: it exercises the whole stack end to end while being nearly impossible to break anything with.
- Writing an isolation test (`Reports_AlwaysQueryWithSuppliedOwnerIdOnly`) is cheap and worth doing on any multi-tenant query path. It documents the security property in a way a comment cannot.
- When lazy loading is off, `Include` chains are effectively part of a repository's public contract. Reading them before designing a service saved me from a null-reference bug that would only have shown up at runtime with real data.

---

## 9. Self-Assessment

| Aspect | Assessment |
|---|---|
| Understood every line submitted | Yes — I can explain each report calculation and why no migration was needed |
| Verified rather than trusted | Yes — build, type-check, and the full 62-test suite |
| Regression risk | Very low — no existing service or repository modified, no schema change |
| Honest about AI involvement | Yes — AI wrote most of the code; the ordering decision, the constraints, and the verification were mine |

---

## 10. Commitment

I confirm this reflection accurately describes my own work and my own reasoning on Issue #63. The decision to defer the two risky enhancements, and the constraint that no existing service or repository be modified, were mine; the AI implemented within those boundaries and I verified the result.

**Student Name:** Do Thanh Tin
**Student ID:** DE180794
**Date:** 26/07/2026
