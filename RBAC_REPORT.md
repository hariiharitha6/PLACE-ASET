# Enterprise Role-Based Access Control (RBAC) System Report

**Project Name:** PLACE@ASET — Enterprise Learning Management & Placement Assessment Platform  
**Target:** Role Hierarchy & Security Governance  
**Date:** July 22, 2026  

---

## 1. Enterprise Hierarchy Structure

PLACE@ASET enforces an 8-tier role hierarchy:
1. `super_admin` (Level 8): Unrestricted master governance.
2. `college_admin` (Level 7): Campus administration & user management.
3. `principal` (Level 6): Executive academic & placement oversight.
4. `hod` (Level 5): Head of Department (department scoped).
5. `placement_cell` (Level 4): Placement drives, resumes, eligibility matrices.
6. `host` (Level 3): Events, contests, discussion moderation.
7. `faculty` (Level 2): Department student roster, practice reports.
8. `student` (Level 1): Assessment, learning, practice arena.

---

## 2. Privilege Escalation Prevention

- Middleware (`checkRole`, `requireMinRole`) evaluates `ROLE_HIERARCHY` levels.
- Accounts cannot change roles of users with equal or higher hierarchy levels.
- Self-promotion is strictly blocked.
- Nobody except Super Admin can create another College Admin or assign privileged roles.
