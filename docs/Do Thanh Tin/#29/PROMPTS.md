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
| Start Date | 25/06/2026 |
| Last Updated | 27/06/2026 |

---

## 2. AI Tools Used

- [x] Cursor
- [x] Claude (via Antigravity IDE)

---

## 3. Prompt Summary Table

| No. | Date | AI Tool | Purpose | Prompt Summary | Main Result | Applied? |
|---:|---|---|---|---|---|---|
| 1 | 25/06 | Cursor | Architecture | Google login flow design for monorepo | Chose @react-oauth/google & Google.Apis.Auth | Yes |
| 2 | 26/06 | Cursor | Backend | Implement Google login in AuthController | Added GoogleLogin endpoint & user creation | Yes |
| 3 | 26/06 | Cursor | Debug | Handle InvalidJwtException for access tokens | Added HttpClient fallback to tokeninfo endpoint | Yes |
| 4 | 27/06 | Cursor | Frontend | Register context method & OAuth provider | Added loginWithGoogle method & wrapped main app | Yes |
| 5 | 27/06 | Cursor | UI | Connect login page button to Google flow | Hooked useGoogleLogin to real API call | Yes |
| 6 | 27/06 | Claude | Git | Plan commit step-by-step per SKILL.md | Created logical file-by-file commit plan | Yes |

---

## 4. Detailed Prompts

### Prompt #1 — Google Login Architecture Design

```text
How should we design Google login in a React frontend + ASP.NET Core API monorepo using Google's modern authentication library? We want a popup flow returning the token, which is then sent to the backend API, validated, and used to issue our own JWT and refresh token.
```

**Result:** Guided the choice of `@react-oauth/google` on the frontend and `Google.Apis.Auth` on the backend. This direct integration avoids complex middle-tier authorization proxies.

---

### Prompt #2 — Backend Controller Integration

```text
Implement GoogleLogin endpoint in AuthController. Validate the received token. Check if user exists, if not create them with role Tenant, then issue our own access token and refresh token.
```

**Result:** Created `POST /api/auth/google` in `AuthController.cs` and `GoogleLoginRequest` in `AuthDTOs.cs`. Wrote the logic to look up or register the user and generate standard RoomHub JWT tokens.

---

### Prompt #3 — Fallback to Tokeninfo Endpoint

```text
The frontend useGoogleLogin hook returns a standard OAuth2 Access Token instead of an ID Token (JWT) when using implicit flow. GoogleJsonWebSignature.ValidateAsync fails with InvalidJwtException. Add a fallback verification in the controller that calls Google's tokeninfo endpoint (https://oauth2.googleapis.com/tokeninfo?access_token=...) using HttpClient to verify the access token, check the client ID, extract the email/name, and proceed.
```

**Result:** Implemented `try-catch` around `GoogleJsonWebSignature.ValidateAsync`. On catching `InvalidJwtException`, it validates the token via HTTP GET to Google's `tokeninfo` API, pulls email and azp/aud, and maps it to user registration.

---

### Prompt #4 — Context & Main Provider Wiring

```text
Create a method `loginWithGoogle` in `AuthContext.tsx` to call our backend API. Also wrap the frontend entry in `main.tsx` with GoogleOAuthProvider.
```

**Result:** Updated `AuthContext.tsx` with JWT/refresh-token storage handling and exported the method. Wired `GoogleOAuthProvider` in `main.tsx` using `GOOGLE_CLIENT_ID` placeholder.

---

### Prompt #5 — Button Click Integration

```text
Update the Login.tsx page: import useGoogleLogin, trigger the login popup on button click, handle loading states during the backend API call, and navigate to the browse page upon successful authentication.
```

**Result:** Replaced mock alert with the real `useGoogleLogin` popup hook in `Login.tsx`. Added `isGoogleLoading` state to show loading indicators and disable the form during authentication.

---

## 5. Commitment

I confirm the prompts above accurately reflect the prompts and context I utilized during the development of this task.

**Signature:** Do Thanh Tin  
**Date:** 27/06/2026  
