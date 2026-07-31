Deletion and Audit Log Behavior

Overview
- The backend uses a combined soft-delete + audit logging strategy by default.

Soft-delete
- When a record is deleted via the generic CRUD endpoint, it is marked with `deleted: true`, and metadata is added: `deletedAt`, `deletedBy` (actor object), and `deleteReason`.
- Soft-deleted records are excluded from reads by default (`GET /api/data/:table` and `GET /api/data/:table/:id`).

Hard-delete
- Administrators may perform a permanent (hard) delete by including the query parameter `?hard=true` on the DELETE request. Example:

  DELETE /api/data/users/U123?hard=true

- For Postgres-backed controllers that perform SQL deletes (e.g., `internshipController`), a hard delete still occurs at the database level but an audit entry is recorded.

Audit logs
- All delete operations (soft-delete, hard delete, and purge) are recorded in `auditLogs` persisted to `backend/data/dbStore.json`.
- Each audit entry includes at least: `id`, `timestamp`, `action` (`soft-delete`, `delete`, or `purge`), `table`, `id` (target record), and optional `actor` and `reason`.

Admin endpoints
- View audit logs (admin-only):
  GET /api/data/audit-logs
  - Optional query params: `table`, `id`, `action` to filter logs.

- Purge soft-deleted records (admin-only):
  POST /api/data/purge/:table
  - Permanently removes records where `deleted: true` in the specified table and records a `purge` audit entry for each removed item.

Examples (curl)
- Soft-delete a record as admin:

  curl -X DELETE \
    -H "Authorization: Bearer <ADMIN_TOKEN>" \
    "https://.../api/data/internships/INT001"

- Hard-delete a record as admin:

  curl -X DELETE \
    -H "Authorization: Bearer <ADMIN_TOKEN>" \
    "https://.../api/data/internships/INT001?hard=true"

- View audit logs for internships:

  curl -H "Authorization: Bearer <ADMIN_TOKEN>" \
    "https://.../api/data/audit-logs?table=internships"

Notes
- Only authenticated users with role `admin` have access to audit and purge endpoints.
- HR users may soft-delete `internships` and `applications` via the generic delete endpoint (soft-delete only unless admin).
