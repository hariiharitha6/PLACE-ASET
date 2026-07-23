# Faculty Registration & Academic Governance Report

**Project Name:** PLACE@ASET — Enterprise Learning Management & Placement Assessment Platform  
**Target:** Faculty Registration, Designations & Academic Scoping  
**Date:** July 22, 2026  

---

## 1. Faculty Registration Flow

The Faculty Registration system (`/register/faculty`) allows educators, instructors, placement officers, HODs, and academic leaders to create accounts without entering student roll numbers.

### Required Fields
- **Full Name**
- **Employee ID**
- **Institutional Email**
- **Phone Number**
- **College & Department**
- **Designation Selection** (`Assistant Professor`, `Associate Professor`, `Professor`, `Lab Instructor`, `Guest Faculty`, `Placement Officer`, `Head of Department`, `Principal`)

---

## 2. Designation Auto-Role Mapping

Designations are stored in `designations` table and map automatically to enterprise roles upon registration:

| Designation Title | Mapped Enterprise Role | Scoped Dashboard |
| :--- | :--- | :--- |
| **Assistant Professor** | `faculty` | `/faculty/dashboard` |
| **Associate Professor** | `faculty` | `/faculty/dashboard` |
| **Professor** | `faculty` | `/faculty/dashboard` |
| **Lab Instructor** | `faculty` | `/faculty/dashboard` |
| **Guest Faculty** | `faculty` | `/faculty/dashboard` |
| **Placement Officer** | `placement_cell` | `/placement/dashboard` |
| **Placement Assistant** | `placement_cell` | `/placement/dashboard` |
| **Head of Department** | `hod` | `/hod/dashboard` |
| **Principal** | `principal` | `/principal/dashboard` |

---

## 3. Scoped Data Access & Privacy Matrix

- **Faculty**: Access restricted to students in their own department. Read-only access to department practice reports and leaderboards.
- **HOD**: Complete departmental readiness analytics and student performance roster for their own department.
- **Placement Cell**: Full access to all student resumes, company eligibility matrices, and placement readiness across all departments.
- **Student Privacy**: Student profiles are hidden from hosts, other students, and faculty members from other departments.
