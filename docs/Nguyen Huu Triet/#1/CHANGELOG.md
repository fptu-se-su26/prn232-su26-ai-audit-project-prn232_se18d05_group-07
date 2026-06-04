# CHANGELOG — Nguyễn Hữu Triết (DE180336)

## General Information

| Item | Content |
|---|---|
| Student | Nguyễn Hữu Triết — DE180336 |
| Issue/Task | #1 — Complete the missing UI of RoomHub |
| Branch | `feature/de180336-complete-missing-ui` |

---

> **Principle:** Only record what was actually completed. Each entry needs a date, content, and evidence (commit link or screenshot).

---

## Phase 01 — Kickoff & Requirement Analysis

### Checklist
- [x] Read and understood the task requirement
- [x] Created a branch following the convention
- [x] Created a personal folder under docs/

### Log

| Date | Content | AI assisted | Evidence |
|---|---|---|---|
| 2026-06-04 | Pulled 21 new commits, synced `main`; compared the existing frontend to identify the missing UI (Tenant, Admin, Chat, Profile, Favorites) | Yes | Git fast-forward → ec2b26d |
| 2026-06-04 | Installed .NET 10 SDK + updated dotnet-ef, `dotnet ef database update` created RoomHubDb | Yes | `__EFMigrationsHistory` = InitialMigration |

---

## Phase 02 — Design

### Checklist
- [x] Designed / analyzed the assigned part
- [x] Updated design documentation (if any)

### Log

| Date | Content | AI assisted | Evidence |
|---|---|---|---|
| 2026-06-04 | Analyzed the design system (orange Tailwind, Material Symbols, hash-routing); chose a **parallax** style for heroes & reveal-on-scroll effects | Yes | `src/hooks/useParallax.ts`, `src/components/parallax/Parallax.tsx` |

---

## Phase 03 — Implementation

### Checklist
- [x] Wrote code
- [x] Manual testing
- [x] Committed following the convention: `[DE180336] feat: ...`

### Log

| Date | Content | AI assisted | Evidence |
|---|---|---|---|
| 2026-06-04 | Shared parallax infrastructure (hook + components + CSS keyframes) | Yes | `useParallax.ts`, `Parallax.tsx`, `index.css` |
| 2026-06-04 | **Tenant** area: TenantLayout + 8 pages (Dashboard, My Room, Invoices, Invoice Detail, Favorites, Maintenance, Messages, Profile) | Yes | `src/components/tenant/`, `src/pages/tenant/` |
| 2026-06-04 | **Admin** area: AdminLayout + 6 pages (Dashboard, Users, Buildings, Rooms & Listings, Moderation, Subscriptions) | Yes | `src/components/admin/`, `src/pages/admin/` |
| 2026-06-04 | Wired tenant/admin routing in `App.tsx`; added role-based "Dashboard" entry-point in `Navbar` | Yes | `src/App.tsx`, `src/components/Navbar.tsx` |

---

## Phase 04 — Testing & Bug Fixing

### Bug Tracker

| # | Bug description | Root cause | Fix | Status |
|---|---|---|---|---|
| 1 | Backend build failed (NETSDK1045) | Machine only had .NET 9 SDK, project targets net10.0 | Installed .NET 10 SDK | Fixed |
| 2 | Stray character in the Tenant Dashboard title | String generation glitch | Fixed the title | Fixed |
| 3 | Frontend build verification | — | `npm run build` → tsc + vite passed | Fixed |

---

## Phase 05 — Summary

### Completed features
- [x] Tenant area with 8 full pages
- [x] Admin area with 6 full pages
- [x] Shared parallax + reveal effects
- [x] Role-based navigation (Owner/Tenant/Admin)

### Incomplete features / reason
- Real API integration for Tenant/Admin: currently uses mock data because the backend only has the Auth module; API wiring will be done in a later task.

### Overall AI assistance (%)

| Category | % AI | % Self |
|---|---|---|
| Code | 80 | 20 |
| Documentation | 60 | 40 |
| Debug | 50 | 50 |

---

## Confirmation

I confirm that this changelog accurately reflects the actual work performed.

**Signature:** Nguyễn Hữu Triết — DE180336
