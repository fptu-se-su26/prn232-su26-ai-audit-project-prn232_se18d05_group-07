# PROMPTS LOG — Nguyễn Hữu Triết (DE180336)

## 1. General Information

| Item | Content |
|---|---|
| Course | PRN232 |
| Student | Nguyễn Hữu Triết — DE180336 |
| Issue/Task | #3 — Digital signature + electronic contract/invoice (print-to-PDF) |
| Date | 2026-06-15 |

---

## 2. AI Tools Used

- [ ] ChatGPT  - [ ] Gemini  - [x] Claude (Claude Code)  - [ ] GitHub Copilot  - [ ] Cursor  - [ ] Other

---

## 3. Prompt Registry

| # | Date | Tool | Purpose | Prompt summary | Result summary | Applied status |
|---|---|---|---|---|---|---|
| 1 | 06-15 | Claude | Digital signature | Build a canvas signature; tenant signs the contract; save & show | SignaturePad + sign endpoint + SignaturePath | Applied (with edits) |
| 2 | 06-15 | Claude | E-documents | Printable A4 contract & invoice via browser print, embed signature | print CSS + PrintModal + ContractDocument | Applied (with edits) |
| 3 | 06-15 | Claude | Push correctly | Pull main, finish audit, push branch the right way | Scoped to non-overlapping features; clean cherry-pick | Applied |

---

## 4. Detailed Prompts

> *Note: prompts are written up following Role – Context – Request – Constraints – Output, while truthfully representing the content discussed with the AI.*

### Prompt #1 — Mouse-drawn digital signature

**Prompt:**
```
ROLE: senior React+TS + .NET engineer on the RoomHub clean-architecture solution.
CONTEXT: Contract entity already has a SignaturePath field; Cloudinary is used for
image upload; tenant has a "My Room" page with the active contract.
REQUEST:
1. A reusable SignaturePad canvas component (draw by mouse AND touch, clear button,
   export PNG).
2. POST /api/tenant/room/sign: receive the base64 PNG, upload it, store the URL in
   Contract.SignaturePath; return the URL; render the saved signature back.
CONSTRAINTS: do the upload in the API/Infrastructure layer (Application must not
touch Cloudinary); validate the image; do not commit runtime upload files.
OUTPUT: component + endpoint + service method + DTO field, clean build/type-check.
```
**AI result:** `SignaturePad.tsx`, `SignContractAsync`, the sign endpoint with Cloudinary + local `/uploads` fallback, `SignaturePath` on the DTO, the My Room signature card.
**My edits:** image validation, `.gitignore` for `wwwroot/uploads`.
**Status:** Applied.

### Prompt #2 — Electronic contract & invoice (print-to-PDF)

**Prompt:**
```
ROLE: senior React+TS engineer; prefer NO backend PDF library.
CONTEXT: contract data is in the tenant-room API; the owner invoice page already
has an A4 preview; the contract now has a saved signature.
REQUEST: A4 ContractDocument + InvoiceDocument printable via the browser
(window.print + @media print) showing only the document; the contract must embed
the saved signature.
CONSTRAINTS: no backend PDF dependency; keep the existing design system.
OUTPUT: print CSS + a PrintModal + the document components, wired with a print button.
```
**AI result:** global `@media print` CSS (`.print-root`/`.print-hide`), `PrintModal`, `ContractDocument`, `Terms` exposed on the DTO; owner invoice A4 sheet marked `.print-root`.
**My edits (important):** redesigned the contract into a proper Vietnamese layout (national header, contract number, 5 articles) and made **Bên A (landlord) an automatic system e-signature seal** instead of a blank line; Bên B is the tenant's drawn signature.
**Status:** Applied (with edits).

### Prompt #3 — Pull, finish audit, push the right way

**Prompt:**
```
Pull the latest code, finish the AI-audit files, and push my branch following the
correct process. No Claude co-author line in commits.
```
**Context:** Finalize and ship the work to the team repo.
**AI result:** Pulled `main` and discovered teammate DE180303 had already merged a competing subscription system and a tenant-invoices API. To follow the process and avoid conflicts, we pushed only the two non-overlapping features (digital signature + e-documents) on a clean branch off `main`; the Stripe work stays local.
**My edits:** chose the scope (which work to push vs. shelve); recreated the DB to match `main` before testing.
**Status:** Applied.

---

## 5. Most Effective Prompt

**Prompt:** Prompt #1.

**Why effective:** It named the existing field to reuse (`Contract.SignaturePath`), the upload mechanism, and the layering constraint (upload in API, not Application), so the AI produced code that dropped into the architecture with only small edits.

---

## 6. Least Effective Prompt

**Prompt:** Prompt #3 as first phrased ("push my branch").

**Why weak:** "Push the branch" assumed no conflicts; the real blocker was a teammate's overlapping merged work, which only surfaced after pulling and comparing.

**How to improve:** Always pull and diff against the latest `main` *before* deciding what to push.

---

## 7. Lessons Learned

1. Name the **existing fields/mechanisms** to reuse so generated code fits the architecture.
2. Encode **layer constraints** (where the upload happens) in the prompt.
3. **Pull & compare** before pushing — avoid duplicating a teammate's merged feature.

---

## 8. Commitment

I do not submit AI output without checking it, and I can explain every part of the code/documentation that AI assisted with.

**Signature:** Nguyễn Hữu Triết — DE180336
