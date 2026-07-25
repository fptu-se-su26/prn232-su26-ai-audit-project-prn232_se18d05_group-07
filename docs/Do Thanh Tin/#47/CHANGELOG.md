# Changelog

## 1. Project Information

| Field | Value |
|---|---|
| Student ID | DE180794 |
| Student | Do Thanh Tin |
| Issue | #47 |
| Feature | Map Browse — rooms on a map with "near me" & radius filter |
| Repository | https://github.com/fptu-se-su26/prn232-su26-ai-audit-project-prn232_se18d05_group-07 |
| Completion Date | 25/07/2026 |

---

## 2. Phase Overview

| Phase | Scope | Status |
|---|---|---|
| Phase 01 | Technology choice (Leaflet vs Google) & plan | Completed |
| Phase 02 | Backend — expose coordinates in list API | Completed |
| Phase 03 | Frontend — MapBrowse component & Browse integration | Completed |
| Phase 04 | Commits & audit documentation | Completed |

---

# [Phase 01] Technology Choice & Plan

**Date:** 25/07/2026
**Author:** Do Thanh Tin (DE180794)
**AI Support:** Claude — option analysis

### Changes
- Determined that Google Maps Embed (used in #43) cannot render multiple pins or a "near me" radius, and Google Maps JS API requires a billing account.
- Chose **Leaflet + OpenStreetMap** (free, no API key, no billing).
- Created a new branch `feature/de180794-map-browse` from `main`.

---

# [Phase 02] Backend — Expose Coordinates

**Date:** 25/07/2026
**Author:** Do Thanh Tin (DE180794)
**AI Support:** Claude — DTO & mapping

### Changes
- Added `Latitude` (nullable) and `Longitude` (nullable) to `PublicListingSummaryDto` in `RoomHub.Application/Common/DTOs/Listings/PublicListingDtos.cs`.
- Mapped both from `Building` in `PublicListingService.MapToSummary` (`RoomHub.Application/Services/PublicListingService.cs`).
- No database migration required (columns already exist on `Building`).

---

# [Phase 03] Frontend — Map Browse

**Date:** 25/07/2026
**Author:** Do Thanh Tin (DE180794)
**AI Support:** Claude — React map component & integration

### Changes
- Installed `leaflet`, `react-leaflet` (v5, React 19 compatible) and `@types/leaflet`.
- Added `RoomHub.Frontend/src/components/MapBrowse.tsx`:
  - OpenStreetMap tiles via Leaflet.
  - Orange **price pins** (`L.divIcon`) for each room; a popup with image, price, area/district, and a **"Xem chi tiết"** button navigating to `/room/:id`.
  - **"Gần tôi"** button using the browser Geolocation API to center the map on the user.
  - **Place search** box that geocodes a school/workplace via **Nominatim** (OSM, free, no key).
  - **Radius slider (1–10 km)** drawing a circle and filtering rooms by Haversine distance (client-side).
- Updated `RoomHub.Frontend/src/pages/Browse.tsx`:
  - Added a **List / Map toggle** next to the sort control.
  - Added `latitude`/`longitude` to the `Room` interface.
  - Added a separate map fetch (`pageSize=100`, page 1) so all matching rooms can be plotted; the map stays in sync with the existing filters.

### Notes
- Verified: backend `dotnet build` = 0 errors; frontend `tsc --noEmit` = 0 errors.
- **Known limitation:** only rooms whose `Building` has coordinates appear on the map. There is no automatic geocoding on building creation yet, so coordinates must be populated (manually or by a future geocoding step) for pins to show.

---

# [Phase 04] Commits & Documentation

**Date:** 25/07/2026
**Author:** Do Thanh Tin (DE180794)
**AI Support:** Claude — commit split & documentation

### Changes
- Split the work into 3 concern-based commits (all `Refs #47`):
  - `feat: expose room coordinates in public listing API`
  - `chore: add leaflet dependencies for map view`
  - `feat: add map browse with near-me and radius filter`
- Added the 4 required AI-audit files under `docs/Do Thanh Tin/#47/`.
