import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";

import { assets, db } from "@/db/client";
import { tasks } from "@/db/adminSchema";
import { requireTenantApi } from "@/lib/tenant-auth";

export type StaffMetricsResponse = {
  myTasksCount: number;
  inProgressCount: number;
  pendingTasksCount: number;
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

    const userId = session.user?.id;
    if (!userId) {
      return NextResponse.json({ error: "User missing" }, { status: 400 });
    }

    // Only include tasks personally assigned to the user (assigneeType = 'USER')
    const taskRows = await db
      .select({ status: tasks.status })
      .from(tasks)
      .where(
        and(
          eq(tasks.assigneeId, userId),
          eq(tasks.assigneeType, "USER"),
          eq(tasks.tenantId, tenant.id),
        ),
      );

    const myTasksCount = taskRows.length;
    const inProgressCount = taskRows.filter(
      (t) => String(t.status).toLowerCase() === "in-progress",
    ).length;
    const pendingTasksCount = taskRows.filter(
      (t) => String(t.status).toLowerCase() === "pending",
    ).length;

    const assetRows = await db.query.assets.findMany({
      where: eq(assets.tenantId, tenant.id),
    });

    return NextResponse.json<StaffMetricsResponse>({
      myTasksCount,
      inProgressCount,
      pendingTasksCount,
      assetCount: assetRows.length,
    });
  } catch (error) {
    console.error("GET /api/staff/metrics error", error);
    return NextResponse.json(
      { error: "Failed to load staff metrics" },
      { status: 500 },
    );
  }
}
