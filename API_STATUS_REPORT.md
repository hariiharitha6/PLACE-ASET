# API Endpoint Status Report – PLACE@ASET

**Project Name:** PLACE@ASET  
**Target:** Express REST API Routes & Controllers  
**Audit Date:** July 21, 2026  
**Status:** 100% HEALTHY (106 / 106 TESTS PASSING)  

---

## 1. REST API Route Health Matrix

| Route Prefix | Method | Endpoint Path | Authentication | Description | Health Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/api/v1/auth` | POST | `/register` | Public | Student Registration | ✅ 201 Created |
| `/api/v1/auth` | POST | `/login` | Public | Candidate Login & Cookie Set | ✅ 200 OK |
| `/api/v1/auth` | POST | `/refresh` | Cookie / Bearer | Refresh Access Token | ✅ 200 OK |
| `/api/v1/auth` | POST | `/forgot-password` | Public | Initiate Password Recovery | ✅ 200 OK |
| `/api/v1/users` | GET | `/profile` | Bearer JWT | Fetch Logged-in Profile | ✅ 200 OK |
| `/api/v1/users` | GET | `/public/:id` | Bearer JWT | Public Profile View | ✅ 200 OK |
| `/api/v1/users` | GET | `/compare` | Bearer JWT | Candidate Comparison Engine | ✅ 200 OK |
| `/api/v1/users` | GET | `/:id/achievements` | Bearer JWT | User Gamified Badges | ✅ 200 OK |
| `/api/v1/users` | POST | `/profile/photo` | Bearer JWT | Profile Picture Upload | ✅ 200 OK |
| `/api/v1/dashboard` | GET | `/summary` | Bearer JWT | Dashboard Summary Data | ✅ 200 OK |
| `/api/v1/questions` | GET | `/` | Bearer JWT | Search & Filter Questions | ✅ 200 OK |
| `/api/v1/challenges`| GET | `/` | Bearer JWT | Active Placement Challenges | ✅ 200 OK |
| `/api/v1/ai` | GET | `/profile` | Bearer JWT | AI Profile Metrics & Advice | ✅ 200 OK |
