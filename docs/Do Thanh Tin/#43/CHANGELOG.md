# Changelog

## 1. Project Information

| Field | Value |
|---|---|
| Student ID | DE180794 |
| Student | Do Thanh Tin |
| Issue | #43 |
| Feature | Embed Google Maps — Room Detail Location |
| Repository | https://github.com/fptu-se-su26/prn232-su26-ai-audit-project-prn232_se18d05_group-07 |
| Completion Date | 25/07/2026 |

---

## 2. Phase Overview

| Phase | Scope | Status |
|---|---|---|
| Phase 01 | Map approach comparison & design decision | Completed |
| Phase 02 | Backend — expose location fields in detail API | Completed |
| Phase 03 | Frontend — embed map with privacy overlay & fallback | Completed |
| Phase 04 | Google Cloud setup & API key security | Completed |
| Phase 05 | Commits & audit documentation | Completed |

---

# [Phase 01] Map Approach & Design

**Date:** 25/07/2026
**Author:** Do Thanh Tin (DE180794)
**AI Support:** Claude — codebase analysis & option comparison

### Changes
- Reviewed the codebase: confirmed `Building` already has `Latitude`/`Longitude` (no migration needed) and that the public detail API did not yet return coordinates/ward/city.
- Compared Leaflet+OSM vs Google Maps Embed vs Google Maps JavaScript API.
- Decided on **Google Maps Embed**, displayed at **area level** (approximate) to protect the exact address.

---

# [Phase 02] Backend — Expose Location Fields

**Date:** 25/07/2026
**Author:** Do Thanh Tin (DE180794)
**AI Support:** Claude — DTO & mapping

### Changes
- Added `Ward`, `City`, `Latitude` (nullable), `Longitude` (nullable) to `PublicListingDetailDto` in `RoomHub.Application/Common/DTOs/Listings/PublicListingDtos.cs`.
- Mapped these fields from `Building` in `PublicListingService.GetListingDetailAsync` (`RoomHub.Application/Services/PublicListingService.cs`).
- No database migration required (columns already existed).

---

# [Phase 03] Frontend — Embed Map

**Date:** 25/07/2026
**Author:** Do Thanh Tin (DE180794)
**AI Support:** Claude — React UI & config

### Changes
- Replaced the static map mockup in `RoomHub.Frontend/src/pages/RoomDetail.tsx` with a Google Maps Embed `<iframe>` querying at district/city level (`q = "{District}, {City}, Việt Nam"`, `zoom=14`), so the exact street address is not revealed.
- Kept a privacy overlay: a decorative area circle + a "Khu vực {district}" pill + a caption explaining the exact address is shared after contacting the landlord.
- Added a **graceful fallback**: if `VITE_GOOGLE_MAPS_EMBED_KEY` is not set, the original mockup image is shown (no error).
- Added `RoomHub.Frontend/src/vite-env.d.ts` to type the env variable.

### Notes
- Verified: backend `dotnet build` = 0 errors; frontend `tsc --noEmit` = 0 errors.

---

# [Phase 04] Google Cloud Setup & Key Security

**Date:** 25/07/2026
**Author:** Do Thanh Tin (DE180794)
**AI Support:** Claude — setup guidance & key safety

### Changes
- Enabled **"Maps Embed API"** in Google Cloud (project RoomHub).
- Created an **API key** restricted to the Maps Embed API and to the HTTP referrer `http://localhost:5173/*`.
- Added `RoomHub.Frontend/.env.example` (documented, empty placeholder) and updated `RoomHub.Frontend/.gitignore` to ignore `.env`, `.env.local`, `.env.*.local`.

### Security Fix
- Detected that the real API key had been pasted into the **tracked** `.env.example`.
- **Fix:** moved the key into the gitignored `.env`; reset `.env.example` to an empty placeholder. Confirmed the committed `.env.example` contains no key and that `.env` / `appsettings.json` were never committed.

---

# [Phase 05] Commits & Documentation

**Date:** 25/07/2026
**Author:** Do Thanh Tin (DE180794)
**AI Support:** Claude — commit split & documentation

### Changes
- Split the work into 3 concern-based commits (all `Refs #43`):
  - `feat: expose ward/city/coordinates in public listing detail API`
  - `feat: add area-level location map to room detail page`
  - `chore: add frontend env config for Google Maps key`
- Added the 4 required AI-audit files under `docs/Do Thanh Tin/#43/`.
