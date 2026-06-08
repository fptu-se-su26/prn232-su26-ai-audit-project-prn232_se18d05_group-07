# REFLECTION — Nguyễn Hữu Triết (DE180336)

## 1. General Information

| Item | Content |
|---|---|
| Course | PRN232 |
| Student | Nguyễn Hữu Triết — DE180336 |
| Issue/Task | #2 — Implement the Profile feature (backend API + wire the Tenant Profile page) |
| Reflection date | 2026-06-08 |

---

## 2. Purpose

This document records the learning process and responsible use of AI in task #2: turning the static Tenant Profile page (built in task #1) into a working feature with a real backend API.

---

## 3. AI Usage Journey

I synced the code, then chose to implement **Profile** — a Tenant page that still used mock data. I asked the AI to build the backend API (view / update / change password) and wire the existing page. The AI generated the C# and React code; I directed the security and layering rules, and verified with a build, a type-check, and a runtime smoke test.

---

## 4. AI Tools Used

| Tool | Main purpose |
|---|---|
| Claude (Claude Code) | C#/React code generation, build & runtime verification, drafting documentation |

---

## 5. Which Areas AI Assisted

- [x] Understanding requirements
- [x] Designing the solution (layering decision)
- [x] Writing code
- [x] Debugging
- [ ] Optimization
- [x] Writing documentation
- [x] Explaining concepts

---

## 6. Did AI Improve the Learning Outcome?

**Answer (yes / no / partly):** Yes

**Explanation:** I learned how clean architecture decides *where* code lives: a service that depends on ASP.NET Identity (`UserManager`) belongs in Infrastructure, while its interface and DTOs stay in Application so the controller depends only on the abstraction. I also learned why the user id must come from the JWT rather than the request body.

---

## 7. AI Limitations / Errors Encountered

| Issue | How I handled it |
|---|---|
| A type bug came with the merge (`contractStatus` on `TenantData`) | Traced it to the backend DTO that returns the field; fixed the interface + mapping |
| `UserManager`-based service won't compile in Application (no Identity reference) | Moved the implementation to Infrastructure, kept the interface in Application |
| An update DTO could trust a client user id | Took the id from the JWT only |

---

## 8. Methods of Verifying AI Output

- [x] Built the backend / type-checked the frontend
- [x] Ran the program and smoke-tested the endpoints
- [x] Compared against the task requirement
- [ ] Referenced course slides / materials

---

## 9. Work Done by Myself (Without AI)

1. Decided the task scope (implement Profile, defer KYC).
2. Set the security rule (user id from JWT, not the body) and the data-preservation rule (don't wipe gender/avatar).
3. Reviewed the build / type-check / runtime results and accepted the outcome.

---

## 10. AI Dependency Level (self-assessment)

**Scale 1–5** (1 = fully self-made, 5 = fully dependent on AI):

Score: **3/5**

**Reason:** AI generated most of the boilerplate, but the scoping, the architectural placement, the security decisions, and the verification were mine.

---

## 11. Before – After Using AI

| | Before | After |
|---|---|---|
| Understanding | Could write controllers | Understand layer boundaries (Application vs Infrastructure) and DI |
| Work speed | Slow to scaffold a full feature | Full feature scaffolded and verified quickly |
| Code quality | Might trust client input | Id-from-JWT, preserve-unset-fields habits |

---

## 12. Lessons on Responsible AI Use

1. Do not accept AI's architectural placement blindly — verify it compiles against this project's references.
2. Always check the security implications of generated code (trust boundaries, auth source).
3. Verify at runtime, not just at compile time.

---

## 13. Improvement Plan (Next Task)

- Implement the KYC tab (CCCD + photo upload via Cloudinary) and reflect the verification status.
- Wire the next self-contained Tenant feature using the same pattern.
- Add role-based route guards and automated tests.

---

## 14. Self-Assessment

| Criterion | Score (1–5) |
|---|---|
| Proactive problem-solving | 4 |
| Responsible AI use | 5 |
| Quality of submitted work | 4 |
| New knowledge learned | 5 |

---

## 15. Academic Commitment

I confirm that this document truthfully reflects my learning process and use of AI. I take full responsibility for the submitted content.

**Signature:** Nguyễn Hữu Triết — DE180336
