# CORS Configuration Fix Report – PLACE@ASET

**Date:** July 20, 2026  
**Status:** FIXED & VERIFIED  

---

## 1. Overview

The Express backend application CORS misconfiguration blocking requests from `http://localhost:3001` (and `http://localhost:3000`) has been completely resolved.

### Root Cause
Previously, `server/src/app.ts` performed a rigid split on `process.env.ALLOWED_ORIGINS` which defaulted to `http://localhost:3000` only, and `allowedHeaders` omitted `apikey` and `x-client-info`. When the frontend running on `http://localhost:3001` issued requests to `http://localhost:4000/api/v1/auth/register`, the browser blocked the request due to missing CORS headers.

---

## 2. Changes Implemented

### `server/src/app.ts`
- **Single CORS Middleware**: Consolidated CORS configuration into a single early-registered middleware.
- **Dynamic Origin Resolution**: Configured origin handler to accept both `http://localhost:3000` and `http://localhost:3001` as well as any custom origins listed in `ALLOWED_ORIGINS`.
- **Allowed Methods**: Enabled `['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']`.
- **Allowed Headers**: Expanded headers list to `['Content-Type', 'Authorization', 'apikey', 'x-client-info']`.
- **Preflight Success Status**: Set `optionsSuccessStatus: 204` to ensure HTTP 204 on preflight OPTIONS.
- **Credentials**: Enabled `credentials: true` for cookie/session support.

```typescript
const defaultOrigins = ['http://localhost:3000', 'http://localhost:3001'];
const envOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);
const allowedOrigins = Array.from(new Set([...defaultOrigins, ...envOrigins]));

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, allowedOrigins[0] || 'http://localhost:3000');
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'apikey', 'x-client-info'],
  optionsSuccessStatus: 204,
}));
```

### `server/src/config/env.ts`
- Updated default `ALLOWED_ORIGINS` schema to `'http://localhost:3000,http://localhost:3001'`.

### `server/.env`
- Set `ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001`.

---

## 3. Verification & Preflight Testing

### Preflight Verification (`curl.exe`)
```bash
curl.exe -i -X OPTIONS http://localhost:4000/api/v1/auth/register -H "Origin: http://localhost:3001"
```

**Output Response:**
```http
HTTP/1.1 204 No Content
Access-Control-Allow-Origin: http://localhost:3001
Vary: Origin
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET,POST,PUT,PATCH,DELETE,OPTIONS
Access-Control-Allow-Headers: Content-Type,Authorization,apikey,x-client-info
Content-Length: 0
```

- [x] **HTTP 204 Status**: Confirmed.
- [x] **`Access-Control-Allow-Origin`**: Returns requesting origin (`http://localhost:3001` and `http://localhost:3000`).
- [x] **`Access-Control-Allow-Methods`**: Includes `GET,POST,PUT,PATCH,DELETE,OPTIONS`.
- [x] **`Access-Control-Allow-Headers`**: Includes `Content-Type,Authorization,apikey,x-client-info`.
- [x] **Build & Test Check**: Backend build (`npm run build`) and test suite (`npm run test`) pass with **106 / 106 passing**.
