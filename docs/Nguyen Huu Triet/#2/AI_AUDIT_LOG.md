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
| Issue/Task | #2 — Implement the Profile feature (backend API + wire the Tenant Profile page) |
| Date | 2026-06-08 |

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

- [x] Requirement analysis (which Tenant pages still use mock data)
- [x] Code generation (C# Web API + React/TypeScript wiring)
- [x] Debugging / fixing (clean backend build & TypeScript type-check)
- [ ] Code optimization
- [x] Documentation writing
- [ ] Database design
- [x] Other: architecture decision (where to place the Identity-dependent service)

---

## 4. Detailed Log of Each AI Use

### Session 1 — Sync + identify the next piece of work

| Item | Content |
|---|---|
| Date | 2026-06-08 |
| Tool | Claude (Claude Code) |
| Original prompt | "Check git and pull the latest code; summarize the changes." |
| Response summary | AI pulled 8 new commits into `main` and, while verifying the build, found a TypeScript bug shipped with the merge: `contractStatus` was read on `TenantData` in `owner/UnitDetail.tsx` but was not declared on the interface nor mapped from the API (the backend DTO `UnitTenantDto` already returns it). AI added the field to the interface and to the `setTenant` mapping. |
| What was applied | Synced `main`; fixed the type bug. Confirmed that several Tenant pages built in task #1 (e.g. Profile) are still static/mock and need a real backend API — the natural continuation of the task-#1 improvement plan. |
| My own edits | Chose to scope task #2 to a single, self-contained feature — **Profile** — because the page already exists and the data model (`ApplicationUser`) is already in place. |
| Evidence (commit/screenshot) | `git pull` fast-forward `5a3ed18..89916a6`; `tsc -b` went 3 errors → 0 after the fix. |
| Personal reflection | A page that "looks done" can still be a shell over mock data; the real work is the API contract behind it. |

### Session 2 — Implement the Profile feature (backend + frontend wiring)

| Item | Content |
|---|---|
| Date | 2026-06-08 |
| Tool | Claude (Claude Code) |
| Original prompt | "Implement the Profile feature: backend API + connect it to the existing UI." |
| Response summary | AI read the existing patterns (AuthController, DashboardController, the Identity + JWT setup, the Infrastructure DI extension, the frontend `api`/`useAuth` helpers), then implemented Profile end-to-end. A key architecture decision: our Application project does **not** reference ASP.NET Identity, so the `UserManager`-based implementation was placed in the **Infrastructure** layer (which already configures Identity), while the interface and DTOs stay in Application so the controller depends on the abstraction. |
| What was applied | Backend: 4 new files (`ProfileDtos`, `IProfileService`, `ProfileService`, `ProfileController`) + 1 edit (DI registration). Frontend: wired the **Info** and **Change Password** tabs of `tenant/Profile.tsx` to the new API (controlled inputs, fetch-on-mount, success/error banners). |
| My own edits | Hardened the design: the user id is taken from the **JWT claim**, never from the request body. The Update form preserves fields it does not expose (gender/avatar) so they are not wiped. |
| Evidence (commit/screenshot) | `dotnet build RoomHub.slnx` → 0 Errors; `npx tsc -b` → exit 0 (no type errors). |
| Personal reflection | Understood the clean-architecture boundary: an Identity-bound service belongs in Infrastructure, while its contract (interface + DTOs) stays in Application. |

---

## 5. AI Assistance Level Summary

| Phase | Self (%) | AI (%) | Notes |
|---|---|---|---|
| Requirement analysis | 60 | 40 | Student set the scope (Profile); AI identified the mock-data pages |
| Database design | 100 | 0 | No schema change — reused existing `ApplicationUser` fields |
| Backend | 25 | 75 | AI generated the DTOs/service/controller; student set the security & layering rules |
| Frontend | 30 | 70 | AI wired the page; student kept the existing design intact |
| Testing | 50 | 50 | AI build/type-check + endpoint smoke test; student reviewed |
| Documentation | 40 | 60 | AI drafted the audit log; student reviewed & signed |

---

## 6. AI Errors / Limitations Encountered

| Issue | How it was handled |
|---|---|
| A type bug came in with the merge (`contractStatus` not on `TenantData`) | Traced it to the backend DTO that already returns the field; added it to the interface + the `setTenant` mapping |
| `UserManager`-based service won't compile in the Application layer (no Identity reference) | Placed the implementation in Infrastructure (which configures Identity); kept the interface in Application |
| Update DTO must not trust a client-supplied user id | The service takes the user id from the JWT only |
| KYC tab needs real file upload (Cloudinary) | Left as a demo for a future task; documented as out of scope |

---

## 7. Methods of Verifying AI Output

- [x] Built the backend (`dotnet build` → 0 errors)
- [x] Type-checked the frontend (`tsc -b` → 0 errors)
- [x] Ran the backend and smoke-tested the Profile endpoints
- [x] Compared against the task requirement (Profile view / update / change password)
- [ ] Referenced course materials
- [ ] Other: ___

---

## 8. Academic Commitment

I confirm that all information in this document is truthful and accurate. I clearly understand which parts were AI-assisted and can re-explain them in my own words.

**Signature:** Nguyễn Hữu Triết — DE180336
