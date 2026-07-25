# AI Audit Log

## 1. General Information

| Field | Value |
|---|---|
| Course | C# Programming |
| Course Code | PRN232 |
| Class | SE18D05 |
| Semester | SU26 |
| Assignment / Project | RoomHub - Rental Room Management Platform |
| Student / Group | Do Thanh Tin / Group 07 |
| Student ID | DE180794 |
| Instructor | Mr. Le Thien Nhat Quang |
| Start Date | 25/07/2026 |
| Completion Date | 25/07/2026 |

---

## 2. AI Tools Used

- [ ] ChatGPT
- [ ] Gemini
- [x] Claude (Claude Code)
- [ ] GitHub Copilot
- [ ] Cursor
- [ ] Antigravity
- [ ] Perplexity
- [ ] Microsoft Copilot
- [ ] Other: ....................................

---

## 3. Purpose of AI Usage

- Design a map-based browsing experience on the listings page: view rooms as pins on an interactive map, find rooms "near me", and filter by radius around a school/workplace.
- Choose a suitable map technology given the project's constraints (avoid Google Maps billing).
- Expose room coordinates from the public listing API without a database migration.
- Build the interactive map component (pins, popups, geolocation, place search, radius circle) and integrate a List/Map toggle into the existing Browse page.
- Split the work into clean, concern-based commits and keep secrets out of git.

### Summary of AI Usage Goals

```text
I used Claude (Claude Code) to design and build a map-browse feature for RoomHub. Because Google Maps
Platform requires a billing account and the Embed API cannot render multiple pins or a "near me" radius,
the AI recommended Leaflet + OpenStreetMap (free, no key, no card). It exposed room coordinates in the
list API (reusing the Building Latitude/Longitude columns, no migration), built a MapBrowse component
with price pins, popups, browser geolocation, place search (Nominatim), and a radius filter, and added
a List/Map toggle to the Browse page. I confirmed the technology choice, verified the build compiled,
and validated that no secret was committed.
```

---

## 4. Detailed Log of Each AI Use

### Session 1 — Technology choice & plan

| Item | Content |
|---|---|
| Date | 25/07/2026 |
| Tool | Claude (Claude Code) |
| Purpose | Decide how to build a multi-pin browse map |

**Role:** Frontend/Tech advisor
**Context:** Browse page lists rooms from `/api/public/listings`. A prior task (#43) embedded a single-place Google Map on the detail page, but Google Maps Platform needs billing.
**Request:** Build map-based browsing with pins, "near me", and radius filter.
**Constraints:** Avoid Google billing; fit the existing stack; prefer no DB migration.
**Expected Output:** A recommended library + a concrete plan.

**Result:** AI explained that Google Embed cannot do multi-pin/near-me and Google JS API needs billing, so it recommended **Leaflet + OpenStreetMap** (free, no key/card). I confirmed Leaflet and chose to work on a **new branch from main** (`feature/de180794-map-browse`).

---

### Session 2 — Backend: expose coordinates

| Item | Content |
|---|---|
| Date | 25/07/2026 |
| Tool | Claude (Claude Code) |
| Purpose | Return lat/lng in the list API |

**Result:** Added `Latitude`/`Longitude` to `PublicListingSummaryDto` and mapped them from `Building` in `PublicListingService.MapToSummary`. No migration needed (the columns already exist on `Building`).

---

### Session 3 — Frontend: MapBrowse component

| Item | Content |
|---|---|
| Date | 25/07/2026 |
| Tool | Claude (Claude Code) |
| Purpose | Build the interactive map and integrate it |

**Result:**
- Installed `leaflet`, `react-leaflet` (v5, compatible with React 19), and `@types/leaflet`.
- Built `components/MapBrowse.tsx`: orange price pins (`L.divIcon`), popups with image/price and a "Xem chi tiết" link to `/room/:id`, a **"Gần tôi"** button using the browser Geolocation API, a **place search** box that geocodes via Nominatim (OSM, free), and a **radius slider (1–10 km)** drawing a circle and filtering rooms by Haversine distance.
- Integrated a **List/Map toggle** into `Browse.tsx`; the map fetches a larger batch (`pageSize=100`) so all matching rooms can be plotted, and it stays in sync with the existing filters.
- Verified: backend `dotnet build` = 0 errors; frontend `tsc --noEmit` = 0 errors.

---

### Session 4 — Commits

| Item | Content |
|---|---|
| Date | 25/07/2026 |
| Tool | Claude (Claude Code) |
| Purpose | Split into concern-based commits |

**Result:** Created 3 commits (all `Refs #47`): backend coordinates, Leaflet dependencies, and the map-browse feature. Confirmed `.env` and `appsettings.json` were not committed.

---

## 5. Commitment

I confirm the prompts and logs above accurately reflect what was actually done for this task. I confirmed the technology choice, verified the build, and checked that no secret was committed.

**Student Name:** Do Thanh Tin
**Student ID:** DE180794
**Date:** 25/07/2026
