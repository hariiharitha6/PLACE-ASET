# Dynamic Permission Engine & Temporary Permission System Report

**Project Name:** PLACE@ASET — Enterprise Learning Management & Placement Assessment Platform  
**Target:** Dynamic Permissions & Auto-Expiring Overrides  
**Date:** July 22, 2026  

---

## 1. Permission Architecture Overview

The PLACE@ASET Permission Engine decouples capabilities from static role definitions. Protected endpoints evaluate both role defaults (`role_permissions`) and user-specific active overrides (`user_permissions`).

### Key Capabilities Catalog
- `create_event`: Ability to create placement events and workshops.
- `delete_event`: Ability to delete placement events.
- `upload_questions`: Ability to ingest question datasets.
- `approve_questions`: Ability to review and publish questions.
- `manage_datasets`: Ability to manage dataset repositories.
- `view_student_profiles`: Access to student profiles and resumes.
- `export_reports`: Ability to export system and placement reports.
- `manage_ai`: Ability to configure AI models and prompts.
- `manage_users`: Ability to modify users, status, and credentials.
- `manage_departments`: Ability to create and manage academic departments.
- `manage_companies`: Ability to edit company hiring profiles.
- `manage_permissions`: Ability to approve temporary permission grants.

---

## 2. Temporary Permission Overrides

Users can request temporary capability overrides from `/permissions/request`. Super Admin can approve grants for:
- 1 Day Override
- 7 Days Override
- 30 Days Override
- Permanent Override
- Custom Duration

Expired permissions are automatically invalidated by middleware checking `expires_at` timestamps.
