# AI AUDIT LOG — Nguyễn Hữu Triết (DE180336)

## 1. General Information

| Item | Content |
|---|---|
| Course | PRN232 |
| Class | SE18D05 |
| Semester | SU26 |
| Group | 07 |
| Student | Nguyễn Hữu Triết |
| Student ID | DE180336 |
| Issue/Task | #3 — Digital signature for rental contracts + electronic contract/invoice (print-to-PDF) |
| Date | 2026-06-15 |

---

## 2. AI Tools Used

- [ ] ChatGPT (OpenAI)
- [ ] Gemini (Google)
- [x] Claude (Anthropic) — used through Claude Code (CLI agent)
- [ ] GitHub Copilot
- [ ] Cursor
- [ ] Microsoft Copilot
- [ ] Other: ___

---

## 3. Purpose of AI Use

- [x] Requirement analysis (scope vs teammate's already-merged work)
- [x] Code generation (C# Web API + React/TypeScript)
- [x] Debugging / fixing (clean build + type-check)
- [ ] Code optimization
- [x] Documentation writing
- [ ] Database design
- [x] Other: HTML5 canvas signature, CSS print-to-PDF, git branch hygiene (clean cherry-pick onto current main)

---

## 4. Detailed Log of Each AI Use

### Session 1 — Mouse-drawn digital signature

| Item | Content |
|---|---|
| Date | 2026-06-15 |
| Tool | Claude (Claude Code) |
| Original prompt | "Implement a mouse-drawn digital signature: a reusable canvas component; the tenant signs their rental contract; save the image and show it back." |
| Response summary | AI built a reusable `SignaturePad` (HTML5 canvas, pointer events for mouse + touch, devicePixelRatio scaling, clear). Backend: `POST /api/tenant/room/sign` accepts a base64 PNG, uploads to Cloudinary (or a local `/uploads` fallback when Cloudinary is not configured) and stores the URL in `Contract.SignaturePath`; added `SignContractAsync` to the contract service and `SignaturePath` to the tenant-room DTO. Wired a "Chữ ký điện tử" card into the tenant *My Room* page. |
| What was applied | `SignaturePad.tsx`; `SignContractAsync` (interface + service); the sign endpoint + Cloudinary/local upload; `SignaturePath` on `TenantRoomDto`; the My Room signature card. |
| My own edits | Required input validation (PNG size/format), kept the upload out of the Application layer (done in the API controller like the existing image upload), and gitignored `wwwroot/uploads` so runtime artifacts are never committed. |
| Evidence (commit/screenshot) | `POST /tenant/room/sign` → 200, `SignaturePath` persisted; empty signature → 400. |
| Personal reflection | Learned the canvas pointer-event flow and why an Identity/IO concern (file upload) belongs in the API/Infrastructure layer, not in Application. |

### Session 2 — Electronic contract & invoice (print-to-PDF)

| Item | Content |
|---|---|
| Date | 2026-06-15 |
| Tool | Claude (Claude Code) |
| Original prompt | "Create printable electronic contract and invoice (A4) using the browser's print-to-PDF; no backend PDF library. The contract must embed the saved signature." |
| Response summary | AI added a global `@media print` stylesheet (`.print-root` shows, everything else hidden), a reusable `PrintModal`, and a `ContractDocument` (A4). It exposed the contract `Terms` on the tenant-room DTO and embedded the saved signature image. The existing owner invoice A4 sheet was marked `.print-root` so its print button now outputs only the invoice. |
| What was applied | `PrintModal.tsx`, `ContractDocument.tsx`, the print CSS, `Terms` on `TenantRoomDto`, and the "Xem & in hợp đồng" action on the tenant page. |
| My own edits | Re-designed the contract into a proper Vietnamese layout (national header, contract number, 5 articles) and made **Bên A (chủ trọ) an automatic system e-signature seal** (RoomHub "ĐÃ KÝ ĐIỆN TỬ") instead of a blank line, while Bên B is the tenant's hand-drawn signature. |
| Evidence (commit/screenshot) | `GET /tenant/room` returns `terms` + `signaturePath`; print preview shows only the document. |
| Personal reflection | Print-to-PDF with `@media print` is a clean way to produce documents without a server-side PDF dependency. |

### Session 3 — Integrate cleanly with the team's latest main

| Item | Content |
|---|---|
| Date | 2026-06-15 |
| Tool | Claude (Claude Code) |
| Original prompt | "Pull the latest code, finish the audit files, and push the branch following the correct process." |
| Response summary | AI pulled the latest `main` and found that teammate **DE180303** had already merged a competing **subscription** system and a **tenant-invoices** API. To avoid duplicate/conflicting features, we scoped this push to the two **non-overlapping** features (digital signature + e-documents), created a clean branch off current `main`, and cherry-picked those two commits — both applied with **no conflicts**. |
| What was applied | Branch `feature/de180336-esign-edoc` off `origin/main`; cherry-picked the signature + e-docs commits; kept the Stripe-based subscription/invoice work local (not pushed) since the teammate's version is already on main. |
| My own edits | Decided which work was safe to push vs. which overlapped a teammate's; recreated the local DB to match `main`'s migrations and re-ran the signature smoke test. |
| Evidence (commit/screenshot) | `git cherry-pick` ×2 → no conflicts; backend build 0 errors; `tsc` 0 errors; signature endpoint re-tested on a fresh DB. |
| Personal reflection | Good branch hygiene matters: pushing overlapping work would have created conflicts and two competing systems. Comparing against the latest main first avoided that. |

---

## 5. AI Assistance Level Summary

| Phase | Self (%) | AI (%) | Notes |
|---|---|---|---|
| Requirement analysis | 60 | 40 | Student scoped the push around the teammate overlap |
| Database design | 100 | 0 | No schema change (reused `Contract.SignaturePath`) |
| Backend | 30 | 70 | AI generated the endpoint/service; student set upload-layer & validation rules |
| Frontend | 35 | 65 | AI generated the components; student redesigned the contract & auto-signature |
| Testing | 50 | 50 | AI build/runtime tested; student verified on a main-matched DB |
| Documentation | 40 | 60 | AI drafted the audit; student reviewed & signed |

---

## 6. AI Errors / Limitations Encountered

| Issue | How it was handled |
|---|---|
| Teammate DE180303 had already merged overlapping subscription + tenant-invoice features | Scoped this push to only the non-overlapping features; kept the rest local |
| Local DB had diverged from `main`'s migrations | Dropped & recreated the DB via `dotnet ef database update` to match `main` before testing |
| Signature upload would hit a shared Cloudinary account during testing | Forced the local `/uploads` fallback (config override) so the test had no external side effect |

---

## 7. Methods of Verifying AI Output

- [x] Built the backend (`dotnet build` → 0 errors)
- [x] Type-checked the frontend (`tsc -b` → 0 errors)
- [x] Ran the backend and smoke-tested the signature endpoint (sign → persisted; empty → 400)
- [x] Compared against the latest `main` to avoid duplicating a teammate's work
- [ ] Other: ___

---

## 8. Academic Commitment

I confirm that all information in this document is truthful and accurate. I clearly understand which parts were AI-assisted and can re-explain them in my own words.

**Signature:** Nguyễn Hữu Triết — DE180336
