# Changelog

## 1. Project Information

| Field | Value |
|---|---|
| Student ID | DE180794 |
| Student | Do Thanh Tin |
| Issue | #29 |
| Repository | https://github.com/fptu-se-su26/prn232-su26-ai-audit-project-prn232_se18d05_group-07 |
| Completion Date | 27/06/2026 |

---

## 2. Phase Overview

| Phase | Scope | Status |
|---|---|---|
| Phase 01 | Package installations & provider setup | Completed |
| Phase 02 | Backend AuthController endpoint & DTOs | Completed |
| Phase 03 | Frontend AuthContext & Login Page button integration | Completed |
| Phase 04 | Audit documentation & Git commit workflow | Completed |

---

# [Phase 01] Package Setup & Configuration

**Date:** 25/06/2026  
**Author:** Do Thanh Tin (DE180794)  
**AI Support:** Cursor — dependency advice  

### Changes
- Installed NuGet package `Google.Apis.Auth` (v1.75.0) in `RoomHub.Backend/RoomHub.API`.
- Installed npm package `@react-oauth/google` in `RoomHub.Frontend`.
- Added authentication config block `Authentication:Google` in `RoomHub.API/appsettings.json`.
- Added Google GSI script link in `RoomHub.Frontend/index.html`.
- Wrapped application in `GoogleOAuthProvider` inside `RoomHub.Frontend/src/main.tsx`.

---

# [Phase 02] Backend Authentication API

**Date:** 26/06/2026  
**Author:** Do Thanh Tin (DE180794)  
**AI Support:** Cursor / Claude — endpoint implementation  

### Changes
- Created DTO class `GoogleLoginRequest` containing `IdToken` in `AuthDTOs.cs`.
- Implemented `POST /api/auth/google` endpoint in `AuthController.cs` to process external Google authentication.
- Implemented token verification mechanism: first attempts to validate as a JWT ID token.
- Handles automated user creation (assigning default `Tenant` role) if email is not registered in the system.
- Implemented check for blocked status (`IsBanned`), returning HTTP 403 if user is banned.
- Generates standard JWT token and refresh token responses for validated users.

### Bugs Fixed
- Resolved `InvalidJwtException` thrown when handling standard Google OAuth2 access tokens.
- **Fix:** Implemented catch fallback that sends HTTP request to `https://oauth2.googleapis.com/tokeninfo?access_token=...` to verify token authenticity and get profile details.

---

# [Phase 03] Frontend Integration

**Date:** 27/06/2026  
**Author:** Do Thanh Tin (DE180794)  
**AI Support:** Cursor — front-end integration  

### Changes
- Implemented `loginWithGoogle` function in `AuthContext.tsx` to call backend endpoint and store JWT token & user information to local storage.
- Integrated `useGoogleLogin` hook from `@react-oauth/google` in `Login.tsx`.
- Linked click event of Google button to trigger Google popup window.
- Added `isGoogleLoading` state, disabling input form elements and displaying a spinner while request is in-flight.
- Handled errors to display user-friendly message banner.

---

# [Phase 04] Documentation & Git Commit

**Date:** 27/06/2026  
**Author:** Do Thanh Tin (DE180794)  
**AI Support:** Claude — documentation structures  

### Changes
- Formulated 4 required AI Audit markdown logs under `docs/Do Thanh Tin/#29/`.
- Standardized git commits into 4 separate commits divided by concern.
- Linked all commits to GitHub Issue `#29`.
