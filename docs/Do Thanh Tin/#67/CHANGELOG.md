# Changelog

## 1. Project Information

| Field | Value |
|---|---|
| Student ID | DE180794 |
| Student | Do Thanh Tin |
| Issue | #67 |
| Feature | Contract Lifecycle — PDF export & expiry reminders |
| Repository | https://github.com/fptu-se-su26/prn232-su26-ai-audit-project-prn232_se18d05_group-07 |
| Branch | `feature/de180794-contract-lifecycle` |
| Completion Date | 27/07/2026 |

---

## 2. Phase Overview

| Phase | Scope | Status |
|---|---|---|
| Phase 01 | Scope the safety boundary; add QuestPDF | Completed |
| Phase 02 | Domain — `ContractReminderLog` + migration | Completed |
| Phase 03 | Backend — contract PDF service | Completed |
| Phase 04 | Backend — reminder service & daily job | Completed |
| Phase 05 | Backend — endpoints & DI | Completed |
| Phase 06 | Frontend — download buttons | Completed |
| Phase 07 | Unit tests (found and fixed a real bug) | Completed |
| Phase 08 | Commits & audit documentation | Completed |

---

# [Phase 01] Safety Boundary & QuestPDF

**Date:** 27/07/2026
**Author:** Do Thanh Tin (DE180794)
**AI Support:** Claude — scoping

### Decisions
- **This task writes reminders only. It never writes `Contract.Status`.** An earlier audit found that `ContractStatus.Renewed` / `Expired` are read at `ReviewRepository.cs:83-85` but never written, and that `ContractStatus.Active` is filtered in roughly twelve places including `ChatAccessRepository` (chat permission) and `ServiceRequestRepository` (service-request permission). Writing `Expired` would activate dormant code and could revoke tenant permissions as a side effect.
- Automatic contract expiry and renewal are deferred to their own issue.

### Changes
- Created branch `feature/de180794-contract-lifecycle` from `main` (`e8417a8`).
- Added **QuestPDF 2026.7.1** (Community licence) to `RoomHub.Infrastructure`.

---

# [Phase 02] Domain — Reminder Log

**Date:** 27/07/2026
**Author:** Do Thanh Tin (DE180794)
**AI Support:** Claude — entity & EF configuration

### Changes
- Added `RoomHub.Domain/Entities/ContractReminderLog.cs` — `ContractId`, `MilestoneDays`, `SentAt`.
- Added `ContractReminderLogConfiguration` with a **unique index on (ContractId, MilestoneDays)**, which makes duplicate reminders impossible even if two API instances run the job at the same time.
- Registered `ContractReminderLogs` in `ApplicationDbContext` (one added line).
- Migration `AddContractReminderLog` — **creates one new table and alters nothing existing**.

---

# [Phase 03] Backend — Contract PDF

**Date:** 27/07/2026
**Author:** Do Thanh Tin (DE180794)
**AI Support:** Claude — QuestPDF document composition

### Changes
- Added `IContractPdfService` and `Infrastructure/Services/ContractPdfService.cs`.
- Document follows Vietnamese contract convention: national heading, contract number and date, both parties, then numbered articles — room details, term, rent and deposit, service charges, other terms — followed by a two-column signature block and a page footer.
- Authorisation is enforced in the service: only `contract.OwnerId` or `contract.TenantId` may generate the PDF; anyone else gets `UnauthorizedAccessException`.
- Three ways to identify the contract, because neither target page carries a `ContractId`:
  - `GenerateAsync(contractId, userId)` — canonical
  - `GenerateForTenantAsync(tenantId)` — resolves the tenant's active contract
  - `GenerateForRoomAsync(roomId, ownerId)` — resolves the room's active contract

### Notes
- `Contract.SignaturePath` stores a **URL** (uploaded via `IFileUploadService` in `TenantRoomController`), not bytes. The service fetches it with a **5-second timeout**; on any failure the PDF still generates, showing "(Đã ký điện tử)" instead of the image.
- The QuestPDF Community licence is set once, guarded by `Interlocked.Exchange`.

---

# [Phase 04] Backend — Reminder Service & Daily Job

**Date:** 27/07/2026
**Author:** Do Thanh Tin (DE180794)
**AI Support:** Claude — service & hosted service

### Changes
- Added `IContractReminderService` and `Infrastructure/Services/ContractReminderService.cs`.
  - Scans `Active`, non-deleted contracts whose `EndDate` falls within the next 30 days.
  - Selects the **tightest milestone reached** from `{ 7, 15, 30 }`.
  - Notifies **both** the owner and the tenant (owner only when the contract has no tenant account).
  - Writes a `ContractReminderLog` row per milestone; a `DbUpdateException` from the unique index is treated as "another instance already sent it", not an error.
  - **Reads `Contract` only — never writes `Status`.** This is stated in the interface doc, the class comment and the hosted service comment.
- Added `RoomHub.API/Services/ContractExpiryReminderHostedService.cs`, running every 24 hours, structurally identical to the existing `DepositExpiryHostedService`.
- Registered in `Program.cs` (one added line).

### Notes
- The service lives in Infrastructure with direct `ApplicationDbContext` access because every method on `IContractRepository` is owner-scoped and unsuitable for a global scan. This follows the existing `ViewingWorkflowService` precedent rather than adding a repository method.

---

# [Phase 05] Backend — Endpoints & DI

**Date:** 27/07/2026
**Author:** Do Thanh Tin (DE180794)

### Changes
- Added `RoomHub.API/Controllers/ContractDocumentsController.cs`:
  - `GET /api/contracts/{id}/pdf` — any authenticated party to that contract
  - `GET /api/contracts/my-active/pdf` — `[Authorize(Roles = "Tenant")]`
  - `GET /api/contracts/by-room/{roomId}/pdf` — `[Authorize(Roles = "PropertyOwner")]`
- Modified `RoomHub.Infrastructure/DependencyInjection.cs` — **two added lines**.

---

# [Phase 06] Frontend — Download Buttons

**Date:** 27/07/2026
**Author:** Do Thanh Tin (DE180794)

### Changes
- Added `RoomHub.Frontend/src/services/contractDocuments.ts` — reads the filename from `Content-Disposition` when the server provides one.
- Added a "Tải hợp đồng PDF" button to `pages/tenant/MyRoom.tsx` and `pages/owner/UnitDetail.tsx`, each with its own loading state.
- The existing "Xem & in hợp đồng" print preview was **left untouched**; the new button sits beside it.

---

# [Phase 07] Unit Tests — A Real Bug Found

**Date:** 27/07/2026
**Author:** Do Thanh Tin (DE180794)
**AI Support:** Claude — test design

### Changes
- Added `Microsoft.EntityFrameworkCore.InMemory` to the test project (it previously had no `DbContext`-based tests).
- Added `RoomHub.Application.Tests/ContractReminderServiceTests.cs` — 11 tests:

| # | Test | Guards |
|---|---|---|
| 1 | **`SendExpiryReminders_NeverMutatesContractStatus`** | **The core safety constraint** |
| 2–7 | `[Theory]` over 0/7/9/15/22/30 days left | Milestone selection |
| 8 | Contracts outside the 30-day window ignored | Scope |
| 9 | Non-`Active` and deleted contracts skipped | Scope |
| 10 | Running twice sends nothing the second time | Duplicate prevention |
| 11 | Later milestone still fires after an earlier one | Progressive reminders |
| 12 | Both parties notified, contract linked | Recipients |
| 13 | Contract without a tenant account notifies the owner only | Edge case |

### Bug found and fixed
The first run was **5 failed / 79 passed**. The milestone array was `{ 30, 15, 7 }` and selected with `FirstOrDefault(m => daysLeft <= m)`, which always matched 30 first. Every contract was logged as a 30-day reminder, and because the log row then existed, the 15-day and 7-day reminders would never have fired.

**Fix:** order the array ascending — `{ 7, 15, 30 }` — so the tightest milestone reached is selected. A comment now records why the order matters.

### Verification
- Backend build: **0 errors**.
- Frontend `tsc --noEmit`: **0 errors**.
- Test run: **84 passed / 0 failed** (73 pre-existing plus 11 new).
- `git diff` on pre-existing files: **86 insertions, 0 deletions**, of which 38 lines are the EF model snapshot regenerated by the migration tool.

---

# [Phase 08] Commits & Documentation

**Date:** 27/07/2026
**Author:** Do Thanh Tin (DE180794)

### Changes
- Split the work into concern-based commits (all `Refs #67`), with no `Co-Authored-By` lines per team convention.
- Added the 4 required AI-audit files under `docs/Do Thanh Tin/#67/`.

### Operations
- Run `dotnet ef database update` before using the feature — migration `AddContractReminderLog`.
- Restart the API so the new hosted service starts.

### Known limitation
- The PDF requests the **Arial** font family. On a Windows host this resolves; in a Linux container without that font, QuestPDF will fall back to a default face, which may render Vietnamese diacritics differently. Embedding a font file would remove this dependency.
