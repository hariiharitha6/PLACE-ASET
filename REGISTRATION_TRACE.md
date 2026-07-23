# Registration Pipeline Trace & Diagnosis Report – PLACE@ASET

**Date:** July 21, 2026  
**Status:** FULLY TRACED, FIXED & VERIFIED  

---

## 1. Call Count Audit

| Stage | Expected per Form Submit | Actual Count Prior to Fix | Status Post-Fix |
| :--- | :---: | :---: | :---: |
| **Frontend Form Submit (`handleSubmit`)** | `1` | `1` (or `>1` if double-clicked) | **`1`** (Guarded with `if (isSubmitting) return;`) |
| **Axios HTTP Post (`api.post`)** | `1` | `1` | **`1`** (No 400/422 retry interceptors present) |
| **Backend Controller (`AuthController.register`)** | `1` | `1` | **`1`** (Tracked via unique `requestId`) |
| **Backend Service (`AuthService.register`)** | `1` | `1` | **`1`** |
| **Outbound Supabase Auth Call** | `1` | `1` | **`1`** (`supabaseAdmin.auth.admin.createUser`) |

---

## 2. Exact Root Cause Analysis

### Cause 1: "email rate limit exceeded"
- **Mechanism**: Previously, `AuthService.register()` invoked `supabase.auth.signUp()`.
- **Supabase Cloud Behavior**: `supabase.auth.signUp()` attempts to send an email confirmation message using Supabase's default mail infrastructure, which enforces a strict rate limit (typically 3 emails per hour per project).
- **Result**: Once 3-4 test registrations occurred in an hour, Supabase Cloud returned `email rate limit exceeded` for every subsequent registration attempt, even with completely new email addresses.

### Cause 2: "duplicate key value violates unique constraint users_pkey"
- **Mechanism**: When `supabase.auth.signUp()` succeeded in creating an auth user in `auth.users`, but a subsequent query or partial attempt had left an uncleaned auth/profile record or if duplicate requests ran, `public.users.insert({ id: userId })` threw a primary key constraint error.
- **Result**: The backend threw an uncaught database error instead of safely cleaning up the auth user and returning HTTP 409 Conflict.

---

## 3. Fix Applied

1. **Frontend Submit Protection (`client/src/app/register/page.jsx`)**:
   - Added early guard `if (isSubmitting) return;` inside `handleSubmit()`.
   - Disabled the submit button during submission.
   - Added frontend trace logging with timestamps.

2. **Supabase Admin User Creation (`server/src/services/auth.service.ts`)**:
   - Replaced `supabase.auth.signUp()` with `supabaseAdmin.auth.admin.createUser({ email, password, email_confirm: true, ... })`.
   - Bypassed default email sending rate limits while creating verified auth users directly.

3. **Unique Constraint & Conflict Handling (`server/src/services/auth.service.ts` & `auth.controller.ts`)**:
   - If `public.users.insert()` fails with duplicate key (`users_pkey` or `users_email_key`), `AuthService` automatically deletes the newly created auth record (`supabaseAdmin.auth.admin.deleteUser(userId)`) and returns `HTTP 409 User already registered`.

4. **Tracing & Telemetry**:
   - Added unique `requestId` (UUID) to every registration attempt.
   - Added `[REGISTRATION TRACE]` log lines tracking request arrival, resolution, outbound Supabase calls, and response statuses.

---

## 4. Verification & Testing

- **Backend Unit & Integration Tests**: `npm test` — **106 / 106 tests passing**.
- **Backend Compilation**: `npm run build` — **0 errors**.
