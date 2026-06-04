# REFLECTION — Nguyễn Hữu Triết (DE180336)

## 1. General Information

| Item | Content |
|---|---|
| Course | PRN232 |
| Student | Nguyễn Hữu Triết — DE180336 |
| Issue/Task | #1 — Complete the missing UI of RoomHub |
| Reflection date | 2026-06-04 |

---

## 2. Purpose

This document records the learning process and responsible use of AI in task #1, to demonstrate that AI is a learning-support tool, not a replacement for the student's own ability.

---

## 3. AI Usage Journey

I started by syncing the code (pull) and setting up the runtime environment (installing the .NET 10 SDK, updating the database). Then I asked the AI to complete the missing UI areas (Tenant & Admin), redesigned in a parallax style following the existing design system, referencing business logic from an internal team project (with permission). The AI generated React/TypeScript code; I reviewed it, edited the content, and verified it by building and running.

---

## 4. AI Tools Used

| Tool | Main purpose |
|---|---|
| Claude (Claude Code) | Environment setup, React UI code generation, build verification, drafting documentation |

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

**Explanation:** AI helped quickly build many consistently-styled UI pages, while I learned how to organize hash-routing, the parallax hooks (IntersectionObserver, requestAnimationFrame), and how to keep the design system consistent across areas.

---

## 7. AI Limitations / Errors Encountered

| Issue | How I handled it |
|---|---|
| Backend build failed due to missing .NET 10 SDK | Installed the correct SDK matching the project target |
| A stray character in a page title | Asked for a fix & re-checked |
| Reference project on a different technology (MVC) could not be copied | Rebuilt in React based on the business logic |

---

## 8. Methods of Verifying AI Output

- [x] Ran the program
- [x] Compared against the task requirements
- [ ] Referenced course slides / materials
- [x] Asked the instructor / teammates

---

## 9. Work Done by Myself (Without AI)

Parts I figured out and did on my own:

1. Defined the scope of the missing UI by comparing the existing app with an internal team project.
2. Decided the role-based navigation architecture (Owner / Tenant / Admin).
3. Reviewed the Vietnamese content, tested the UI in the browser, and accepted the result.

---

## 10. AI Dependency Level (self-assessment)

**Scale 1–5** (1 = fully self-made, 5 = fully dependent on AI):

Score: **3/5**

**Reason:** AI generated most of the UI scaffolding, but defining the scope, the style, the verification, and the acceptance were driven by me.

---

## 11. Before – After Using AI

| | Before | After |
|---|---|---|
| Understanding | Basic React + Tailwind | Also understand hash-routing & parallax effects |
| Work speed | Slow when building many pages | Significantly faster |
| Code quality | Inconsistent | Consistent design system, clean build |

---

## 12. Lessons on Responsible AI Use

My commitments when using AI for learning:

1. Do not copy-paste AI output verbatim without understanding it.
2. Always record and be able to explain every part AI assisted with.
3. Clearly cite the reference source (an internal team project) transparently.

---

## 13. Improvement Plan (Next Task)

Wire the Tenant/Admin pages to the real backend API (replace mock data), add testing, and enforce role-based route guards.

---

## 14. Self-Assessment

| Criterion | Score (1–5) |
|---|---|
| Proactive problem-solving | 4 |
| Responsible AI use | 5 |
| Quality of submitted work | 4 |
| New knowledge learned | 4 |

---

## 15. Academic Commitment

I confirm that this document truthfully reflects my learning process and use of AI. I take full responsibility for the submitted content.

**Signature:** Nguyễn Hữu Triết — DE180336
