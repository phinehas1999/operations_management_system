import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import TeamMembersMenu from "./team-members-menu";
import TeamRowActions from "./team-row-actions";

import siteHeaderData from "../constants/siteheaderdata";
import sidebarData from "../constants/sidebardata";
import AddTeamModal from "./add-team-modal";

import { requireActiveTenant } from "@/lib/tenant-auth";
import { db } from "@/db/client";
import { teams } from "@/db/adminSchema";
import { eq } from "drizzle-orm";

export default async function Page() {
  const { tenant } = await requireActiveTenant();

  let rows = [] as any[];
  try {
    rows = await db
      .select({
        id: teams.id,
        name: teams.name,
        description: teams.description,
        createdAt: teams.createdAt,
      })
      .from(teams)
      .where(eq(teams.tenantId, tenant.id))
      .orderBy(teams.name);
  } catch (err: any) {
    console.error("Teams query failed", err);
    throw new Error(
      "Failed to load teams. Ensure the 'teams' table exists and DB migrations have been applied. Original: " +
        (err?.message ?? String(err)),
    );
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
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
                    <h2 className="text-lg font-semibold">Teams</h2>
                    <p className="text-sm text-muted-foreground">
                      Organize staff into teams and assign leads.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <AddTeamModal />
                  </div>
                </div>

                <div className="flex flex-col gap-3 mb-4">
                  <div className="flex items-center gap-2 w-full md:w-1/2">
                    <input
                      className="w-full rounded-md border border-input px-3 py-2"
                      placeholder="Search teams or leads..."
                    />
                  </div>
                </div>

                <div className="rounded-md border bg-card p-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rows.map((t) => (
                        <TableRow key={t.id}>
                          <TableCell className="font-medium">
                            {t.name}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {t.description ?? "—"}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {t.createdAt
                              ? new Date(t.createdAt).toLocaleDateString()
                              : "—"}
                          </TableCell>
                          <TableCell className="text-right">
                            <TeamRowActions teamId={t.id} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
