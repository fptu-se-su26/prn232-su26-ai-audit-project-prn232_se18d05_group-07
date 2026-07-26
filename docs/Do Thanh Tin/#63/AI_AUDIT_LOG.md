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

- Audit the current codebase to find which existing features are unfinished, and rank possible additions by how much they would break existing behaviour.
- Design a "zero-regression" plan: pick the safest enhancement first and define constraints that keep it additive.
- Build an owner-facing reporting feature (revenue / occupancy / debt) with Excel export.
- Write unit tests including a data-isolation test between property owners.
- Split the work into concern-based commits.

### Summary of AI Usage Goals

```text
I used Claude (Claude Code) to review RoomHub and identify unfinished features. The AI produced a
risk-ranked list of seven enhancements and flagged that two of them (auto-expiring contracts and a
subscription-downgrade job) would change behaviour in ~12 places that filter ContractStatus.Active,
and would create a second writer for ApplicationUser.CurrentPlan. Based on that, I chose the lowest
risk item first: an Owner Reports feature that is read-only.

The AI implemented the feature on top of three existing repository methods without modifying any
existing service or repository, and without a migration. It then wrote 9 unit tests, including one
that proves the service only ever queries with the ownerId passed in. I verified the plan, confirmed
the ordering decision, checked that the backend and frontend both compile, and confirmed the full
test suite (62 tests) still passes.
```

---

## 4. Detailed Log of Each AI Use

### Session 1 — Codebase audit & risk assessment

| Item | Content |
|---|---|
| Date | 26/07/2026 |
| Tool | Claude (Claude Code) |
| Purpose | Find unfinished features and assess regression risk |

**Role:** Software architect / code reviewer
**Context:** RoomHub has many features but several appear half-built.
**Request:** Propose additions that complete existing features, then tell me whether they break old logic.
**Constraints:** Must not damage existing behaviour.
**Expected Output:** A risk-ranked list with evidence from the code.

**Result:** The AI found that the operational loop is broken in three places (deposit → contract → utility reading → invoice) and produced a seven-item list. Critically, it corrected two of its own earlier claims after re-reading the code:

- `ContractStatus.Renewed` / `Expired` are **read** in `ReviewRepository.cs:83-85` (review eligibility) but never **written**. Turning on an auto-expiry job would wake that dormant branch and could also revoke tenant chat access (`ChatAccessRepository`) and service-request access (`ServiceRequestRepository`).
- `SubscriptionService.cs:52-56` already performs a lazy write of `CurrentPlan = Free`, so adding a background job would create a second writer for the same field.

I accepted the recommendation to defer both to a separate issue and to start with the read-only reporting feature.

---

### Session 2 — Feature prompt & file plan

| Item | Content |
|---|---|
| Date | 26/07/2026 |
| Tool | Claude (Claude Code) |
| Purpose | Agree the scope before any code was written |

**Result:** The AI wrote a feature prompt (see `PROMPTS.md`) with explicit constraints: do not modify existing services/repositories, no migration, touch only the DI registration and the frontend routing. It listed the files to be added before coding. I reviewed and approved this list.

One deviation was reported to me up front: `App.tsx` uses a hash-based `PageType` state machine rather than plain react-router, so it needed **4 added lines** (type union, hash handler, import, render branch) instead of the single line originally estimated. Still additive only.

---

### Session 3 — Implementation

| Item | Content |
|---|---|
| Date | 26/07/2026 |
| Tool | Claude (Claude Code) |
| Purpose | Build the backend, Excel export, and frontend |

**Result:**
- Added `OwnerReportDtos.cs`, `IOwnerReportService.cs`, `OwnerReportService.cs`, `OwnerReportExcelExporter.cs`, `OwnerReportsController.cs`.
- The service reuses three existing repository methods only: `GetBuildingsByOwnerAsync`, `GetInvoicesByOwnerAsync`, `GetContractsByOwnerAsync`.
- The AI checked whether EF lazy loading was enabled (it is **not**), and therefore noted that `Invoice.Contract.Tenant` would be `null` because `GetInvoicesByOwnerAsync` does not include it. Instead of modifying the repository, it joined the invoice list to the contract list by `ContractId` to resolve tenant names. This kept the "no existing file modified" constraint intact.
- Frontend: `services/reports.ts` and `pages/owner/Reports.tsx` (filter bar, four stat cards, three tabs, Excel download).

**Verification I performed:** backend build = 0 errors; frontend `tsc --noEmit` = 0 errors. The API process was running and locking DLLs, so the build was directed to a temporary output folder rather than stopping my running app.

---

### Session 4 — Tests

| Item | Content |
|---|---|
| Date | 26/07/2026 |
| Tool | Claude (Claude Code) |
| Purpose | Cover the calculations and the isolation guarantee |

**Result:** 9 tests added in `OwnerReportServiceTests.cs` using hand-written fakes (the project does not use Moq). Coverage includes: paid vs outstanding split, cancelled invoices excluded, `Pending` treated as not-yet-collected, date-range filtering with empty months preserved, occupancy rate with a divide-by-zero guard, deleted rooms skipped, debt limited to Unpaid/Overdue with correct overdue-day counts, building filtering, and a test asserting the service only ever calls repositories with the supplied `ownerId`.

**Result of run:** 62 passed / 0 failed — the 53 pre-existing tests were unaffected.

---

### Session 5 — Commits & documentation

| Item | Content |
|---|---|
| Date | 26/07/2026 |
| Tool | Claude (Claude Code) |
| Purpose | Split into concern-based commits and draft audit files |

**Result:** Work split into concern-based commits (all `Refs #63`), with no `Co-Authored-By` lines per the team convention. These four audit files were drafted by AI from the actual session history and then reviewed by me.

---

## 5. Commitment

I confirm the prompts and logs above accurately reflect what was actually done for this task. I chose the feature order after reviewing the AI's regression analysis, approved the file plan before coding began, and verified that both projects compile and that all 62 tests pass. I can explain each calculation in the report service and why the feature required no changes to existing services, repositories, or the database schema.

**Student Name:** Do Thanh Tin
**Student ID:** DE180794
**Date:** 26/07/2026
