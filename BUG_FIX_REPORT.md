# Bug Fix & Resolution Log – PLACE@ASET

**Project Name:** PLACE@ASET  
**Target:** Resolved Defects & Refactoring Summary  
**Audit Date:** July 21, 2026  

---

## 1. Resolved Issues Summary

| Bug ID | Component | Symptom / Issue | Root Cause | Resolution Strategy | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **BUG-01** | `rateLimiter.ts` | `429 Too Many Requests` triggered on rapid SPA navigation | Default rate limit threshold was capped at 100 requests per 15 mins | Increased default limit to 1000 requests per 15 min window | ✅ RESOLVED |
| **BUG-02** | `server/nodemon.json` | Nodemon spawning double entrypoint `src/server.ts src/server.ts` | Exec string included `src/server.ts` while package.json passed `src/server.ts` | Cleaned `nodemon.json` exec string to `ts-node -r tsconfig-paths/register` | ✅ RESOLVED |
| **BUG-03** | `Sidebar.jsx` | Webpack syntax error `Expected '}', got ':'` on line 103 | CSS property `justify-content` written in hyphenated syntax in inline style object | Converted `justify-content` to camelCase `justifyContent` | ✅ RESOLVED |
| **BUG-04** | `LoginPage.jsx` | Logged-in user visiting `/login` stayed on login screen | Missing authentication check effect | Added `useEffect` hook auto-redirecting authenticated state to `/dashboard` | ✅ RESOLVED |
| **BUG-05** | `RegisterPage.jsx` | Lack of password confirmation matching input | Single password field | Added `Confirm Password` field and matching validation before form dispatch | ✅ RESOLVED |
| **BUG-06** | `user.service.ts` | TS6133 unused variable warnings on build | Unreferenced parameters in service stubs | Removed unused parameter declarations and cleaned signatures | ✅ RESOLVED |
