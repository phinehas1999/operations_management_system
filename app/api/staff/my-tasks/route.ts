import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";

import { db } from "@/db/client";
import { tasks } from "@/db/adminSchema";
import { users } from "@/db/schema";
import { requireTenantApi } from "@/lib/tenant-auth";

export async function GET(req: Request) {
  try {
    const { session, tenant, response } = await requireTenantApi();
    if (response) return response;
    if (!session || !tenant) return NextResponse.json(null, { status: 401 });

    const userId = session.user?.id;
    if (!userId) return NextResponse.json(null, { status: 400 });

    const rows = await db
      .select({
        id: tasks.id,
        title: tasks.title,
        priority: tasks.priority,
        status: tasks.status,
        createdBy: tasks.createdBy,
        dueAt: tasks.dueAt,
        createdByName: users.name,
      })
      .from(tasks)
      .leftJoin(users, eq(tasks.createdBy, users.id))
      .where(
        and(
          eq(tasks.tenantId, tenant.id),
          eq(tasks.assigneeId, userId),
          eq(tasks.assigneeType, "USER"),
        ),
      )
      .orderBy(tasks.createdAt);

    const tasksOut = rows.map((r: any) => ({
      id: r.id,
      title: r.title,
      priority: r.priority,
      status: r.status,
      createdBy: r.createdByName || null,
      dueAt: r.dueAt || null,
    }));

    return NextResponse.json({ tasks: tasksOut });
  } catch (err) {
    console.error("GET /api/staff/my-tasks error", err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
