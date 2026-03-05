import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";

import { assets, db } from "@/db/client";
import { tasks, teams, userTeams } from "@/db/adminSchema";
import { requireTenantApi } from "@/lib/tenant-auth";

export type ManagerMetricsResponse = {
  myTasksCount: number;
  pendingTasksCount: number;
  myTeamCount: number;
  assetCount: number;
};

export async function GET() {
  try {
    const { session, tenant, response } = await requireTenantApi();
    if (response) return response;
    if (!session || !tenant) {
      return NextResponse.json(
        { error: "Tenant or session missing" },
        { status: 401 },
      );
    }

    const managerId = session.user?.id;
    if (!managerId) {
      return NextResponse.json(
        { error: "Manager identifier missing" },
        { status: 400 },
      );
    }

    if (session.user?.role !== "MANAGER") {
      return NextResponse.json(
        { error: "Manager role required" },
        { status: 403 },
      );
    }

    const userTasks = await db
      .select({ id: tasks.id, status: tasks.status })
      .from(tasks)
      .where(
        and(eq(tasks.tenantId, tenant.id), eq(tasks.assigneeId, managerId)),
      );

    const teamTasks = await db
      .select({ id: tasks.id, status: tasks.status })
      .from(tasks)
      .innerJoin(teams, eq(tasks.assigneeTeamId, teams.id))
      .where(
        and(eq(tasks.tenantId, tenant.id), eq(teams.managerId, managerId)),
      );

    // Only count personal tasks (assigned directly to the manager)
    const myTasksCount = userTasks.length;

    const pendingTasksCount = userTasks.filter(
      (task) => task.status?.toLowerCase() === "pending",
    ).length;

    const teamMembers = await db
      .select({ userId: userTeams.userId })
      .from(userTeams)
      .innerJoin(teams, eq(userTeams.teamId, teams.id))
      .where(
        and(
          eq(teams.tenantId, tenant.id),
          eq(teams.managerId, managerId),
          eq(userTeams.role, "STAFF"),
        ),
      );

    const myTeamCount = new Set(teamMembers.map((row) => row.userId)).size;

    const assetRows = await db
      .select({ id: assets.id })
      .from(assets)
      .where(eq(assets.tenantId, tenant.id));

    return NextResponse.json<ManagerMetricsResponse>(
      {
        myTasksCount,
        pendingTasksCount,
        myTeamCount,
        assetCount: assetRows.length,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("GET /api/manager/metrics error", error);
    return NextResponse.json(
      { error: "Failed to load manager metrics" },
      { status: 500 },
    );
  }
}
