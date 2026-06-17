# REFLECTION — Nguyễn Hữu Triết (DE180336)

## 1. General Information

| Item | Content |
|---|---|
| Course | PRN232 |
| Student | Nguyễn Hữu Triết — DE180336 |
| Issue/Task | #3 — Digital signature + electronic contract/invoice (print-to-PDF) |
| Reflection date | 2026-06-15 |

---

## 2. Purpose

This document records the learning process and responsible use of AI in task #3: adding a mouse-drawn digital signature to the rental contract and producing electronic contract/invoice documents (print-to-PDF), then shipping them to the team repo without clashing with a teammate's work.

---

## 3. AI Usage Journey

I asked the AI to build a reusable signature canvas and the backend to save it, then to turn the contract/invoice into printable A4 documents that embed the signature. I directed the security (upload validation, correct layer) and redesigned the contract into a professional layout with an automatic system signature for the landlord. When finalizing, I pulled the latest main, found a teammate had merged overlapping features, and scoped my push to only the non-overlapping work.

---

## 4. AI Tools Used

| Tool | Main purpose |
|---|---|
| Claude (Claude Code) | Canvas/component & endpoint generation, build/runtime verification, drafting documentation, safe git integration |

---

## 5. Which Areas AI Assisted

- [x] Understanding requirements
- [x] Designing the solution
- [x] Writing code
- [x] Debugging
- [ ] Optimization
- [x] Writing documentation
- [x] Explaining concepts

---

## 6. Did AI Improve the Learning Outcome?

**Answer (yes / no / partly):** Yes

**Explanation:** I learned the HTML5 canvas pointer-event drawing flow, how `@media print` isolates a single element for print-to-PDF (no server-side PDF library needed), and — importantly — the team workflow of pulling and diffing against `main` before pushing to avoid duplicating a merged feature.

---

## 7. AI Limitations / Errors Encountered

| Issue | How I handled it |
|---|---|
| A teammate had already merged overlapping subscription/invoice features | Scoped my push to the non-overlapping features; kept the rest local |
| Local DB diverged from main's migrations | Recreated the DB from main's migrations before testing |
| Test could write to a shared Cloudinary account | Forced the local upload fallback during the test |

---

## 8. Methods of Verifying AI Output

- [x] Built the backend / type-checked the frontend
- [x] Ran the program and smoke-tested the signature endpoint
- [x] Compared against the latest main (avoid duplicating a teammate's work)
- [ ] Referenced course slides / materials

---

## 9. Work Done by Myself (Without AI)

1. Decided the push scope (signature + e-documents) after seeing the teammate overlap.
2. Designed the professional contract layout and the **system auto-signature for the landlord**.
3. Set the upload-layer and validation rules; recreated the DB and accepted the test results.

---

## 10. AI Dependency Level (self-assessment)

**Scale 1–5** (1 = fully self-made, 5 = fully dependent on AI):

Score: **3/5**

**Reason:** AI produced most of the boilerplate, but the design decisions (layout, auto-signature, layering, push scope) and verification were mine.

---

## 11. Before – After Using AI

| | Before | After |
|---|---|---|
| Understanding | Basic React + .NET | Canvas pointer events, `@media print`, clean git integration |
| Work speed | Slow to scaffold full features | Two features scaffolded and verified quickly |
| Code quality | Might commit runtime artifacts | Gitignore upload artifacts; upload in the right layer |

---

## 12. Lessons on Responsible AI Use

1. Verify generated code builds against the **current** `main`, not just locally.
2. Check security implications (upload validation, no secret/artifact in git).
3. Respect the team: do not push work that duplicates a teammate's merged feature.

---

## 13. Improvement Plan (Next Task)

- Reconcile the subscription/invoice payment approach with DE180303 (one system, not two).
- Add automated tests for the signature endpoint.
- Add a print stylesheet for the tenant invoice document too.

---

## 14. Self-Assessment

| Criterion | Score (1–5) |
|---|---|
| Proactive problem-solving | 5 |
| Responsible AI use | 5 |
| Quality of submitted work | 4 |
| New knowledge learned | 4 |

---

## 15. Academic Commitment

I confirm that this document truthfully reflects my learning process and use of AI. I take full responsibility for the submitted content.

**Signature:** Nguyễn Hữu Triết — DE180336
