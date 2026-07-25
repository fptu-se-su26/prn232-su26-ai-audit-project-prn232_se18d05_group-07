# AI Learning Reflection

## 1. General Information

| Field | Value |
|---|---|
| Student ID | DE180794 |
| Student | Do Thanh Tin |
| Issue | #47 |
| Feature | Map Browse — rooms on a map with "near me" & radius filter |
| Completion Date | 25/07/2026 |

---

## 2. Summary of AI Usage

```text
For the map-browse feature, I used Claude (Claude Code) to pick a map technology and build it. Because
Google Maps Platform requires billing and its Embed API cannot show multiple pins or a "near me" radius,
the AI recommended Leaflet + OpenStreetMap, which is free and needs no key or card. It exposed room
coordinates in the list API (reusing existing Building columns, no migration) and built a MapBrowse
component with price pins, popups, browser geolocation, place search (Nominatim), and a radius filter,
then added a List/Map toggle to the Browse page. I confirmed the technology decision, verified the build,
and checked that no secret was committed.
```

---

## 3. Where AI Helped Most

- **Right tool for the constraint:** recognizing that Google Embed can't do multi-pin/near-me and Google JS needs billing, then choosing Leaflet + OSM (free, no card) — the correct fit after the billing issue in task #43.
- **Migration-free backend:** reusing the existing `Building.Latitude/Longitude` columns instead of adding schema.
- **Complete map UX:** price pins, popups linking to the detail page, geolocation "near me", place search via a free geocoder, and a radius circle with client-side Haversine filtering.
- **Clean integration:** a List/Map toggle that keeps the map in sync with the existing filters, with a separate larger fetch so all matches are plotted.

---

## 4. What I Verified Myself

- **Build:** backend `dotnet build` = 0 errors; frontend `tsc --noEmit` = 0 errors.
- **Library compatibility:** confirmed `react-leaflet` v5 works with React 19.
- **Data dependency:** understood that pins only appear for rooms whose building has coordinates, and tested by seeding sample coordinates into the `Buildings` table.
- **Filter syncing:** changing price/district/amenities updates the pins on the map.
- **No secret leak:** confirmed `.env` and `appsettings.json` were not committed.

---

## 5. Lessons on Transparent AI Usage

- **Match the tool to real constraints:** a free, open library (Leaflet/OSM) can be the better choice than a paid platform when the requirements are multi-pin + geolocation + radius.
- **Check the data, not just the code:** a feature can compile and still show nothing if the underlying data (coordinates) isn't populated — the geocoding gap is a real follow-up task.
- **Reuse existing schema:** the `Building` coordinate columns avoided a migration.
- **Documenting over co-authoring:** AI usage is recorded in these audit files, keeping the git history clean per the team's `SKILL.md` convention.

---

## 6. Commitment

I have reviewed and understood every part of this feature and these documents, and they reflect what was actually done.

**Signature:** [Ký sau khi tự review — Do Thanh Tin]

**Date:** 25/07/2026
