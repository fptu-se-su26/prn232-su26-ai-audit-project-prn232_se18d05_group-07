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
| Issue/Task | #1 — Complete the missing UI of the RoomHub application |
| Date | 2026-06-04 |

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

- [ ] Requirement analysis
- [x] Code generation (React + TypeScript for the missing UI pages)
- [x] Debugging / fixing (ensuring a clean TypeScript build)
- [ ] Code optimization
- [ ] Documentation writing
- [ ] Database design
- [x] Other: UI/UX redesign with a parallax style; .NET 10 environment setup & database migration

---

## 4. Detailed Log of Each AI Use

### Session 1 — Environment setup & database update

| Item | Content |
|---|---|
| Date | 2026-06-04 |
| Tool | Claude (Claude Code) |
| Original prompt | "Check git status and pull the latest updates from remote; then set up the .NET environment and apply the existing migration to the local database. If a tool is missing, report it and suggest the best option; do not create a duplicate migration if one already exists." |
| Response summary | AI pulled the new code, detected the machine lacked the .NET 10 SDK (project targets net10.0), guided & installed the .NET 10 SDK + updated dotnet-ef to v10, ran `dotnet ef database update` to apply `InitialMigration` to `RoomHubDb`; built the backend and ran `npm install` for the frontend. |
| What was applied | Installed .NET 10 SDK; updated dotnet-ef 10.0.8; created the RoomHubDb database from the existing migration; built backend + frontend successfully. |
| My own edits | Re-checked the connection string, confirmed not to create a duplicate migration (the migration already existed in the repo, committed by another member). |
| Evidence (commit/screenshot) | `dotnet ef database update` wrote `__EFMigrationsHistory` = InitialMigration; `npm install` reported 242 packages, 0 vulnerabilities. |
| Personal reflection | Understood the flow clearly: pull → install the correct SDK → `database update` (not `add migration`) when the migration already exists. |

### Session 2 — Building the missing UI

| Item | Content |
|---|---|
| Date | 2026-06-04 |
| Tool | Claude (Claude Code) |
| Original prompt | "ROLE: senior React/TypeScript/Tailwind frontend engineer. CONTEXT: the app already has the Public and Owner areas, but is missing the Tenant and Admin areas. REQUEST: complete all the missing UI, follow the existing design system, redesign it in a modern/professional style with parallax effects. CONSTRAINT: reference business logic from an internal team project (with permission), rebuild it in React, do not copy. OUTPUT: Tenant & Admin pages, wired routing, clean build." |
| Response summary | AI read the existing design system (Tailwind, Material Symbols, hash-routing), referenced the feature areas, then **generated entirely new React + TypeScript code** for the missing areas: Tenant and Admin, together with shared parallax effect infrastructure. |
| What was applied | Added 17 new files (parallax hook, 2 layouts, 8 Tenant pages, 6 Admin pages) + edited 3 files (App.tsx routing, role-based Navbar entry-point, index.css keyframes). |
| My own edits | Reviewed the Vietnamese content; verified the build; adjusted role-based navigation; checked the UI in the browser. |
| Evidence (commit/screenshot) | `npm run build` → `tsc -b && vite build` passed, 126 modules, 0 TypeScript errors. Dev server at http://localhost:5173. |
| Personal reflection | The reference project uses a different technology (server-side) so it could not be copied; all React code was newly built by AI based on the business logic, only the feature structure was referenced. |

> **Note:** Referenced business logic from an internal team project (with permission); the UI was rebuilt from scratch in React/TypeScript with its own design system.

---

## 5. AI Assistance Level Summary

| Phase | Self (%) | AI (%) | Notes |
|---|---|---|---|
| Requirement analysis | 60 | 40 | Self-defined the missing UI scope; AI cross-checked the internal team project |
| Database design | 100 | 0 | Not part of this task (migration already existed) |
| Frontend | 20 | 80 | AI generated most of the UI code; student steered & verified |
| Backend | 90 | 10 | Only built/ran, no logic changes |
| Testing | 50 | 50 | AI build-verified; student checked the actual UI |
| Documentation | 40 | 60 | AI drafted the audit log; student reviewed & signed |

---

## 6. AI Errors / Limitations Encountered

| Issue | How it was handled |
|---|---|
| Backend build failed because the machine only had .NET 9 SDK | Installed the .NET 10 SDK matching the project target |
| A stray character slipped into the Tenant Dashboard title | Found & fixed it during the session |
| The reference project uses a different technology (MVC vs React) | Did not copy; rebuilt in React based on the business logic |

---

## 7. Methods of Verifying AI Output

- [x] Ran the program (dev server + `npm run build`)
- [x] Compared against the task requirements (matched the missing UI areas)
- [ ] Referenced course materials
- [x] Discussed with team members (referenced an internal team project, with permission)
- [ ] Other: ___

---

## 8. Academic Commitment

I confirm that all information in this document is truthful and accurate. I clearly understand which parts were AI-assisted and can re-explain them in my own words.

**Signature:** Nguyễn Hữu Triết — DE180336
