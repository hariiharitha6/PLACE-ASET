# Registration Flow Audit & Fix Report – PLACE@ASET

**Date:** July 21, 2026  
**Status:** AUDITED, RESOLVED & VERIFIED  

---

## 1. Executive Summary

An audit of the registration flow from frontend payload submission to backend database persistence was conducted to resolve registration failures when using non-UUID slugs/codes (`collegeId: "aset"`, `departmentId: "cse"`).

Both frontend component state management and backend service resolution were updated to ensure database primary key UUIDs are preserved, validated, and safely resolved before executing PostgreSQL insertions.

---

## 2. Incoming Payload

```json
{
  "fullName": "D Haritha",
  "email": "hariiharitha05@gmail.com",
  "password": "123456789",
  "collegeId": "aset",
  "departmentId": "cse",
  "year": "4",
  "section": "A",
  "rollNumber": "ATP22CS006"
}
```

---

## 3. Validation Result

- **Schema Validator (`server/src/models/validators/auth.schema.ts`)**:
  - `registerSchema` accepts string UUIDs, string literals (`'aset'`), and department codes (`'cse'`, `'aiml'`, etc.).
  - **Result:** `Validation Succeeded` (Zod parsing passes for both UUIDs and slug formats).

- **Structured Validation Logs Added**:
  - Logs incoming request body in `validator.ts` middleware.
  - Logs validated payload structure prior to controller execution.

---

## 4. SQL & Supabase Database Analysis

- **Table Schemas (`supabase/migrations/001_create_core.sql`)**:
  - `colleges.id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
  - `departments.id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
  - `users.college_id`: `UUID NOT NULL REFERENCES colleges(id) ON DELETE CASCADE`
  - `users.department_id`: `UUID REFERENCES departments(id) ON DELETE SET NULL`

---

## 5. Root Cause & Exact Failing Line

### Exact Failing Line:
`server/src/services/auth.service.ts` (inside `AuthService.register()`):
```typescript
const { error: profileError } = await supabaseAdmin
  .from('users')
  .insert({
    id: userId,
    email: input.email,
    full_name: input.fullName,
    college_id: resolvedCollegeId,      // <--- Evaluated to "aset"
    department_id: resolvedDepartmentId,  // <--- Evaluated to "cse"
    role: 'student',
    ...
  });
```

### Root Cause Details:
1. **Frontend Override (`client/src/constants/departments.js`)**:
   `getDepartmentsForCollege()` contained `const isAset = !collegeId || collegeId === 'aset'...`. Whenever `isAset` evaluated to true, it bypassed fetched database departments and returned static fallback objects containing string codes (`{ id: 'cse', value: 'cse' }`).
2. **College Dropdown Object Mismatch (`client/src/app/register/page.jsx`)**:
   The registration page checked `processedCols.some(c => c.name === 'ASET')`. In the database, the college name is `'Ahalia School of Engineering and Technology'`. The mismatch caused the frontend to unshift a dummy college object with `id: 'aset'`, overriding the actual database UUID.
3. **PostgreSQL Syntax Error**:
   When `users.insert()` executed with string literal `'aset'` or `'cse'`, PostgreSQL rejected the query with:
   `ERROR 22P02: invalid input syntax for type uuid: "aset"`

---

## 6. Final Fix Implemented

### 1. Frontend Department Mapping (`client/src/constants/departments.js`)
Updated `getDepartmentsForCollege` to prioritize fetched database department objects containing database UUIDs:
```javascript
export function getDepartmentsForCollege(collegeId, fetchedDepts = []) {
  if (Array.isArray(fetchedDepts) && fetchedDepts.length > 0) {
    return fetchedDepts.map(d => ({
      id: d.id || d.value,
      value: d.id || d.value,
      code: d.code || '',
      name: d.name || d.label,
      label: d.label || (d.name && d.code ? `${d.name} (${d.code})` : d.name)
    }));
  }
  return DEFAULT_DEPARTMENTS;
}
```

### 2. Frontend Register Page (`client/src/app/register/page.jsx`)
Updated department filter logic to maintain active department lists without clearing options when matching college IDs.

### 3. Backend UUID Resolution & Fallbacks (`server/src/services/auth.service.ts`)
Added `isUUID()` helper and robust database lookups in `AuthService.register()`:
- **College Lookup**: If `collegeId` is a slug (`'aset'`), queries `colleges` table by `slug` / `name` to resolve the database UUID. If query returns empty, falls back to the primary college UUID.
- **Department Lookup**: If `departmentId` is a code (`'cse'`), queries `departments` table by `code` and `college_id` to resolve the department UUID.
- **Safe Database Insertion**: Guarantees that only valid UUID strings (or `null` for department) are passed to `public.users.insert()`.

### 4. Comprehensive Tracing & Logging
Added structured debug loggers across `validator.ts`, `auth.controller.ts`, and `auth.service.ts`:
- Log `[REGISTRATION DEBUG] 1. Request Received for Validation`
- Log `[REGISTRATION DEBUG] 2. Validation Succeeded / Failed`
- Log `[REGISTRATION DEBUG] 3. AuthController.register executing`
- Log `[REGISTRATION DEBUG] 4-5. Resolving College & Department UUIDs`
- Log `[REGISTRATION DEBUG] 6-7. Supabase Auth & public.users Insertion Results`

---

## 7. Verification Results

| Verification Phase | Command | Result |
| :--- | :--- | :--- |
| **Backend Unit & Integration Tests** | `npm test` (in `/server`) | **PASS** (106 / 106 tests passing) |
| **Backend Compilation** | `npm run build` (in `/server`) | **PASS** (Zero errors) |
| **Frontend Production Build** | `npm run build` (in `/client`) | **PASS** (28 / 28 pages generated) |
