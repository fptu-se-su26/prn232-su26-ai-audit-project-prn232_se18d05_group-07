# CHANGELOG — Nguyễn Hữu Triết (DE180336)

## General Information

| Item | Content |
|---|---|
| Student | Nguyễn Hữu Triết — DE180336 |
| Issue/Task | #3 — Digital signature + electronic contract/invoice (print-to-PDF) |
| Branch | `feature/de180336-esign-edoc` (off latest `origin/main`) |

---

> **Principle:** Only record what was actually completed. Each entry needs a date, content, and evidence.

---

## Phase 01 — Scope & Branch Hygiene

### Checklist
- [x] Pulled the latest `main`
- [x] Compared against teammate (DE180303) work already merged
- [x] Scoped the push to the non-overlapping features only

### Log

| Date | Content | AI assisted | Evidence |
|---|---|---|---|
| 2026-06-15 | Pulled `main` (16 new commits). Found DE180303 already merged a **subscription** system + a **tenant-invoices** API that overlap my Stripe work | Yes | `SubscriptionController.cs`, `TenantInvoicesController.cs` already on main |
| 2026-06-15 | Decided to push only the two **non-overlapping** features (digital signature + e-documents); kept the Stripe subscription/invoice work local | Yes | Branch created off `origin/main` |

---

## Phase 02 — Implementation

### Checklist
- [x] Digital signature (canvas + endpoint)
- [x] Electronic contract & invoice (print-to-PDF)
- [x] Committed following the convention `[DE180336] feat: ...`

### Log

| Date | Content | AI assisted | Evidence |
|---|---|---|---|
| 2026-06-15 | `SignaturePad` canvas component (mouse + touch, DPR scaling, clear) | Yes | `src/components/SignaturePad.tsx` |
| 2026-06-15 | `POST /api/tenant/room/sign` → upload (Cloudinary / local `/uploads` fallback) → `Contract.SignaturePath`; `SignContractAsync`; `SignaturePath`/`Terms` on `TenantRoomDto` | Yes | `TenantRoomController.cs`, `ContractService.cs` |
| 2026-06-15 | Signature card on the tenant *My Room* page (sign / view) | Yes | `src/pages/tenant/MyRoom.tsx` |
| 2026-06-15 | Global `@media print` CSS + `PrintModal` + `ContractDocument` (A4) embedding the signature; owner invoice A4 sheet marked `.print-root` | Yes | `index.css`, `documents/PrintModal.tsx`, `documents/ContractDocument.tsx`, `owner/InvoiceDetail.tsx` |
| 2026-06-15 | Professional VN contract layout + **system auto e-signature for Bên A (chủ trọ)** | Yes (student-directed) | `documents/ContractDocument.tsx` |

---

## Phase 03 — Testing & Bug Fixing

### Bug Tracker

| # | Bug description | Root cause | Fix | Status |
|---|---|---|---|---|
| 1 | Local DB diverged from `main`'s migrations | Branch was based on an older main | Dropped & recreated DB via `dotnet ef database update` matching `main` | Fixed |
| 2 | Signature test would upload to a shared Cloudinary | Real Cloudinary config present | Forced local `/uploads` fallback via config override | Fixed |
| 3 | Runtime upload artifacts could be committed | `wwwroot/uploads` not ignored | Added `**/wwwroot/uploads/` to `.gitignore` | Fixed |

### Test Evidence

| Test | Method | Result |
|---|---|---|
| Backend compiles on new main | `dotnet build` | 0 Errors |
| Frontend type-checks on new main | `tsc -b` | 0 Errors |
| Sign contract | `POST /api/tenant/room/sign` then re-GET | `SignaturePath` persisted |
| Reject empty signature | `POST .../sign` empty | HTTP 400 |
| Contract data | `GET /api/tenant/room` | returns `terms` + `signaturePath` |
| Clean integration | `git cherry-pick` ×2 onto `origin/main` | no conflicts |

---

## Phase 04 — Summary

### Completed features
- [x] Mouse-drawn digital signature on the rental contract
- [x] Electronic contract (A4, embeds signature, system auto-signs for the landlord) — print-to-PDF
- [x] Owner invoice prints cleanly (only the A4 sheet)

### Incomplete / out of scope (intentionally not pushed)
- Stripe-based subscription & tenant invoice payment: kept local because teammate DE180303's equivalent is already merged to `main`; pushing would create duplicate/conflicting systems. To be reconciled with the team.

### Overall AI assistance (%)

| Category | % AI | % Self |
|---|---|---|
| Code | 70 | 30 |
| Documentation | 60 | 40 |
| Debug | 50 | 50 |

---

## Confirmation

I confirm that this changelog accurately reflects the actual work performed.

**Signature:** Nguyễn Hữu Triết — DE180336
