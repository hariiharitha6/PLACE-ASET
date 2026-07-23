# Authentication Routing Audit Report – PLACE@ASET

**Date:** July 20, 2026  
**Status:** AUDITED, AUDIT PASSED & VERIFIED  

---

## 1. Audit Analysis & Findings

### Task 1: Route Location Definition
- Endpoint `POST /api/v1/auth/register` is defined in [`server/src/routes/v1/auth.routes.ts`](file:///c:/Users/harii/Downloads/PLACE@ASET/server/src/routes/v1/auth.routes.ts) and mounted under `/api/v1/auth` in [`server/src/routes/v1/index.ts`](file:///c:/Users/harii/Downloads/PLACE@ASET/server/src/routes/v1/index.ts).

### Task 2 & 3: Middleware Audit & Root Cause
- All authentication checks are performed by `verifyJWT` located in [`server/src/middleware/auth.ts`](file:///c:/Users/harii/Downloads/PLACE@ASET/server/src/middleware/auth.ts).
- Previously, `verifyJWT` was attached to `POST /auth/reset-password` in `auth.routes.ts`. Additionally, if global routers or misplaced imports included `verifyJWT` before mounting public sub-routers, unauthenticated auth requests were blocked.
- Refactored `auth.routes.ts` and `auth.controller.ts` so that public authentication routes operate independently of `verifyJWT`.

---

## 2. Changes Implemented

### Public Auth Endpoints (Unprotected)
The following authentication endpoints are explicitly configured **WITHOUT** `verifyJWT`:
1. `POST /api/v1/auth/register` — Public registration endpoint.
2. `POST /api/v1/auth/login` — Public login endpoint.
3. `POST /api/v1/auth/forgot-password` — Password recovery request.
4. `POST /api/v1/auth/reset-password` — Password reset endpoint (token passed in body/header).
5. `POST /api/v1/auth/verify-email` — Public email verification endpoint.
6. `POST /api/v1/auth/refresh` — Refresh token endpoint (cookie or body token).

### Protected Auth Endpoint
1. `POST /api/v1/auth/logout` — Requires active user JWT (`verifyJWT`).

### Protected Application Endpoints
All protected feature endpoints retain mandatory `verifyJWT` middleware:
- `/api/v1/users` (`/profile`, `/preferences`)
- `/api/v1/dashboard`
- `/api/v1/questions`
- `/api/v1/challenges`
- `/api/v1/practice`
- `/api/v1/leaderboard`
- `/api/v1/resources`
- `/api/v1/community`
- `/api/v1/logs`
- `/api/v1/ai`

---

## 3. Final Routing Diagram

```
                              [ Incoming HTTP Request ]
                                          │
                                          ▼
                              [ Express App Middleware ]
                       (Helmet, CORS, Body Parsers, Rate Limiter)
                                          │
                                          ▼
                                [ /api/v1 Router ]
                                          │
                ┌─────────────────────────┴─────────────────────────┐
                ▼                                                   ▼
       [ /auth Public Routes ]                           [ Protected Sub-Routers ]
  • POST /auth/register                                  (Uses router.use(verifyJWT))
  • POST /auth/login                                                │
  • POST /auth/forgot-password                            ┌─────────┴─────────┐
  • POST /auth/reset-password                             ▼                   ▼
  • POST /auth/verify-email                         /dashboard          /questions
  • POST /auth/refresh                              /challenges         /community
        (NO verifyJWT)                              /users              /resources
                │                                   /practice           /logs & /ai
                ▼                                         │
        [ Controller Logic ]                              ▼
                                                [ verifyJWT Middleware ]
                                                Checks Bearer Token
                                                          │
                                             ┌────────────┴────────────┐
                                             ▼                         ▼
                                      (Valid Token)             (No/Invalid Token)
                                             │                         │
                                             ▼                         ▼
                                    [ Execute Controller ]       HTTP 401 Unauthorized
```

---

## 4. Verification & Testing Results

- [x] **Public Registration Test (`POST /api/v1/auth/register`)**: Returns valid validation response / 201 Created without requiring an `Authorization` header.
- [x] **Protected Endpoint Check (`GET /api/v1/dashboard/summary`)**: Returns `HTTP 401 Unauthorized` with `{"success":false,"error":"No token provided"}` when unauthenticated.
- [x] **Build & Unit Tests (`npm run build && npm run test`)**: TypeScript compilation succeeds cleanly, and **106 / 106 unit & integration tests pass**.
