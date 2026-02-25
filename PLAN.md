# 🏗 Project: Smart Operations Management System (OMS)

Production-style internal business dashboard with RBAC, tasks, assets, notifications, and reports.
Multi-tenant SaaS with role areas and tenant scoping:

- Admin → /admin
- Manager → /manager
- Staff → /staff
- Platform Superadmin (software provider) → /superadmin (manages tenants and platform)

---

# 0️⃣ Goals

- Ship a client-ready internal dashboard with clear permissions, reliable auth, and seeded demo data.
- Favor maintainability: typed DB schema (Drizzle), predictable auth (NextAuth), solid migrations, and clean API boundaries.

---

# 1️⃣ Core Architecture

## Tech Stack (Final)

- **Frontend:** Next.js (App Router)
- **Styling:** TailwindCSS
- **Backend:** Next.js API routes
- **Database:** PostgreSQL
- **ORM:** Drizzle
- **Auth:** NextAuth (credentials, JWT strategy; OAuth can be added later)
- **Deployment:** Vercel (frontend) + Neon (DB)

Notes

- Drizzle migrations own schema changes.
- NextAuth: store sessions in DB; hash passwords (argon2/bcrypt); include userId, role, tenantId, and isSuperAdmin in JWT; redirect to /admin, /manager, /staff, /superadmin.
- Use Zod for input validation; add basic rate limiting on auth endpoints.
- Neon is the primary Postgres DB (serverless, branching, fast deploys).

---

# 2️⃣ Database Design

Conventions

- IDs: UUID (text) primary keys. If you prefer integers, switch to `serial` and adjust Drizzle types.
- Timestamps: `created_at` default `now()`. Add `updated_at` where useful.
- Enums: `role`, `priority`, `status`, `asset_action`.

## Tables

### tenants

| column     | type        | constraints      | notes                   |
| ---------- | ----------- | ---------------- | ----------------------- |
| id         | uuid        | pk               |                         |
| slug       | text        | unique, not null | used for subdomain/path |
| name       | text        | not null         | tenant name             |
| plan       | text        | nullable         | billing/feature tier    |
| settings   | jsonb       | default {}       | branding, feature flags |
| created_at | timestamptz | default now()    |                         |

### users

| column        | type        | constraints                               | notes                             |
| ------------- | ----------- | ----------------------------------------- | --------------------------------- |
| id            | uuid        | pk                                        |                                   |
| name          | text        | not null                                  |                                   |
| email         | text        | not null, unique                          |                                   |
| password      | text        | not null                                  | hashed                            |
| role          | enum        | not null, default STAFF                   | SUPERADMIN\|ADMIN\|MANAGER\|STAFF |
| tenant_id     | uuid        | fk -> tenants.id, nullable for superadmin | tenant scoping                    |
| is_superadmin | boolean     | default false                             | platform-level flag               |
| team_id       | uuid        | fk -> teams.id, nullable                  | single-team membership (v1)       |
| created_at    | timestamptz | default now()                             |                                   |

### teams

| column     | type        | constraints   | notes |
| ---------- | ----------- | ------------- | ----- |
| id         | uuid        | pk            |       |
| name       | text        | not null      |       |
| created_at | timestamptz | default now() |       |

### tasks

| column      | type        | constraints                | notes                                |
| ----------- | ----------- | -------------------------- | ------------------------------------ |
| id          | uuid        | pk                         |                                      |
| title       | text        | not null                   |                                      |
| description | text        | nullable                   |                                      |
| priority    | enum        | default MEDIUM             | LOW\|MEDIUM\|HIGH                    |
| status      | enum        | default TODO               | TODO\|IN_PROGRESS\|REVIEW\|COMPLETED |
| deadline    | timestamptz | nullable                   |                                      |
| assigned_to | uuid        | fk -> users.id, nullable   |                                      |
| created_by  | uuid        | fk -> users.id, not null   |                                      |
| team_id     | uuid        | fk -> teams.id, nullable   |                                      |
| tenant_id   | uuid        | fk -> tenants.id, not null | tenant scoping                       |
| created_at  | timestamptz | default now()              |                                      |

### task_comments

| column     | type        | constraints                | notes |
| ---------- | ----------- | -------------------------- | ----- |
| id         | uuid        | pk                         |       |
| task_id    | uuid        | fk -> tasks.id, not null   |       |
| user_id    | uuid        | fk -> users.id, not null   |       |
| message    | text        | not null                   |       |
| tenant_id  | uuid        | fk -> tenants.id, not null |       |
| created_at | timestamptz | default now()              |       |

### assets

| column            | type        | constraints                | notes            |
| ----------------- | ----------- | -------------------------- | ---------------- |
| id                | uuid        | pk                         |                  |
| name              | text        | not null                   |                  |
| category          | text        | nullable                   |                  |
| quantity          | integer     | not null, default 0        |                  |
| minimum_threshold | integer     | not null, default 0        | low-stock alerts |
| team_id           | uuid        | fk -> teams.id, nullable   |                  |
| tenant_id         | uuid        | fk -> tenants.id, not null |                  |
| created_at        | timestamptz | default now()              |                  |

### asset_logs

| column     | type        | constraints               | notes                         |
| ---------- | ----------- | ------------------------- | ----------------------------- |
| id         | uuid        | pk                        |                               |
| asset_id   | uuid        | fk -> assets.id, not null |                               |
| action     | enum        | not null                  | ADDED\|USED\|UPDATED          |
| quantity   | integer     | not null                  | delta or absolute (decide v1) |
| user_id    | uuid        | fk -> users.id, nullable  | actor                         |
| created_at | timestamptz | default now()             |                               |

### notifications

| column     | type        | constraints              | notes |
| ---------- | ----------- | ------------------------ | ----- |
| id         | uuid        | pk                       |       |
| user_id    | uuid        | fk -> users.id, not null |       |
| message    | text        | not null                 |       |
| read       | boolean     | not null, default false  |       |
| created_at | timestamptz | default now()            |       |

Indexes (recommended)

- users: email (unique), team_id
- tasks: status, priority, deadline, assigned_to, team_id
- task_comments: task_id, user_id
- assets: team_id, quantity, minimum_threshold
- asset_logs: asset_id, user_id
- notifications: user_id, read

Relationships

- User belongs to one team (v1). Tasks and assets can optionally link to a team.
- Task `created_by` and `assigned_to` reference users.
- Asset logs reference assets and optionally the acting user.
- Notifications belong to users.

---

# 3️⃣ Authentication & Routing

Build

- Register
- Login
- Protected routes
- Middleware for role checking and role-based redirects to /admin, /manager, /staff, /superadmin
- Tenant discovery: subdomain (tenant.app.com) or path (/t/tenant); middleware loads tenant by slug and sets tenantId in request context

Role Access Rules

- SUPERADMIN (platform): full platform access; manage tenants, billing, and global settings
- ADMIN (tenant): full access within tenant
- MANAGER (tenant): manage tasks, view assets, assign staff (tenant-scoped)
- STAFF (tenant): view assigned tasks, update task status, view assets (read only)

Implementation Notes

- NextAuth credentials provider + Drizzle adapter; JWT session strategy.
- Hash passwords (argon2/bcrypt). Store refresh-like behavior via NextAuth session rotation if needed.
- Middleware: check session + role per route segment; enforce landing per role; redirect away from unauthorized sections.
- Route map:
  - /superadmin → platform area for tenant provisioning, billing, global settings
  - /admin → tenant admin dashboard + user/team management + system settings + full reports
  - /manager → tenant manager dashboard + task/asset oversight + assignments + reports slice
  - /staff → tenant staff dashboard + my tasks + status updates + read-only assets

---

# 4️⃣ Dashboard Structure (Per Role)

- Admin (/admin)
  - Dashboard (global KPIs)
  - Users & Roles
  - Teams
  - Tasks (all)
  - Assets (all)
  - Reports (full)
  - Settings

- Superadmin (/superadmin)
  - Platform Dashboard (tenant KPIs, revenue, health)
  - Tenants (provision, suspend, delete)
  - Billing & Plans
  - Platform Settings (email, domains, feature flags)
  - Audit & Logs
  - Support tooling (impersonate tenant admin, view incidents)

- Manager (/manager)
  - Dashboard (team KPIs)
  - Tasks (team scope)
  - Assets (team scope)
  - Reports (team slice)
  - Team (manage assignments)

- Staff (/staff)
  - Dashboard (my tasks KPIs)
  - My Tasks
  - Assets (read-only)
  - Notifications

---

# 5️⃣ Dashboard Page (Overview)

Show

- Total tasks
- Tasks in progress
- Completed tasks
- Overdue tasks
- Low stock alerts
- Recent activity feed

Add

- Bar chart (tasks per week)
- Pie chart (task status distribution)

Use a basic chart library.

---

# 6️⃣ Task Management Module (Core Feature)

Task List Page

- Search
- Filter by status
- Filter by priority
- Filter by assigned user
- Pagination

Task Creation Form

- Title
- Description
- Priority
- Deadline
- Assign user

Task Detail Page

- Full description
- Assigned staff
- Deadline
- Status
- Comments section
- File upload (optional)

Allow

- Status update
- Comment posting
- Edit (role-based)

---

# 7️⃣ Asset Management Module

Asset List

- Name
- Category
- Quantity
- Status (Low / Healthy)
- Last Updated

Highlight red if below threshold.

Asset Actions

- Add new asset
- Update quantity
- Log usage

Every change must create an asset_log entry.

---

# 8️⃣ Notification System

Trigger when

- Task assigned
- Task status changed
- Deadline within 24 hours
- Asset below threshold

Start simple

- Store in DB
- Fetch on dashboard
- Show unread badge

Real-time can be added later.

---

# 9️⃣ Reports Module

Create

Staff Performance Report

- Tasks completed per user
- Average completion time

Task Report

- Tasks by status
- Tasks by priority
- Overdue tasks count

Asset Report

- Most used assets
- Low stock frequency

Add CSV export.

---

# 🔟 Admin / Team Management

Admin can

- Create users
- Assign roles
- Create teams
- Move users between teams
- Deactivate accounts

Consider adding an audit log later.

---

# 1️⃣1️⃣ UI/UX Requirements

Make it clean and premium

- Soft shadows
- Rounded cards
- Clear typography
- Status badges
- Color-coded priorities
- Responsive layout

---

# 1️⃣2️⃣ Deployment & Demo Setup

Seed database with

- 1 Admin
- 2 Managers
- 4 Staff
- 20 tasks
- 10 assets

Seeding notes

- Use realistic deadlines, priorities, and statuses; include some overdue tasks for KPIs.
- Seed low-stock assets to surface alerts.
- Create demo credentials on the landing page.

---

# 1️⃣3️⃣ README

Explain

- System architecture
- RBAC design
- Database structure
- Business logic decisions
- Scalability considerations

---

# 🔥 Now We Get Tactical

Build in 5 phases

- Phase 1: Auth + Roles
- Phase 2: Task System
- Phase 3: Asset System
- Phase 4: Reports
- Phase 5: Polish + Deployment

If you want, I can now:

- Break this into a 30-day build schedule
- Design the folder structure and API routes
- Draft the Drizzle schema and initial migration + seeds
