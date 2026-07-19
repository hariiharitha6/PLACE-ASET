# Authentication & User Management Documentation

This document describes the design, architecture, and API details of the **Authentication & User Management (Module 2)** module implemented on the **PLACE@ASET** platform.

---

## 🏗️ Architecture Overview

The system uses a hybrid authentication architecture.
1. **Frontend Authentication Lifecycle**: Managed via the Supabase Client SDK, wrapped inside React Context (`AuthContext`). It monitors session changes, fetches candidate profiles, and handles routing guards.
2. **Backend API Authentication**: Express.js backend acts as a proxy for registration, login, logout, password resets, and token refresh. It validates requests, applies rate limiters, verifies tokens directly using `supabase.auth.getUser()`, and assigns user roles and academic details.
3. **Session Management (Cookies)**: Refresh tokens are stored in secure, `HttpOnly` cookies on the backend. This prevents client-side Javascript scripts from accessing the refresh token, protecting against Cross-Site Scripting (XSS) token theft. Access tokens are returned in the response payload to be stored in-memory by the frontend client.

---

## 🗄️ Database Schema

The following tables were added to support authorization, RBAC (Role-Based Access Control), and session tracking:

### 1. `roles` Table
Stores roles available on the system.
- `id` (UUID, Primary Key)
- `name` (VARCHAR, Unique): `'super_admin'`, `'college_admin'`, `'host'`, `'faculty'`, `'student'`
- `description` (TEXT)
- `created_at` / `updated_at`

### 2. `permissions` Table
Granular permissions mapped to roles.
- `id` (UUID, Primary Key)
- `name` (VARCHAR, Unique): e.g., `'challenges:create'`, `'questions:delete'`, etc.
- `description` (TEXT)

### 3. `role_permissions` Table (Junction)
Links permissions to roles.
- `role_id` (UUID, Foreign Key)
- `permission_id` (UUID, Foreign Key)
- Primary Key (`role_id`, `permission_id`)

### 4. `user_roles` Table (Junction)
Map users to roles.
- `user_id` (UUID, Foreign Key referencing `users.id`)
- `role_id` (UUID, Foreign Key referencing `roles.id`)
- Primary Key (`user_id`, `role_id`)

### 5. `sessions` Table
Tracks active user session states.
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key)
- `refresh_token` (VARCHAR, Unique)
- `user_agent` (TEXT)
- `ip_address` (INET)
- `is_blocked` (BOOLEAN)
- `expires_at` (TIMESTAMPTZ)

---

## 🔌 API Reference

All requests must contain `Content-Type: application/json`. Protected endpoints require a Bearer token in the `Authorization` header.

### Endpoints

| Endpoint | Method | Description | Auth Required |
|---|---|---|---|
| `/api/v1/auth/register` | `POST` | Registers a new candidate and assigns the student role | No |
| `/api/v1/auth/login` | `POST` | Logs user in, returns access token, sets secure HttpOnly cookie | No |
| `/api/v1/auth/logout` | `POST` | Invalidates active session and clears cookies | Yes |
| `/api/v1/auth/forgot-password` | `POST` | Sends a recovery email with a reset link | No |
| `/api/v1/auth/reset-password` | `POST` | Resets password (requires verification token) | Yes |
| `/api/v1/auth/refresh` | `POST` | Refreshes session using the secure cookie | No |
| `/api/v1/users/profile` | `GET` | Retrieves detailed candidate profile and roles | Yes |
| `/api/v1/users/profile` | `PUT` | Updates candidate profile details | Yes |

---

## 🛡️ Security Implementation

- **Input Validation**: All requests are schema-validated using Zod schemas (`registerSchema`, `loginSchema`, `forgotPasswordSchema`, `resetPasswordSchema`, `updateProfileSchema`) before processing.
- **Rate Limiting**: Auth endpoints limit abuse via `express-rate-limit` to prevent brute-force attacks.
- **Secure Cookies**: Refresh tokens are returned with flags: `httpOnly: true`, `secure: true` (in production), and `sameSite: 'lax'`.
- **CORS Whitelisting**: Strict origin controls via environmental parameters.
- **Helmet Headers**: Enhanced security headers for XSS, framing, and browser exploits.
