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

- Design the "Geographic location map" section for the room detail page, replacing the static mockup image.
- Compare map options (Leaflet + OpenStreetMap vs Google Maps Embed vs Google Maps JavaScript API) and pick one that fits the stack and budget.
- Expose the needed location fields (ward, city, latitude, longitude) from the public listing detail API without a database migration.
- Implement the Google Maps Embed map at **area level** (privacy: do not reveal the exact street address), with a graceful fallback when no API key is configured.
- Guide the Google Cloud Console setup: enable "Maps Embed API", create and restrict an API key.
- Keep the API key out of version control and split the work into clean, concern-based commits.

### Summary of AI Usage Goals

```text
I used Claude (Claude Code) to design and build the room-detail location map. The AI analyzed the
codebase (finding that the Building entity already had Latitude/Longitude columns, so no migration
was needed), compared map providers, and implemented the chosen Google Maps Embed approach at an
area level for privacy, with a mockup fallback. It also guided the Google Cloud setup and caught a
security mistake where the real API key was pasted into the tracked .env.example instead of the
gitignored .env. I reviewed each decision, verified the build compiled, and confirmed no key/secret
was committed.
```

---

## 4. Detailed Log of Each AI Use

### Session 1 — Map approach & design

| Item | Content |
|---|---|
| Date | 25/07/2026 |
| Tool | Claude (Claude Code) |
| Purpose | Decide how to build the room-detail map |

**Role:** Frontend/Tech advisor
**Context:** Room detail page currently shows a static mockup image with a floating "Khu vực {district}" pill. React 19 + Vite + Tailwind.
**Request:** Propose how to build the location map so it is suitable and modern for the site.
**Constraints:** Fit the existing stack; prefer no DB migration; consider cost.
**Expected Output:** A comparison of options with a recommendation.

**Result:** AI found that `Building` already has `Latitude`/`Longitude` columns (no migration needed), that the public detail API did not yet return coordinates/ward/city, and compared three options (Leaflet+OSM, Google Maps Embed, Google Maps JS API). I chose **Google Maps Embed** with an **area-level (approximate) display** for privacy.

---

### Session 2 — Implementation

| Item | Content |
|---|---|
| Date | 25/07/2026 |
| Tool | Claude (Claude Code) |
| Purpose | Build the backend field exposure + frontend map |

**Result:**
- **Backend:** added `Ward`, `City`, `Latitude`, `Longitude` to `PublicListingDetailDto` and mapped them in `PublicListingService.GetListingDetailAsync` (no migration).
- **Frontend:** replaced the mockup in `RoomDetail.tsx` with a Google Maps Embed `<iframe>` querying at **district/city level** (`q = "{District}, {City}, Việt Nam"`) so the exact address is not revealed, kept a decorative area circle + "Khu vực" pill overlay + a privacy caption, and added a **graceful fallback** to the mockup image when no key is set.
- **Config:** added `vite-env.d.ts` typing, `.env.example`, and gitignored `.env`.
- Verified: backend `dotnet build` = 0 errors; frontend `tsc --noEmit` = 0 errors.

---

### Session 3 — Google Cloud setup & key security

| Item | Content |
|---|---|
| Date | 25/07/2026 |
| Tool | Claude (Claude Code) |
| Purpose | Enable the API, create/restrict a key, keep it safe |

**Result:** AI guided enabling **"Maps Embed API"**, creating an **API key** restricted to the Maps Embed API and to the HTTP referrer `http://localhost:5173/*`. It also **corrected an earlier inaccurate claim** that the Embed API needs no billing (Google Maps Platform now requires a billing account) and, importantly, caught that the real key had been pasted into the tracked `.env.example`; it moved the key to the gitignored `.env` and reset `.env.example` to an empty placeholder. Commits were verified to contain no key or secret.

---

## 5. Commitment

I confirm the prompts and logs above accurately reflect what was actually done for this task. I reviewed each decision, verified the build, and confirmed no API key or secret was committed.

**Student Name:** Do Thanh Tin
**Student ID:** DE180794
**Date:** 25/07/2026
