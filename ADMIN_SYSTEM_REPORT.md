# Enterprise Administration System Report

**Project Name:** PLACE@ASET — Enterprise Learning Management & Placement Assessment Platform  
**Target:** Administration Portal & Governance Controls  
**Date:** July 22, 2026  

---

## 1. Enterprise User & Account Governance

- **User Management Page** ([/admin/users](file:///c:/Users/harii/Downloads/PLACE@ASET/client/src/app/admin/users/page.jsx)): Features search, role filters (all 8 roles), status filters, department filters, pagination, and multi-user bulk selection.
- **Account Controls**: View, Edit, Reset Password, Disable, Enable, Delete, Suspend, Change Role, Grant/Revoke Permission.
- **Live User Monitor** ([/admin/system-users](file:///c:/Users/harii/Downloads/PLACE@ASET/client/src/app/admin/system-users/page.jsx)): Real-time online session telemetry displaying role badges, department, browser, device, IP address, and last active time.
- **Immutable Audit Logging**: Every system mutation, role change, status change, and password reset writes an entry to `admin_audit_logs`.
