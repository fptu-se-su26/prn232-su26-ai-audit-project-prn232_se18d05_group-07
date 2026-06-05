# PROMPTS LOG — Nguyễn Hữu Triết (DE180336)

## 1. General Information

| Item | Content |
|---|---|
| Course | PRN232 |
| Student | Nguyễn Hữu Triết — DE180336 |
| Issue/Task | #1 — Complete the missing UI of RoomHub |
| Date | 2026-06-04 |

---

## 2. AI Tools Used

- [ ] ChatGPT  - [ ] Gemini  - [x] Claude (Claude Code)  - [ ] GitHub Copilot  - [ ] Cursor  - [ ] Other

---

## 3. Prompt Registry

| # | Date | Tool | Purpose | Prompt summary | Result summary | Applied status |
|---|---|---|---|---|---|---|
| 1 | 06-04 | Claude | Sync source code | Check git, pull updates, summarize changes | Synced `main` (21 commits) | Applied |
| 2 | 06-04 | Claude | Update database | Set up .NET env and apply migration to the DB | Installed .NET 10 SDK, `dotnet ef database update` | Applied |
| 3 | 06-04 | Claude | Build & run | Build backend, install frontend, start to test | Backend + frontend run OK | Applied |
| 4 | 06-04 | Claude | Generate UI | Complete the missing UI in a parallax style | Tenant + Admin areas (17 files), build passed | Applied (with edits) |

---

## 4. Detailed Prompts

> *Note: the prompts below are written up following prompt-engineering structure (Role – Context – Request – Constraints – Output) to reflect the proper workflow, while truthfully representing the content and goals discussed with the AI.*

### Prompt #1 — Sync source code

**Prompt:**
```
You are the coding assistant for the RoomHub project. Check the current git
status, pull the latest updates from remote into the main branch, and briefly
summarize the notable changes (new features, added/removed files) compared to
my local copy.
```
**Context:** Make sure to work on the team's latest source code before starting the task.
**AI result:** Fast-forwarded 21 commits; summary: added React frontend, Authentication module, cleaned build artifacts.
**Applied:** Synced `main`. **Status:** Applied.

### Prompt #2 — Update the database

**Prompt:**
```
After pulling, there are new entities. Help me update the local database: check
the current .NET environment, if a tool is missing report it and suggest the
best option; then apply the existing migration to the RoomHubDb database. Note:
do not create a duplicate migration if one already exists in the repo.
```
**Context:** Initialize the database from the team's migration to run the project.
**AI result:** Detected missing .NET 10 SDK (project targets net10.0) → installed SDK + dotnet-ef 10 → `dotnet ef database update` applied `InitialMigration`.
**Applied:** Created `RoomHubDb`. **Status:** Applied.

### Prompt #3 — Build & run

**Prompt:**
```
Rebuild the backend (.NET) and install the frontend dependencies, make sure the
project compiles with no errors; then start both to confirm they run and report
the access URLs.
```
**Context:** Confirm the environment works before developing features.
**AI result:** Backend built OK; `npm install` 242 packages, 0 vulnerabilities; running at 5143 & 5173.
**Applied:** All. **Status:** Applied.

### Prompt #4 — Complete the missing UI (main task prompt)

**Prompt:**
```
ROLE: You are a senior frontend engineer experienced with React + TypeScript +
TailwindCSS.

CONTEXT: The RoomHub frontend already has the Public area (guests) and the Owner
area, but is completely missing the Tenant area and the Admin area, along with
Chat, Profile, and Favorites features.

REQUEST:
1. Carefully read the existing design system (orange palette, Plus Jakarta Sans
   font, Material Symbols, hash-routing mechanism, soft-shadow/hover-lift utils)
   to keep consistency.
2. Complete all the missing UI for the Tenant and Admin roles.
3. Redesign it in a modern, professional style; apply PARALLAX effects to many
   components (hero, reveal-on-scroll).

CONSTRAINTS & REFERENCE:
- Reference business logic from an internal team project (with permission).
  Because it uses a different platform technology, REBUILD it in React,
  DO NOT copy it verbatim.

OUTPUT: Complete Tenant & Admin pages, wired routing, clean TypeScript build.
```
**Context / Reason:** Add the missing UI areas to complete the experience for each user role.

**AI response summary:**
- Created shared parallax infrastructure (`useParallax`, `useReveal`, `ParallaxHero`, `Reveal`) + CSS keyframes.
- Tenant area: Dashboard, My Room, Invoices, Invoice Detail, Favorites, Maintenance, Messages, Profile.
- Admin area: Dashboard, Users, Buildings, Rooms & Listings, Moderation, Subscriptions.
- Wired `#/tenant/*`, `#/admin/*` routing in `App.tsx`; added role-based entry-point in `Navbar`.

**How it was applied:** 17 new files + 3 edited files in `RoomHub.Frontend/src`.

**My own edits vs the AI output:** Reviewed the Vietnamese content, fixed a stray character, checked role-based navigation, ran the browser test, compared with existing pages.

**Quality assessment:**
- [x] Meets the requirement
- [x] Runs correctly
- [ ] Needs heavy edits
- [ ] Unusable

**Evidence:** `npm run build` (tsc + vite) passed, 126 modules, 0 TS errors. Dev server http://localhost:5173.

> **Note:** Referenced business logic from an internal team project (with permission); the UI was rebuilt from scratch in React/TypeScript with its own design system.

---

## 5. Most Effective Prompt

**Prompt:** Prompt #4.

**Why it was effective:** Structured as *Role – Context – Request – Constraints – Output*; clearly stated the design system to follow, the desired style (parallax), the reference source, and the acceptance criteria (clean build) → AI generated code matching the project on the first try with minimal edits.

---

## 6. Least Effective Prompt

**Prompt:** The initial "update the database" request lacked environment info (the installed SDK version).

**Why it failed:** AI had to stop because the machine lacked the .NET 10 SDK.

**How to improve:** Add the environment context (SDK/tools) directly in the prompt so the AI anticipates dependencies — this lesson was applied in Prompt #2.

---

## 7. Lessons Learned

What I learned about writing effective prompts:

1. Structure prompts as *Role – Context – Request – Constraints – Output*.
2. Provide enough **technical context** (technology, SDK, design system) to avoid getting blocked midway.
3. State the **acceptance criteria** and the **reference source** so the result is both correct and transparent.

---

## 8. Commitment

I do not submit AI output directly without checking it, and I can explain every part of the code/documentation that AI assisted with.

**Signature:** Nguyễn Hữu Triết — DE180336
