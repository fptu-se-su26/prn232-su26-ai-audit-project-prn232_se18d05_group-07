# PROMPTS LOG — Nguyễn Hữu Triết (DE180336)

## 1. General Information

| Item | Content |
|---|---|
| Course | PRN232 |
| Student | Nguyễn Hữu Triết — DE180336 |
| Issue/Task | #2 — Implement the Profile feature (backend API + wire the Tenant Profile page) |
| Date | 2026-06-08 |

---

## 2. AI Tools Used

- [ ] ChatGPT  - [ ] Gemini  - [x] Claude (Claude Code)  - [ ] GitHub Copilot  - [ ] Cursor  - [ ] Other

---

## 3. Prompt Registry

| # | Date | Tool | Purpose | Prompt summary | Result summary | Applied status |
|---|---|---|---|---|---|---|
| 1 | 06-08 | Claude | Sync source code | Check git, pull the latest code | Fast-forward `main` (8 commits) + fixed a merge type bug | Applied |
| 2 | 06-08 | Claude | Implement feature | Build the Profile backend API + wire the UI | 4 backend files + DI + `Profile.tsx` wiring, builds pass | Applied (with edits) |
| 3 | 06-08 | Claude | Test | Run and smoke-test the Profile endpoints | Verified view / update / change password | Applied |

---

## 4. Detailed Prompts

> *Note: the prompts below are written up following prompt-engineering structure (Role – Context – Request – Constraints – Output) to reflect the proper workflow, while truthfully representing the content and goals discussed with the AI.*

### Prompt #1 — Sync source code

**Prompt:**
```
Check the current git status and pull the latest code from remote into my
working copy; summarize the notable changes.
```
**Context:** Work on the team's latest code before starting the task.
**AI result:** Fast-forwarded 8 commits (`5a3ed18..89916a6`); detected and fixed a TypeScript bug shipped with the merge (`contractStatus` missing on `TenantData`).
**Applied:** Synced `main`, fixed the bug. **Status:** Applied.

### Prompt #2 — Implement the Profile feature (main task prompt)

**Prompt:**
```
ROLE: You are a senior .NET + React engineer working in a clean-architecture
solution (Domain / Application / Infrastructure / API) with a separate React +
TypeScript frontend.

CONTEXT: The Tenant "Profile" page exists as static UI (built in task #1) but
has no backend and is not wired to any API.

REQUEST:
1. Implement the Profile backend as a REST API: get my profile, update my
   profile, change password.
2. Wire the existing tenant/Profile.tsx Info and Password tabs to the new API.

CONSTRAINTS:
- Follow the existing patterns (AuthController, the Identity + JWT setup, the
  Infrastructure DI extension, the frontend api/useAuth helpers).
- Our Application layer does NOT reference Identity; put the UserManager-based
  implementation where it belongs.
- Take the user id from the JWT, never from the request body.
- Keep the existing page design unchanged.

OUTPUT: DTOs + interface + service + controller + DI registration, the wired
page, a clean backend build and a clean TypeScript type-check.
```
**Context / Reason:** Turn the static Profile page into a working feature, fulfilling the task-#1 improvement plan (replace mock data with a real API).

**AI response summary:**
- Backend: `ProfileDtos.cs` (4 DTOs), `IProfileService.cs` (Application), `ProfileService.cs` (Infrastructure, uses `UserManager`), `ProfileController.cs` (3 `[Authorize]` endpoints), DI registration.
- Frontend: `tenant/Profile.tsx` Info + Password tabs wired (fetch-on-mount, controlled inputs, success/error banners); KYC tab left as a demo.

**How it was applied:** 4 new backend files + 1 DI edit + 1 frontend file rewrite.

**My own edits vs the AI output:** Enforced taking the user id from the JWT (not the body); preserved gender/avatar so the update form does not wipe them; kept the page design identical.

**Quality assessment:**
- [x] Meets the requirement
- [x] Builds / type-checks clean
- [ ] Needs heavy edits
- [ ] Unusable

**Evidence:** `dotnet build RoomHub.slnx` → 0 Errors; `npx tsc -b` → exit 0.

### Prompt #3 — Run & smoke-test

**Prompt:**
```
Run the backend and the frontend and test the Profile feature fully: load the
profile, update it, and change the password; report the actual results.
```
**Context:** Verify the feature works at runtime, not just at compile time.
**AI result:** Ran the API and exercised `GET/PUT /api/profile` and `POST /api/profile/change-password`; reported the outcomes.
**Applied:** Used to confirm acceptance. **Status:** Applied.

---

## 5. Most Effective Prompt

**Prompt:** Prompt #2.

**Why it was effective:** Role – Context – Request – Constraints – Output, and it spelled out the project-specific constraints (no Identity in Application, id-from-JWT, keep the design) so the AI placed the service in the correct layer and produced secure code on the first pass.

---

## 6. Least Effective Prompt

**Prompt:** An early, vague "make the profile work".

**Why it was weak:** Without naming the API contract or the layering constraint, the result could land in the wrong project or trust client input.

**How to improve:** State the exact endpoints, the auth source, and the layer rules up front — applied in Prompt #2.

---

## 7. Lessons Learned

1. Encode project-specific **constraints** (layer references, auth source) in the prompt so generated code lands in the right place.
2. Separate the **contract** (interface + DTOs) from the **implementation** (Infrastructure) so controllers depend on abstractions.
3. Always state the **acceptance criteria** (clean build + type-check + runtime test) so the result is verifiable.

---

## 8. Commitment

I do not submit AI output directly without checking it, and I can explain every part of the code/documentation that AI assisted with.

**Signature:** Nguyễn Hữu Triết — DE180336
