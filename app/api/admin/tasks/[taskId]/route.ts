import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";

import { db, users } from "@/db/client";
import { tasks, teams } from "@/db/adminSchema";
import { requireTenantApi } from "@/lib/tenant-auth";

const STATUS_VALUES = ["pending", "in-progress", "review", "completed"];
const PRIORITY_VALUES = ["low", "medium", "high", "critical"];

type AssigneeType = "USER" | "TEAM" | "UNASSIGNED";

function normalizeStatus(value: unknown): string {
  const v = typeof value === "string" ? value.toLowerCase() : "";
  return STATUS_VALUES.includes(v) ? v : "pending";
}

function normalizePriority(value: unknown): string {
  const v = typeof value === "string" ? value.toLowerCase() : "";
  return PRIORITY_VALUES.includes(v) ? v : "medium";
}

function parseDate(value: unknown): Date | null {
  if (!value) return null;
  const d = new Date(value as string);
  return Number.isNaN(d.getTime()) ? null : d;
}

async function fetchTask(taskId: string, tenantId: string) {
  return db
    .select({
      id: tasks.id,
      title: tasks.title,
      description: tasks.description,
      status: tasks.status,
      priority: tasks.priority,
      dueAt: tasks.dueAt,
      assigneeType: tasks.assigneeType,
      assigneeUserId: tasks.assigneeId,
      assigneeTeamId: tasks.assigneeTeamId,
      createdAt: tasks.createdAt,
      updatedAt: tasks.updatedAt,
      createdBy: tasks.createdBy,
      assigneeUserName: users.name,
      assigneeUserEmail: users.email,
      assigneeTeamName: teams.name,
    })
    .from(tasks)
    .leftJoin(users, eq(tasks.assigneeId, users.id))
    .leftJoin(teams, eq(tasks.assigneeTeamId, teams.id))
    .where(and(eq(tasks.id, taskId), eq(tasks.tenantId, tenantId)))
    .then((r) => r[0] || null);
}

export async function GET(
  _req: Request,
  ctx: { params: { taskId: string } | Promise<{ taskId: string }> },
) {
  try {
    const params = await ctx.params;
    const taskId = params?.taskId;
    const { tenant, response } = await requireTenantApi();
    if (response) return response;
    if (!tenant)
      return NextResponse.json({ error: "Tenant required" }, { status: 403 });
    if (!taskId)
      return NextResponse.json({ error: "Missing task id" }, { status: 400 });

    const row = await fetchTask(taskId, tenant.id);
    if (!row)
      return NextResponse.json({ error: "Task not found" }, { status: 404 });

    const assigneeName =
      row.assigneeType === "TEAM"
        ? row.assigneeTeamName || ""
        : row.assigneeUserName || row.assigneeUserEmail || "";

    return NextResponse.json({ task: { ...row, assigneeName } });
  } catch (err) {
    console.error("GET /api/admin/tasks/[taskId] error", err);
    return NextResponse.json(
      { error: "Failed to fetch task" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: Request,
  ctx: { params: { taskId: string } | Promise<{ taskId: string }> },
) {
  try {
    const params = await ctx.params;
    const taskId = params?.taskId;
    const { tenant, response } = await requireTenantApi();
    if (response) return response;
    if (!tenant)
      return NextResponse.json({ error: "Tenant required" }, { status: 403 });
    if (!taskId)
      return NextResponse.json({ error: "Missing task id" }, { status: 400 });

    const body = await req.json();
    const patch: Record<string, unknown> = {};

    if (body.title !== undefined) patch.title = String(body.title || "").trim();
    if (body.description !== undefined)
      patch.description = body.description ? String(body.description) : null;
    if (body.status !== undefined) patch.status = normalizeStatus(body.status);
    if (body.priority !== undefined)
      patch.priority = normalizePriority(body.priority);
    if (body.dueAt !== undefined) patch.dueAt = parseDate(body.dueAt);

    if (body.assigneeType !== undefined) {
      const rawType = String(body.assigneeType).toUpperCase() as AssigneeType;
      if (rawType === "USER" && typeof body.assigneeId === "string") {
        const user = await db.query.users.findFirst({
          where: eq(users.id, body.assigneeId),
        });
        if (!user || user.tenantId !== tenant.id)
          return NextResponse.json(
            { error: "Invalid assignee" },
            { status: 400 },
          );
        patch.assigneeType = "USER";
        patch.assigneeId = user.id;
        patch.assigneeTeamId = null;
      } else if (rawType === "TEAM" && typeof body.assigneeId === "string") {
        const team = await db
          .select({ id: teams.id, tenantId: teams.tenantId })
          .from(teams)
          .where(eq(teams.id, body.assigneeId))
          .then((r) => r[0] || null);
        if (!team || team.tenantId !== tenant.id)
          return NextResponse.json(
            { error: "Invalid assignee" },
            { status: 400 },
          );
        patch.assigneeType = "TEAM";
        patch.assigneeTeamId = team.id;
        patch.assigneeId = null;
      } else {
        patch.assigneeType = "UNASSIGNED";
        patch.assigneeId = null;
        patch.assigneeTeamId = null;
      }
    }

    const updated = await db
      .update(tasks)
      .set(patch)
      .where(and(eq(tasks.id, taskId), eq(tasks.tenantId, tenant.id)))
      .returning();

    if (!updated || updated.length === 0)
      return NextResponse.json({ error: "Task not found" }, { status: 404 });

    const row = await fetchTask(taskId, tenant.id);
    const assigneeName = row
      ? row.assigneeType === "TEAM"
        ? row.assigneeTeamName || ""
        : row.assigneeUserName || row.assigneeUserEmail || ""
      : "";

    return NextResponse.json({
      task: row ? { ...row, assigneeName } : updated[0],
    });
  } catch (err) {
    console.error("PATCH /api/admin/tasks/[taskId] error", err);
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: Request,
  ctx: { params: { taskId: string } | Promise<{ taskId: string }> },
) {
  try {
    const params = await ctx.params;
    const taskId = params?.taskId;
    const { tenant, response } = await requireTenantApi();
    if (response) return response;
    if (!tenant)
      return NextResponse.json({ error: "Tenant required" }, { status: 403 });
    if (!taskId)
      return NextResponse.json({ error: "Missing task id" }, { status: 400 });

    const deleted = await db
      .delete(tasks)
      .where(and(eq(tasks.id, taskId), eq(tasks.tenantId, tenant.id)))
      .returning({ id: tasks.id });

    if (!deleted || deleted.length === 0)
      return NextResponse.json({ error: "Task not found" }, { status: 404 });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/admin/tasks/[taskId] error", err);
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 },
    );
  }
}
