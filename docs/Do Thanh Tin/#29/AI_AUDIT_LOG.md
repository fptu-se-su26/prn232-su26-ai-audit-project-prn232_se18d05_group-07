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
| Start Date | 25/06/2026 |
| Completion Date | 27/06/2026 |

---

## 2. AI Tools Used

- [ ] ChatGPT
- [ ] Gemini
- [x] Claude (via Antigravity IDE)
- [ ] GitHub Copilot
- [x] Cursor
- [ ] Antigravity
- [ ] Perplexity
- [ ] Microsoft Copilot
- [ ] Other: ....................................

---

## 3. Purpose of AI Usage

- Design a secure Google OAuth2 flow integrating React frontend and ASP.NET Core backend.
- Set up `@react-oauth/google` on the frontend to capture authentication responses.
- Implement the backend endpoint `/api/auth/google` with standard JWT token verification.
- Add fallback verification via Google's `tokeninfo` endpoint to support access tokens when client sends non-JWT formats.
- Implement auto-registration for first-time Google users, assigning them the default "Tenant" role, and enforcing the ban system check.
- Formulate a clean, step-by-step commit checklist aligned with the team's Git workflow.

### Summary of AI Usage Goals

```text
I used Cursor and Claude AI to outline the architecture for Google social login integration,
develop the backend AuthController endpoint with fallback tokeninfo/userinfo verification,
integrate frontend OAuth contexts and Login page button actions, debug token format discrepancies,
and structure the commits cleanly under the team's workflow constraints.
```

---

## 4. Detailed Log of Each AI Use

### Session 1 — Architectural Design of Google Login

| Item | Content |
|---|---|
| Date | 25/06/2026 |
| Tool | Cursor |
| Purpose | Determine the best library and flow for React + .NET Web API Google integration |

**Role:** Solution Architect  
**Context:** Monorepo containing React + Vite and .NET Web API with custom JWT Identity.  
**Request:** How should we structure Google authentication? We need the frontend to trigger a Google sign-in popup, get the token, and send it to our API backend. The backend should check the token, find/create the user, and issue our backend JWT and refresh tokens.  
**Constraints:** Avoid third-party authentication proxies like Firebase or Auth0. Do it directly.  
**Expected Output:** Recommended library packages and step-by-step sequence flow.  

```text
How should we design Google login in a React frontend + ASP.NET Core API monorepo using Google's modern authentication library? We want a popup flow returning the token, which is then sent to the backend API, validated, and used to issue our own JWT and refresh token.
```

**Result:** AI recommended `@react-oauth/google` on the frontend for simple implicit popup flows and `Google.Apis.Auth` on the backend for validation. It outlined the token validation sequence.

---

### Session 2 — Backend Endpoint & Access Token Fallback

| Item | Content |
|---|---|
| Date | 26/06/2026 |
| Tool | Cursor / Claude |
| Purpose | Write backend endpoint with validation robust enough to handle ID tokens and access tokens |

```text
Implement GoogleLogin endpoint in AuthController. Validate the received token. Note: if the frontend sends an OAuth2 access token instead of a JWT ID token, we need a fallback using Google's tokeninfo endpoint (https://oauth2.googleapis.com/tokeninfo?access_token=...) to authenticate. Check if user exists, if not create them with role Tenant, then issue our own access token and refresh token.
```

**Result:** Created the `POST /api/auth/google` endpoint in `AuthController.cs`. Configured the verification logic: it first tries validating as an ID Token (JWT) via `GoogleJsonWebSignature.ValidateAsync`. On catching `InvalidJwtException`, it gracefully falls back to sending an HTTP request to Google's `tokeninfo` endpoint to verify the token as an access token, resolving names via `userinfo` as needed. If valid, it maps or creates the user in ASP.NET Core Identity.

---

### Session 3 — Frontend context and UI integration

| Item | Content |
|---|---|
| Date | 27/06/2026 |
| Tool | Cursor |
| Purpose | Implement Frontend OAuth Provider, context integration, and login button UI |

```text
Integrate @react-oauth/google in main.tsx and Login.tsx. Add a method loginWithGoogle in AuthContext that calls POST /api/auth/google. Replaces the placeholder Google button in Login.tsx with the actual Google login button, showing a loading indicator during the API call.
```

**Result:** Wrapped `App` in `GoogleOAuthProvider` inside `main.tsx`. Added `loginWithGoogle` in `AuthContext.tsx` to call `/api/auth/google`. Updated `Login.tsx` to use the `useGoogleLogin` hook, handled the button loading/processing states, and integrated GSI script in `index.html`.

---

## 5. Commitment

I confirm the prompts and logs above accurately reflect what was actually done for this task.

**Student Name:** Do Thanh Tin  
**Student ID:** DE180794  
**Date:** 27/06/2026  
