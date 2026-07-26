# Changelog

## 1. Project Information

| Field | Value |
|---|---|
| Student ID | DE180794 |
| Student | Do Thanh Tin |
| Issue | #63 |
| Feature | Owner Reports — revenue, occupancy & debt with Excel export |
| Repository | https://github.com/fptu-se-su26/prn232-su26-ai-audit-project-prn232_se18d05_group-07 |
| Branch | `feature/de180794-owner-reports` |
| Completion Date | 26/07/2026 |

---

## 2. Phase Overview

| Phase | Scope | Status |
|---|---|---|
| Phase 01 | Codebase audit & regression-risk assessment | Completed |
| Phase 02 | Backend — DTOs, report service | Completed |
| Phase 03 | Backend — Excel export (EPPlus) | Completed |
| Phase 04 | Backend — controller & DI registration | Completed |
| Phase 05 | Frontend — service, page, routing | Completed |
| Phase 06 | Unit tests | Completed |
| Phase 07 | Commits & audit documentation | Completed |

---

# [Phase 01] Codebase Audit & Risk Assessment

**Date:** 26/07/2026
**Author:** Do Thanh Tin (DE180794)
**AI Support:** Claude — code analysis & risk ranking

### Findings
- Identified that the rental operating loop is broken in three places: deposit → contract, contract → utility readings, and utility readings → invoice generation.
- Ranked seven possible enhancements by regression risk. Two were deferred to a separate issue:
  - **Auto-expiring contracts** — `ContractStatus.Renewed` / `Expired` are read at `ReviewRepository.cs:83-85` but never written; writing them would activate a dormant branch and affect ~12 places that filter `ContractStatus.Active`, including tenant chat access and service-request access.
  - **Subscription downgrade job** — `SubscriptionService.cs:52-56` already writes `CurrentPlan = Free` lazily; a job would be a second writer for the same field.
- Selected the read-only Owner Reports feature as the safest starting point.

### Changes
- Created branch `feature/de180794-owner-reports` from `main` (`a82e063`).

---

# [Phase 02] Backend — DTOs & Report Service

**Date:** 26/07/2026
**Author:** Do Thanh Tin (DE180794)
**AI Support:** Claude — DTO design & aggregation logic

### Changes
- Added `RoomHub.Application/Common/DTOs/Reports/OwnerReportDtos.cs` — `OwnerReportFilter`, plus row/summary DTOs for the three reports.
- Added `RoomHub.Application/Common/Interfaces/IOwnerReportService.cs`.
- Added `RoomHub.Application/Services/OwnerReportService.cs`:
  - **Revenue** — grouped by month; `Cancelled` invoices excluded entirely; `Paid` counts as collected; `Unpaid` / `Overdue` / `Pending` count as outstanding. Months with no invoices are still emitted as zero rows so the series has no gaps.
  - **Occupancy** — per building; rate = (occupied + deposited) / total, with a divide-by-zero guard; soft-deleted rooms skipped.
  - **Debt** — `Unpaid` / `Overdue` only, sorted overdue-first, with `DaysOverdue` computed against today.
  - Invalid or missing date ranges fall back to the last 6 months, and a reversed range is swapped rather than rejected.

### Notes
- **No existing service or repository was modified.** The service consumes only `GetBuildingsByOwnerAsync`, `GetInvoicesByOwnerAsync` and `GetContractsByOwnerAsync`.
- EF lazy loading is **not** enabled in this project, and `GetInvoicesByOwnerAsync` does not `Include` `Contract.Tenant`. Rather than change the repository, tenant names are resolved by joining the invoice list to `GetContractsByOwnerAsync` (which does include `Tenant`) on `ContractId`.
- **No database migration required** — the feature is read-only.

---

# [Phase 03] Backend — Excel Export

**Date:** 26/07/2026
**Author:** Do Thanh Tin (DE180794)
**AI Support:** Claude — EPPlus workbook builder

### Changes
- Added `RoomHub.Application/Services/OwnerReportExcelExporter.cs` — builds a single workbook with three sheets (Doanh thu / Ti le lap day / Cong no).
- Reused the existing EPPlus conventions from `InvoiceService.GenerateExcelBytesAsync`, including `ExcelPackage.License.SetNonCommercialOrganization("RoomHub")`, Arial 11 base font, LightSkyBlue header fill, and thousands-separated money formatting.
- Overdue day counts are highlighted in red; each sheet has a bold, shaded total row.

---

# [Phase 04] Backend — Controller & DI

**Date:** 26/07/2026
**Author:** Do Thanh Tin (DE180794)
**AI Support:** Claude — controller scaffolding

### Changes
- Added `RoomHub.API/Controllers/OwnerReportsController.cs` with four endpoints, all `[Authorize(Roles = "PropertyOwner")]`:
  - `GET /api/owner/reports/revenue`
  - `GET /api/owner/reports/occupancy`
  - `GET /api/owner/reports/debt`
  - `GET /api/owner/reports/export` → `.xlsx`
- `ownerId` is always taken from the `NameIdentifier` claim, never from a query parameter.
- Modified `RoomHub.Infrastructure/DependencyInjection.cs` — **one added line** registering `IOwnerReportService`.

---

# [Phase 05] Frontend — Reports Page

**Date:** 26/07/2026
**Author:** Do Thanh Tin (DE180794)
**AI Support:** Claude — React page & API client

### Changes
- Added `RoomHub.Frontend/src/services/reports.ts` — typed client for the four endpoints; the export call uses `responseType: 'blob'` and still routes through the shared `api` instance so the JWT interceptor applies.
- Added `RoomHub.Frontend/src/pages/owner/Reports.tsx`:
  - Filter bar: from-month/year, to-month/year, building selector, refresh.
  - Four stat cards: collected, outstanding, occupancy rate, overdue debt.
  - Three tabs with tables; occupancy rows include an inline progress bar.
  - "Tải Excel" button downloading the three-sheet workbook.
  - Defaults to the last 6 months.
- Modified `RoomHub.Frontend/src/App.tsx` — **4 added lines**: import, `'owner-reports'` in the `PageType` union, hash handler for `#/owner/reports`, and the render branch. (`App.tsx` uses a hash-based page state machine rather than react-router paths, which is why this needed 4 lines rather than 1.)
- Modified `RoomHub.Frontend/src/components/owner/OwnerLayout.tsx` — **one added line** for the "Báo cáo & Thống kê" menu item.

---

# [Phase 06] Unit Tests

**Date:** 26/07/2026
**Author:** Do Thanh Tin (DE180794)
**AI Support:** Claude — test design

### Changes
- Added `RoomHub.Application.Tests/OwnerReportServiceTests.cs` — 9 tests using hand-written fakes (the project does not use Moq):

| # | Test | Guards |
|---|---|---|
| 1 | Collected vs outstanding split; `Cancelled` excluded | Revenue correctness |
| 2 | `Pending` counted as not-yet-collected | Explicit status decision |
| 3 | Out-of-range invoices excluded; empty months kept | Date filtering |
| 4 | Occupancy rate; building with no rooms | Divide-by-zero |
| 5 | Soft-deleted rooms skipped | Data hygiene |
| 6 | Debt limited to Unpaid/Overdue; overdue days | Debt correctness |
| 7 | Tenant name resolved via contract lookup | The lazy-loading workaround |
| 8 | `buildingId` filter | Filtering |
| 9 | Repositories only ever called with the supplied `ownerId` | **Owner data isolation** |

### Verification
- Backend build: **0 errors**.
- Frontend `tsc --noEmit`: **0 errors**.
- Test run: **62 passed / 0 failed** — the 53 pre-existing tests were unaffected.

---

# [Phase 07] Commits & Documentation

**Date:** 26/07/2026
**Author:** Do Thanh Tin (DE180794)
**AI Support:** Claude — commit split & documentation drafting

### Changes
- Split the work into concern-based commits (all `Refs #63`), with no `Co-Authored-By` lines per team convention.
- Added the 4 required AI-audit files under `docs/Do Thanh Tin/#63/`.

### Notes
- The API process was running during development and locked the output DLLs; builds were directed to a temporary output folder rather than terminating it.
- `bin/`, `obj/` and `node_modules/` were not committed.
