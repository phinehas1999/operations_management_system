import type { CSSProperties } from "react";
import { desc, eq } from "drizzle-orm";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import AddUserDialog from "./add-user-dialog";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { db, users } from "@/db/client";
import { requireActiveTenant } from "@/lib/tenant-auth";

import siteHeaderData from "../constants/siteheaderdata";
import sidebarData from "../constants/sidebardata";
import { UsersRolesTable, type TenantUserRow } from "./users-table";

export default async function Page() {
  const { tenant } = await requireActiveTenant();

  const tenantUsers = await db.query.users.findMany({
    where: eq(users.tenantId, tenant.id),
    columns: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
    orderBy: [desc(users.createdAt)],
  });

  const rows: TenantUserRow[] = tenantUsers.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    status: tenant.status === "Active" ? "Active" : "Suspended",
    team: null,
    createdAt: u.createdAt.toISOString().split("T")[0],
  }));

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as CSSProperties
      }
    >
      <AppSidebar variant="inset" sidedebardata={sidebarData} />
      <SidebarInset>
        <SiteHeader siteheaderdata={siteHeaderData} />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold">Users & Roles</h2>
                    <p className="text-sm text-muted-foreground">
                      {tenant.name} • Manage tenant users and access.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <AddUserDialog tenantId={tenant.id} />
                  </div>
                </div>

                <UsersRolesTable users={rows} />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
