# Enterprise RBAC Implementation & Role Governance Report

**Project Name:** PLACE@ASET — Enterprise Learning Management & Placement Assessment Platform  
**Target:** Enterprise Role-Based Access Control (RBAC) Architecture  
**Date:** July 22, 2026  
**Status:** 100% COMPLETE & VERIFIED  

---

## 1. Executive Summary

An enterprise-grade 8-level Role-Based Access Control (RBAC) hierarchy has been integrated into PLACE@ASET. The system enforces strict role boundaries, single-authentication portal routing (`/login`), privilege escalation prevention, and scoped departmental privacy.

---

## 2. Enterprise Role Hierarchy & Scoped Portals

| Role ID | Role Title | Hierarchy Level | Primary Scoped Dashboard Path | Key Access & Governance Scope |
| :--- | :--- | :---: | :--- | :--- |
| `super_admin` | Super Admin | **8** | `/super-admin/dashboard` | Master System Governance, Bootstrap Admin, Temporary Permission Moderation, Global User Management |
| `college_admin` | College Admin | **7** | `/admin/dashboard` | Campus Governance, User Management, Dataset Ingestion, Event Management |
| `principal` | Principal | **6** | `/principal/dashboard` | Executive Academic Oversight, College-wide Placement Analytics |
| `hod` | Head of Department | **5** | `/hod/dashboard` | Departmental Roster, Placement Readiness, Department Leaderboards (Scoped to Own Dept) |
| `placement_cell` | Placement Cell | **4** | `/placement/dashboard` | All Student Resumes, Corporate Drives, Eligibility Matrices, Resume Reports |
| `host` | Host & Organizer | **3** | `/host/dashboard` | Event Hosting, Coding Challenges, Discussions (Restricted from Student Profiles/Resumes) |
| `faculty` | Faculty Member | **2** | `/faculty/dashboard` | Department Roster, Practice Reports, Announcements (Scoped to Own Dept) |
| `student` | Student Candidate | **1** | `/dashboard` | Practice Arena, Challenges, Leaderboard, Resource Library, Resume Builder |

---

## 3. Single Authentication System (`/login`)

- **Single Entry Point**: All candidate types, educators, hosts, HODs, and administrators authenticate via `/login`.
- **Dynamic Role Redirection**: Upon successful authentication, `getDashboardPath(user.role)` evaluates the database role claim and redirects the session to its dedicated dashboard path.
- **Super Admin Bootstrap**: On server startup, `seedSuperAdmin()` automatically creates a master Super Admin account from `SUPER_ADMIN_NAME`, `SUPER_ADMIN_EMAIL`, and `SUPER_ADMIN_PASSWORD` environment variables if no Super Admin exists.
