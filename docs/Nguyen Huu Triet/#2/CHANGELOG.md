# CHANGELOG — Nguyễn Hữu Triết (DE180336)

## General Information

| Item | Content |
|---|---|
| Student | Nguyễn Hữu Triết — DE180336 |
| Issue/Task | #2 — Implement the Profile feature (backend API + wire the Tenant Profile page) |
| Branch | `feature/de180336-profile-api` (proposed — work currently on local `main`, commit pending) |

---

> **Principle:** Only record what was actually completed. Each entry needs a date, content, and evidence (commit link or build result).

---

## Phase 01 — Sync & Scope

### Checklist
- [x] Pulled the latest code from `main`
- [x] Identified the Tenant pages that still use mock data
- [x] Chose the scope: implement **Profile**

### Log

| Date | Content | AI assisted | Evidence |
|---|---|---|---|
| 2026-06-08 | Pulled 8 new commits, synced `main` | Yes | Fast-forward `5a3ed18..89916a6` |
| 2026-06-08 | Fixed a merge type bug: `contractStatus` missing on `TenantData` in `owner/UnitDetail.tsx` (backend DTO already returns it) | Yes | `tsc -b` went from 3 errors → 0 |
| 2026-06-08 | Confirmed `tenant/Profile.tsx` is static/mock with no backend; scoped task #2 to a real Profile API | Yes | `src/pages/tenant/Profile.tsx` (pre-change) used `alert()` demos |

---

## Phase 02 — Design

### Checklist
- [x] Decided the layering for an Identity-dependent service
- [x] Defined the API contract

### Log

| Date | Content | AI assisted | Evidence |
|---|---|---|---|
| 2026-06-08 | Decision: interface in Application, implementation in Infrastructure (Application has no Identity reference; Infrastructure configures Identity + `UserManager`) | Yes | `RoomHub.Application/Common/Interfaces/IProfileService.cs`, `RoomHub.Infrastructure/Services/ProfileService.cs` |
| 2026-06-08 | API contract: `GET /api/profile/me`, `PUT /api/profile`, `POST /api/profile/change-password`, all `[Authorize]` | Yes | `RoomHub.API/Controllers/ProfileController.cs` |

---

## Phase 03 — Implementation

### Checklist
- [x] Wrote backend code
- [x] Wired the frontend page
- [ ] Committed following the convention `[DE180336] feat: ...` (pending user approval)

### Log

| Date | Content | AI assisted | Evidence |
|---|---|---|---|
| 2026-06-08 | DTOs: `ProfileDto`, `UpdateProfileDto`, `ChangePasswordDto`, `ProfileResult` | Yes | `Common/DTOs/Profile/ProfileDtos.cs` |
| 2026-06-08 | `IProfileService` + `ProfileService` (Get / Update / ChangePassword via `UserManager`; user id from JWT, not body) | Yes | `IProfileService.cs`, `Infrastructure/Services/ProfileService.cs` |
| 2026-06-08 | `ProfileController` (3 endpoints, `[Authorize]`, reads `ClaimTypes.NameIdentifier`) | Yes | `RoomHub.API/Controllers/ProfileController.cs` |
| 2026-06-08 | DI registration `IProfileService → ProfileService` | Yes | `RoomHub.Infrastructure/DependencyInjection.cs` |
| 2026-06-08 | Wired `tenant/Profile.tsx` Info + Password tabs to the API (fetch-on-mount, controlled inputs, success/error banners) | Yes | `RoomHub.Frontend/src/pages/tenant/Profile.tsx` |

---

## Phase 04 — Testing & Bug Fixing

### Bug Tracker

| # | Bug description | Root cause | Fix | Status |
|---|---|---|---|---|
| 1 | `tsc` error: `contractStatus` not on `TenantData` (came with the merge) | FE interface + mapping omitted a field the backend DTO returns | Added field to interface + `setTenant` mapping | Fixed |
| 2 | Risk: an update DTO could carry a client-supplied user id | Security — a user could target another user | id taken from JWT claim only | Fixed (hardened) |
| 3 | Update form could wipe gender/avatar (not exposed in the form) | DTO fields not sent default to null | FE preserves & re-sends those fields | Fixed |

### Test Evidence

| Test | Method | Result |
|---|---|---|
| Backend compiles | `dotnet build RoomHub.slnx` | 0 Errors |
| Frontend type-checks | `npx tsc -b` | exit 0 |
| Frontend bundles | `npm run build` (tsc + vite) | built OK |
| Login (seeded tenant) | `POST /api/auth/login` (tenant1@gmail.com) | succeeded, JWT issued |
| Get profile | `GET /api/profile/me` with JWT | returns the user's profile |
| Update profile | `PUT /api/profile` then re-GET | fullName/phone/DOB/address/gender persisted |
| Change password (wrong current) | `POST /api/profile/change-password` | HTTP 400 (rejected) |
| Change password (correct) | `POST /api/profile/change-password` + re-login | success; new password works |
| Auth guard | `GET /api/profile/me` without a token | HTTP 401 |

---

## Phase 05 — Summary

### Completed features
- [x] Profile backend API (view / update / change password)
- [x] Tenant Profile page wired to the API (Info + Password tabs)
- [x] Backend build + frontend type-check pass + endpoint smoke test

### Incomplete features / reason
- KYC tab (CCCD number + ID/selfie photo upload): still a demo — needs Cloudinary file upload, planned for a later task.

### Overall AI assistance (%)

| Category | % AI | % Self |
|---|---|---|
| Code | 75 | 25 |
| Documentation | 60 | 40 |
| Debug | 50 | 50 |

---

## Confirmation

I confirm that this changelog accurately reflects the actual work performed.

**Signature:** Nguyễn Hữu Triết — DE180336
