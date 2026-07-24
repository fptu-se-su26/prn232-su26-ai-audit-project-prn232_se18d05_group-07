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
| 1 | 25/07 | Claude | Design | Propose how to build the room-detail map | Compared 3 options; chose Google Embed + area-level | Yes |
| 2 | 25/07 | Claude | Build | Implement the chosen map | Backend fields + Embed iframe + fallback | Yes |
| 3 | 25/07 | Claude | Setup | Guide Google Cloud (enable API, create key) | Enabled Maps Embed API, restricted key | Yes |
| 4 | 25/07 | Claude | Security | Keep key out of git, split commits | Moved key to .env; 3 concern-based commits | Yes |
| 5 | 25/07 | Claude | Docs | Draft the 4 AI-audit files per SKILL.md | These audit documents | Yes |

---

## 4. Detailed Prompts

### Prompt #1 — Map design proposal

```text
Hiện tại tôi cần làm cái vị trí địa lý bản đồ ở trong trang xem phòng chi tiết.
Tôi cần bạn đề xuất cho tôi nên làm map này như nào để phù hợp và tân tiến với web của tôi.
```

**Result:** AI inspected the codebase, reported that `Building` already has `Latitude`/`Longitude` (no migration needed) but the public detail API does not expose coordinates/ward/city, and compared Leaflet+OSM vs Google Maps Embed vs Google Maps JS API. It also raised a privacy design point (show approximate area, not the exact address). I chose **Google Maps Embed** + **area-level display**.

---

### Prompt #2 — Approve and build

```text
ok
```

**Result:** AI implemented the feature: backend added `Ward/City/Latitude/Longitude` to `PublicListingDetailDto` and the service mapping; frontend replaced the mockup in `RoomDetail.tsx` with a Google Maps Embed iframe querying at district/city level, kept a privacy overlay (area circle + "Khu vực" pill + caption), and added a mockup fallback. It added `vite-env.d.ts`, `.env.example`, and gitignored `.env`, then verified both projects compile.

---

### Prompt #3 — Google Cloud setup guidance

```text
(Screenshots) cái nào? / nhập cái gì vào? / điền như nào? / cho tôi link
```

**Result:** AI guided me to enable **"Maps Embed API"** (not the SDKs / JS API / Places), gave the direct Credentials link, and specified the key form: select API restriction = Maps Embed API, Application restrictions = Websites with referrer `http://localhost:5173/*`, and do not attach a service account. It also corrected its earlier claim that Embed needs no billing — Google Maps Platform now requires a billing account.

---

### Prompt #4 — Split into commits (with key-safety fix)

```text
OK bây giờ hiện tại tôi muốn chia nhỏ ra thành các lượt commit khác nhau.
... bạn thực hiện các commit trên giúp tôi
```

**Result:** AI noticed the real API key had been pasted into the tracked `.env.example`, moved it to the gitignored `.env`, and reset `.env.example` to an empty placeholder. It then created 3 concern-based commits (backend API fields / frontend map UI / env config) with `Refs #43`, explicitly excluding `appsettings.json` and `.env`, and verified no secret was committed.

---

### Prompt #5 — Draft audit documents

```text
Viết các file trong docs Do Thanh Tin.
```

**Result:** AI drafted these four audit files under `docs/Do Thanh Tin/#43/`, describing only what was actually built. I reviewed them before signing.

---

## 5. Commitment

I confirm the prompts above accurately reflect the prompts and context I utilized during the development of this task.

**Signature:** Do Thanh Tin
**Date:** 25/07/2026
