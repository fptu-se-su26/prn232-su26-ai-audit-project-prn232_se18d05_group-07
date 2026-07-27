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
| Start Date | 27/07/2026 |
| Completion Date | 27/07/2026 |

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

- Complete the contract feature: export a real PDF, and notify both parties before a contract expires.
- Do this **without** activating automatic contract status changes, which an earlier analysis showed would break existing behaviour in about twelve places.
- Write a regression test that proves the new background job never touches `Contract.Status`.

### Summary of AI Usage Goals

```text
I used Claude (Claude Code) to finish the contract lifecycle. This task was deliberately scoped as
"reminders only, no status changes": an earlier audit found that ContractStatus.Renewed and Expired
are read by ReviewRepository but never written, and that ContractStatus.Active is filtered in roughly
twelve places including chat access and service-request access. Writing Expired would silently
activate dormant code paths, so automatic expiry was pushed to its own issue.

The AI added QuestPDF for the contract document, a ContractReminderLog table with a unique index to
prevent duplicate reminders, a daily background job modelled on the existing DepositExpiryHostedService,
and three PDF endpoints. The most important artefact is a test named
SendExpiryReminders_NeverMutatesContractStatus, which will fail if anyone later adds status mutation
to this job.

The tests also caught a genuine bug in the AI's own code before it reached me: the milestone array was
ordered {30, 15, 7} and selected with FirstOrDefault(m => daysLeft <= m), which always returned 30. A
contract seven days from expiry was being logged as a 30-day reminder. Four of eleven tests failed and
exposed it.
```

---

## 4. Detailed Log of Each AI Use

### Session 1 — Scope and safety boundary

| Item | Content |
|---|---|
| Date | 27/07/2026 |
| Tool | Claude (Claude Code) |
| Purpose | Build contract PDF export and expiry reminders |

**Role:** Senior .NET + React engineer
**Context:** `ContractStatus` has `Renewed` and `Expired` values that are never written.
**Request:** Add PDF export and 30/15/7-day expiry reminders.
**Constraints:** Do **not** write `Contract.Status`; no changes to existing services or repositories where avoidable.
**Expected Output:** Working feature plus a test proving the constraint holds.

**Result:** The AI restated the boundary in three places — the interface XML doc, the service class comment, and the hosted service comment — so anyone reading the code later sees why the job only reads. It then implemented:

- `ContractReminderLog` entity with a **unique index on (ContractId, MilestoneDays)** so a milestone can only ever be sent once, even if two API instances run the job simultaneously.
- `ContractReminderService`, placed in Infrastructure with direct `ApplicationDbContext` access, following the existing `ViewingWorkflowService` precedent. This avoided adding a method to `IContractRepository`, whose existing methods are all owner-scoped and unsuitable for a global scan.
- `ContractExpiryReminderHostedService`, copied structurally from `DepositExpiryHostedService`, running once every 24 hours.

---

### Session 2 — PDF generation

| Item | Content |
|---|---|
| Date | 27/07/2026 |
| Tool | Claude (Claude Code) |
| Purpose | Produce a real contract document |

**Result:** Added **QuestPDF 2026.7.1** (Community licence) to `RoomHub.Infrastructure`. The document follows Vietnamese contract convention: national heading, numbered articles for room details, term, rent and deposit, service charges, and other terms, then a two-column signature block.

Two details the AI raised rather than guessing:

1. `Contract.SignaturePath` stores a **URL**, not bytes — `TenantRoomController` uploads the signature PNG through `IFileUploadService` and saves the returned URL. Embedding it in the PDF therefore needs an HTTP fetch, which can fail. The AI added a 5-second timeout and falls back to the text "(Đã ký điện tử)" so a network problem can never block the download.
2. Neither `owner/UnitDetail.tsx` nor `tenant/MyRoom.tsx` has a `ContractId` — `TenantRoomDto` does not carry one. Rather than modify that DTO and its mapping, the AI added two resolver endpoints (`my-active/pdf` and `by-room/{roomId}/pdf`) that look the contract up server-side. No existing file was changed.

---

### Session 3 — Tests found a real bug

| Item | Content |
|---|---|
| Date | 27/07/2026 |
| Tool | Claude (Claude Code) |
| Purpose | Prove the constraint and verify milestone logic |

**Result:** 11 tests added, using `Microsoft.EntityFrameworkCore.InMemory` (newly added to the test project, which previously had no `DbContext`-based tests).

The first run was **5 failed / 79 passed**. The cause was a genuine logic error in the AI's code:

```csharp
private static readonly int[] Milestones = { 30, 15, 7 };
var milestone = Milestones.FirstOrDefault(m => daysLeft <= m);   // always 30
```

For a contract 7 days from expiry, `7 <= 30` matches first, so every contract was logged as a 30-day reminder — and the 15-day and 7-day reminders would then never fire, because the log row already existed. The fix was to order the array ascending (`{ 7, 15, 30 }`) so the **tightest** milestone reached is chosen.

I consider this the most valuable moment in the task: the bug was subtle, would have looked fine in a demo, and only failed for contracts closer than 30 days. Writing a `[Theory]` across six day-counts is what exposed it.

**Final result:** **84 passed / 0 failed** (73 pre-existing plus 11 new).

---

### Session 4 — Frontend & commits

| Item | Content |
|---|---|
| Date | 27/07/2026 |
| Tool | Claude (Claude Code) |
| Purpose | Download buttons and concern-based commits |

**Result:** Added `services/contractDocuments.ts` (reads the filename from `Content-Disposition` when present) and a "Tải hợp đồng PDF" button on both the tenant's room page and the owner's unit page. The existing "Xem & in hợp đồng" print preview was left untouched — the new button sits beside it.

**Verification I performed:** backend build 0 errors; `tsc --noEmit` 0 errors; 84/84 tests pass; the generated migration creates only the new table and alters nothing existing.

---

## 5. Commitment

I confirm the prompts and logs above accurately reflect what was actually done for this task. I set the "reminders only, never write Status" boundary myself based on the earlier regression analysis, and I verified it holds by reading the migration (new table only) and by the dedicated regression test. I can explain why automatic contract expiry was deferred and what would need to be audited before enabling it.

**Student Name:** Do Thanh Tin
**Student ID:** DE180794
**Date:** 27/07/2026
