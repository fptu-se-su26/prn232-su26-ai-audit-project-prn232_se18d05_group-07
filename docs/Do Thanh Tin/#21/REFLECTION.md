# AI Learning Reflection

## 1. General Information

| Field | Value |
|---|---|
| Student ID | DE180794 |
| Student | Do Thanh Tin |
| Issue | #21 |
| Completion Date | 06/06/2026 |

---

## 2. Summary of AI Usage

```text
For the rental post moderation task, I used Cursor AI throughout — from codebase exploration,
debugging moderation on publish, designing the 3-stage pipeline, to implementing APIs and UI.
AI helped me quickly scaffold Clean Architecture code following team conventions, but I always
ran dotnet run, tested listing publish, checked HTTP 500 errors, and verified DB migrations myself.
When AI suggested a Groq Vision model that caused BadRequest, I worked with AI to try alternatives
and confirmed fixes via real logs. I also learned to split commits by feature and document AI usage
honestly in audit files instead of using Co-Authored-By in git history.
```

---

## 3. Where AI Helped Most

- **Designing the moderation pipeline** (rules + heuristic + two AI providers).
- **Fast debugging** of DI issues, missing DB columns, and port 5143 file locks.
- **Mirroring client/server validation** for immediate feedback at form step 2.
- **Drafting audit documentation** following the team template.

---

## 4. What I Verified Myself

- Tested admin/owner/tenant accounts locally.
- Ran `dotnet ef database update` and confirmed `HiddenByOwner` column exists.
- Adjusted minimum price threshold to 500,000 VND per business requirements.
- Reviewed every file before commit; excluded `.vs/` and secrets from git.
- Followed SKILL.md and split commits with `[DE180794]` prefix.

---

## 5. Lessons on Transparent AI Usage

- Declare AI usage in **audit files**, not via `Co-Authored-By` — keeps git history clean.
- Only document what was **actually done**; do not fabricate prompts or outcomes.
- AI drafts content; I **sign the commitment** only after I understand and can test it.

---

## 6. Commitment

**Signature:** [TO SIGN — Do Thanh Tin]

**Date:** [TO FILL IN]
