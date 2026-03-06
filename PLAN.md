# 🏗 Project: Operations Management System (OMS)

A robust, multi-tenant SaaS platform for enterprise operations management. This system orchestrates tasks, assets, and teams across multiple isolated tenants, featuring role-based access control (RBAC) and comprehensive billing/audit capabilities.

---

# 1️⃣ Core Architecture

## Tech Stack

- **Frontend:** Next.js 16 (App Router), React 19, TailwindCSS, Lucide/Tabler Icons.
- **Backend:** Next.js Server Actions & API Routes.
- **Database:** PostgreSQL (Neon Serverless), Drizzle ORM.
- **Authentication:** NextAuth v5 (Credentials Provider), Argon2 for hashing.
- **Validation:** Zod schemas.
- **UI Components:** Radix UI primitives, Shadcn/ui patterns, Sonner (toasts).
- **Animations:** GSAP (landing & interactive elements).

## Multi-Tenant Strategy

- **Isolation Level:** Logical Isolation (Shared Database, Discriminator Column).
- **Implementation:**
  - Every tenant-scoped table (`users`, `tasks`, `assets`, `teams`) includes a `tenant_id` foreign key.
  - `lib/tenant-auth.ts` enforces tenant context verification for every protected route.
  - Superadmins can bypass tenant checks to manage the platform globally.

---

# 2️⃣ User Roles & Permissions

| Role           | Scope       | Key Responsibilities                                                             | Route Prefix  |
| :------------- | :---------- | :------------------------------------------------------------------------------- | :------------ |
| **Superadmin** | Platform    | Manage tenants, billing plans, payment approvals, platform settings.             | `/superadmin` |
| **Admin**      | Tenant      | Full control over tenant data: Users, Roles, Teams, Billing, Audit Logs.         | `/admin`      |
| **Manager**    | Tenant/Team | Oversee specific teams, assign tasks, manage assets, view team reports.          | `/manager`    |
| **Staff**      | Tenant      | Execute assigned tasks, view notifications, read-only access to relevant assets. | `/staff`      |

---

# 3️⃣ Key Modules

### 🛠 Tasks Engine

- **Features:** Create, Assign (to User or Team), Prioritize (Low/Medium/High), Track Status (Todo/In Progress/Review/Done).
- **Access:** Managers assign; Staff execute.
- **Schema:** `tasks` table with `assignee_id`, `assignee_team_id`, `deadline`.

### 📦 Asset Management

- **Features:** Inventory tracking, status monitoring (Active/Inactive), Minimum quantity thresholds.
- **Logs:** `asset_logs` track every movement or adjustment for accountability.

### 👥 Teams & Workforce

- **Features:** Group users into functional units.
- **Structure:** `teams` table linked to `users` via `user_teams` (m:n relationship).
- **Leadership:** Teams can have designated managers.

### 💳 Billing & Subscriptions

- **Features:**
  - **Plans:** Defined coverage (seats, storage, features).
  - **Invoices:** Auto-generated monthly/yearly.
  - **Payments:** Manual bank transfer support with proof-of-payment upload (`payment_confirmations`).
  - **Approvals:** Superadmins verify payments to unlock tenant features.

### 🛡 Security & Audit

- **RBAC:** Strict role enforcement via middleware and layout checks.
- **Audit Logs:** `audit_logs` table records critical actions (Create/Update/Delete) for compliance.

---

# 4️⃣ Authentication & Onboarding

### Flow

1. **Sign Up:** `/auth/create_company_account`
   - Creates a new `tenant`.
   - Creates the first `user` (Admin).
   - Auto-logs in.
2. **Login:** `/auth/login`
   - Helper looking up user by email.
   - Session includes `tenantId` and `role`.
3. **Session Management:**
   - Database strategy using NextAuth `sessions` table.
   - Secure cookie handling.

---

# 5️⃣ Database Schema Overview

| Table                   | Purpose                                                          |
| :---------------------- | :--------------------------------------------------------------- |
| `tenants`               | Core entity. Contains settings, plan info, and status.           |
| `users`                 | Global user list, scoped by `tenant_id`. Stores password hashes. |
| `billing_plans`         | SaaS tier definitions.                                           |
| `invoices`              | Billing records linked to tenants.                               |
| `payment_confirmations` | Proof of payment uploads.                                        |
| `teams`                 | Functional groups within a tenant.                               |
| `tasks`                 | Work units.                                                      |
| `assets`                | Inventory items.                                                 |
| `audit_logs`            | Compliance trail.                                                |

**Migrations:** Managed via Drizzle Kit (`drizzle/` folder).

---

# 6️⃣ Automation & Scripts

Located in `/scripts`:

- `db-generate.js`: Custom wrapper for Drizzle generation.
- `seed-tenants.ts`: Populates dev DB with mock tenants/users.
- `seed-billing.ts`: Sets up default pricing plans.
- `seed-superadmin.ts`: Creates the initial platform superadmin account.
- `check-*.js`: Diagnostics for schema consistency.

---

# 7️⃣ Setup & Contribution

See `README.md` for detailed installation steps.

**Workflow:**

1. modify `db/schema.ts`
2. `npm run db:generate`
3. `npm run db:migrate`
4. Update API/UI components.
