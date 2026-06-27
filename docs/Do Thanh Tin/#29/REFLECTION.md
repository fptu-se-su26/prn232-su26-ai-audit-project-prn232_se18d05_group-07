# AI Learning Reflection

## 1. General Information

| Field | Value |
|---|---|
| Student ID | DE180794 |
| Student | Do Thanh Tin |
| Issue | #29 |
| Completion Date | 27/06/2026 |

---

## 2. Summary of AI Usage

```text
For the Google login implementation task, I utilized Cursor and Claude AI to structure the
integration. AI provided advice on using @react-oauth/google and Google.Apis.Auth.
When the frontend sent access tokens instead of ID tokens, causing InvalidJwtException, I consulted
AI to design a fallback verification mechanism querying Google's tokeninfo endpoint.
AI drafted helper code and UI integrations, which I reviewed, wired into our application's State
and Context management, and manually tested using Google logins.
```

---

## 3. Where AI Helped Most

- **Handling Token Discrepancies:** Designing the fallback logic that sends HTTP GET requests to `oauth2.googleapis.com/tokeninfo` when `GoogleJsonWebSignature` parsing fails.
- **Frontend Integration Advice:** Scaffolding the React context methods and showing how to wrap the app with `GoogleOAuthProvider`.
- **Loading State Feedback:** Providing a clean SVG spinner implementation to display inside the button during the asynchronous callback.
- **Drafting Audit Logs:** Helping structure these files according to the team's strict requirements.

---

## 4. What I Verified Myself

- **Database Inspection:** Verified that Google users are successfully persisted in ASP.NET Core Identity with the role of `Tenant`.
- **Ban Check Functionality:** Verified that marking a Google user's row as `IsBanned = true` in the DB successfully returns HTTP 403 and halts login on subsequent attempts.
- **Loading UI State:** Tested clicking the button, checking that all input fields are disabled and the loading spinner appears.
- **Clean Code Inspection:** Reviewed every code modification before commit, ensuring there are no secrets hardcoded and that `appsettings.json` only contains placeholders.
- **Git workflow:** Adhered to the `SKILL.md` rules by splitting changes into separate commits under `[DE180794]`.

---

## 5. Lessons on Transparent AI Usage

- **Validate AI Recommendations:** AI suggestions might assume ideal scenarios (e.g., that we will always receive JWT ID Tokens). Real-world implementations require testing token formats and coding robust fallback pathways.
- **Documenting over Co-Authoring:** Documenting AI prompts in audit logs maintains a neat git repository history without cluttering commits with AI co-author information.
- **Review before Commitment:** Only sign off on code and documentation after reviewing and understanding every single line, verifying that it aligns with requirements.

---

## 6. Commitment

**Signature:** [TO SIGN — Do Thanh Tin]

**Date:** [TO FILL IN]
