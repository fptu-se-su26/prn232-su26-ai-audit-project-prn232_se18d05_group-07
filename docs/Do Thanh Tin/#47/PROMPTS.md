# Prompt Log

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
| Last Updated | 25/07/2026 |

---

## 2. AI Tools Used

- [x] Claude (Claude Code)

---

## 3. Prompt Summary Table

| No. | Date | AI Tool | Purpose | Prompt Summary | Main Result | Applied? |
|---:|---|---|---|---|---|---|
| 1 | 25/07 | Claude | Design | Build map browse + "near me" | Chose Leaflet + plan; new branch | Yes |
| 2 | 25/07 | Claude | Build | Implement backend + map component | lat/lng API + MapBrowse + toggle | Yes |
| 3 | 25/07 | Claude | Testing | How/where to test the feature | Test guide + seed-coordinates SQL | Yes |
| 4 | 25/07 | Claude | Commits | Split into concern-based commits | 3 commits with Refs #47 | Yes |
| 5 | 25/07 | Claude | Docs | Draft the 4 AI-audit files | These audit documents | Yes |

---

## 4. Detailed Prompts

### Prompt #1 — Map browse feature request

```text
6. Duyệt phòng trên bản đồ + "gần tôi": trang Browse hiển thị phòng trên bản đồ,
lọc theo bán kính quanh trường/chỗ làm. Làm thêm chức năng này.
```

**Result:** AI flagged that this needs multiple pins + geolocation + radius, which the Google Embed (task #43) cannot do, and Google JS API would require billing. It recommended **Leaflet + OpenStreetMap** (free, no key/card) and laid out a plan: expose lat/lng in the list API, build a map component, add a List/Map toggle. I confirmed **Leaflet** and to use a **new branch from main**.

---

### Prompt #2 — Build it

```text
(Confirmed Leaflet + new branch) → implement the feature.
```

**Result:** Backend: added `Latitude/Longitude` to `PublicListingSummaryDto` + `MapToSummary` (no migration). Frontend: installed `leaflet`/`react-leaflet`, built `MapBrowse.tsx` (price pins, popups, "Gần tôi" geolocation, Nominatim place search, radius slider + circle + Haversine filter), and added a List/Map toggle in `Browse.tsx` that fetches a larger batch for the map. Verified both projects compile.

---

### Prompt #3 — How to test

```text
Chỉ tôi cách test. ... ý là tôi bấm vào chỗ nào để test.
```

**Result:** AI gave a step-by-step test guide: run backend + frontend, seed sample coordinates into the `Buildings` table (since there is no auto-geocoding yet), then on `/browse` click the **"Bản đồ"** toggle (next to "Sắp xếp") and test pins, popups, "Gần tôi", place search, radius slider, and filter syncing.

---

### Prompt #4 — Split into commits

```text
Bây giờ chia nhỏ từng mục cụ thể và commit giúp tôi.
```

**Result:** AI created 3 concern-based commits (all `Refs #47`): backend coordinates; Leaflet dependencies; the map-browse feature. It excluded `appsettings.json` and `.env` and verified no secret was committed.

---

### Prompt #5 — Draft audit documents

```text
Soạn giúp tôi 4 file AI audit luôn.
```

**Result:** AI drafted these four audit files under `docs/Do Thanh Tin/#47/`, describing only what was actually built. I reviewed them before signing.

---

## 5. Commitment

I confirm the prompts above accurately reflect the prompts and context I utilized during the development of this task.

**Signature:** Do Thanh Tin
**Date:** 25/07/2026
