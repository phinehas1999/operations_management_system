# Operations Management System (OMS)

## 🚀 Overview

**Operations Management System (OMS)** is a robust, multi-tenant SaaS platform designed to unify and automate the core operations of modern organizations. OMS provides a secure, scalable environment where companies can manage teams, tasks, assets, and billing across multiple business units or clients—all from a single, intuitive interface.

### What does OMS do?

- **Centralizes Operations:** Replace scattered spreadsheets and siloed tools with a unified command center for all operational activities.
- **Multi-Tenant Architecture:** Each company, branch, or client operates in a fully isolated environment, ensuring data privacy and compliance.
- **Role-Based Portals:** Custom dashboards and permissions for Superadmins, Admins, Managers, and Staff, each tailored to their responsibilities.
- **Task & Workflow Automation:** Assign, track, and prioritize tasks in real time, with built-in notifications and progress tracking for teams and individuals.
- **Asset Lifecycle Management:** Monitor equipment, inventory, and resources with status tracking, location history, and audit logs.
- **Integrated Billing & Invoicing:** Automate subscription management, plan upgrades, and manual payment verification, with transparent billing history for each tenant.
- **Security & Compliance:** Enforce granular access controls, maintain detailed audit logs, and ensure regulatory compliance across all operations.
- **Insightful Dashboards:** Visualize key metrics—revenue, task completion, team performance—through interactive, real-time dashboards.

OMS is engineered for organizations seeking to scale efficiently, improve accountability, and gain real-time visibility into every aspect of their operations. Whether you’re a SaaS provider, a multi-branch enterprise, or a managed services company, OMS adapts to your workflow and grows with your business.

## ✨ Key Features

- **🏢 Multi-Tenant SaaS Architecture** - Complete data isolation for different companies or branches.
- **👥 Role-Based Access Control (RBAC)** - Distinct portals for **Superadmins**, **Admins**, **Managers**, and **Staff**.
- **✅ High-Velocity Task Engine** - Real-time task assignment, tracking, and prioritization.
- **📦 Asset Inventory Management** - Track equipment status, location, and lifecycle logs.
- **💳 Integrated Billing & Invoicing** - Subscription management, plan upgrades, and manual payment verification flows.
- **🛡 Audit Logging & Security** - Comprehensive action logs for compliance and accountability.
- **📊 Interactive Dashboards** - Visualize revenue, task completion, and team performance.

---

## 📸 Screenshots

|                    Admin Dashboard                     |                    Task Board                     |
| :----------------------------------------------------: | :-----------------------------------------------: |
| ![Admin Dashboard](public/preview/admin_dashboard.png) | ![Task Board](public/preview/admin_taskboard.png) |

|               Asset Management               |                      Superadmin Billing                      |
| :------------------------------------------: | :----------------------------------------------------------: |
| ![Asset List](public/preview/asset_list.png) | ![Superadmin Billing](public/preview/superadmin_billing.png) |

---

## 🛠 Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL (via Neon)
- **ORM:** Drizzle ORM
- **Auth:** NextAuth.js v5
- **Styling:** Tailwind CSS + Radix UI
- **Animations:** GSAP

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL Database URL

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/operations_management_system.git
   cd operations_management_system
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure Environment**
   Create a `.env` file in the root directory:

   ```env
   DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
   AUTH_SECRET="your-super-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Initialize Database**

   ```bash
   npm run db:generate    # Generate migration files
   npm run db:migrate     # Push schema to DB
   ```

5. **Seed Initial Data** (Optional)

   ```bash
   npm run db:seed:tenants      # Create mock tenants
   npx tsx scripts/seed-billing.ts # Create billing plans
   ```

6. **Run Development Server**
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) to view the app.

---

## 🧭 User Roles & Usage

### 🔐 Superadmin (`/superadmin`)

_The Platform Owner_

- Manage all tenants (create, suspend, delete).
- Configure billing plans and pricing.
- Approve/Reject manual payment proofs.
- View platform-wide analytics.

### 🏗 Tenant Admin (`/admin`)

_The Company Owner_

- Invite and manage users (Managers, Staff).
- Create Teams and assign Managers.
- Oversee all Tasks and Assets within the tenant.
- View Billing History and Invoices.

### 👔 Manager (`/manager`)

_The Team Lead_

- Create and assign Tasks to Staff or Teams.
- Monitor Asset status and inventory levels.
- View team performance reports.

### 👷 Staff (`/staff`)

_The Executor_

- View "My Tasks" and "Team Tasks".
- Mark tasks as Complete.
- Read-only access to assigned Assets.

---

## 👐 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the project.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 📞 Contact

Project Link: [https://github.com/phinehas1999/operations_management_system](https://github.com/phinehas1999/operations_management_system)
