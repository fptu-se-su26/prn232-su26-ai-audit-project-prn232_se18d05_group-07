# AI Learning Reflection

## 1. General Information

| Field | Value |
|---|---|
| Student ID | DE180794 |
| Student | Do Thanh Tin |
| Issue | #43 |
| Feature | Embed Google Maps — Room Detail Location |
| Completion Date | 25/07/2026 |

---

## 2. Summary of AI Usage

```text
For the room-detail map, I used Claude (Claude Code) to compare map providers and implement the
chosen Google Maps Embed approach at an area level for privacy. The AI first analyzed the codebase
and found that the Building entity already had Latitude/Longitude columns, so no migration was needed;
it then exposed ward/city/coordinates in the detail API and replaced the mockup with an embed map plus
a graceful fallback. It guided the Google Cloud setup and caught a real security mistake where the API
key had been placed in a git-tracked file. I reviewed every change, verified the build, and confirmed
no key or secret was committed.
```

---

## 3. Where AI Helped Most

- **Reading the data model first:** discovering the `Latitude`/`Longitude` columns already existed avoided an unnecessary database migration.
- **Honest option comparison:** laying out Leaflet vs Google Embed vs Google JS API with cost/effort trade-offs, and raising the privacy angle (show approximate area, not the exact address).
- **Graceful fallback:** the map shows a mockup instead of breaking when the API key is absent.
- **Key security catch:** noticing the API key had been pasted into the tracked `.env.example` and moving it to the gitignored `.env` before any commit.
- **Clean commit split:** separating backend / frontend UI / config into focused commits, excluding secrets.

---

## 4. What I Verified Myself

- **Build:** backend `dotnet build` = 0 errors; frontend `tsc --noEmit` = 0 errors.
- **Privacy behavior:** the embed queries at district/city level, so the exact street address is not pinpointed.
- **Fallback:** with an empty `VITE_GOOGLE_MAPS_EMBED_KEY`, the page still renders the mockup without error.
- **No secret leak:** confirmed `.env` and `appsettings.json` were not committed, and the committed `.env.example` has an empty key.
- **API key restriction:** restricted the key to the Maps Embed API and to `http://localhost:5173/*`.

---

## 5. Lessons on Transparent AI Usage

- **Verify AI claims:** the AI initially said the Embed API needs no billing; in reality Google Maps Platform requires a billing account. Checking against the real console mattered.
- **Guard secrets by default:** `.env.example` is committed and must stay a placeholder; real keys belong only in the gitignored `.env`.
- **Check the data model before adding schema:** reusing existing columns kept the change small and migration-free.
- **Documenting over co-authoring:** AI usage is recorded in these audit files, keeping the git history clean per the team's `SKILL.md` convention.

---

## 6. Commitment

I have reviewed and understood every part of this feature and these documents, and they reflect what was actually done.

**Signature:** [Ký sau khi tự review — Do Thanh Tin]

**Date:** 25/07/2026
