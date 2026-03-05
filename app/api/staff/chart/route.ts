import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";

import { db } from "@/db/client";
import { tasks } from "@/db/adminSchema";
import { requireTenantApi } from "@/lib/tenant-auth";

function formatDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

export async function GET(req: Request) {
  try {
    const { session, tenant, response } = await requireTenantApi();
    if (response) return response;
    if (!session || !tenant) return NextResponse.json(null, { status: 401 });

    const userId = session.user?.id;
    if (!userId) return NextResponse.json(null, { status: 400 });

    const url = new URL(req.url);
    const daysParam = Number(url.searchParams.get("days") ?? "90");
    const days = Number.isFinite(daysParam) && daysParam > 0 ? daysParam : 90;

    const end = new Date();
    const start = new Date(end);
    start.setDate(start.getDate() - (days - 1));

    // Fetch personal tasks within range for this staff user
    const rows = await db
      .select({
        id: tasks.id,
        status: tasks.status,
        createdAt: tasks.createdAt,
      })
      .from(tasks)
      .where(
        and(
          eq(tasks.tenantId, tenant.id),
          eq(tasks.assigneeId, userId),
          eq(tasks.assigneeType, "USER"),
        ),
      );

    const map = new Map<string, { tasks: number; completed: number }>();
    for (let i = 0; i < days; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      map.set(formatDate(d), { tasks: 0, completed: 0 });
    }

    for (const r of rows) {
      const d = r.createdAt ? formatDate(new Date(r.createdAt)) : null;
      if (!d) continue;
      if (!map.has(d)) continue;
      const cur = map.get(d)!;
      cur.tasks = cur.tasks + 1;
      if (String(r.status).toLowerCase() === "completed")
        cur.completed = cur.completed + 1;
      map.set(d, cur);
    }

    const data = Array.from(map.entries()).map(([date, val]) => ({
      date,
      ...val,
    }));

    const config = {
      tasks: { label: "Tasks", color: "var(--chart-1)" },
      completed: { label: "Completed", color: "var(--chart-2)" },
    };

    return NextResponse.json({ data, config });
  } catch (err) {
    console.error("GET /api/staff/chart error", err);
    return NextResponse.json(null, { status: 500 });
  }
}
