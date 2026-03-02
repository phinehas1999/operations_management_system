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

export async function GET(req: Request) {
  try {
    const { tenant, response } = await requireTenantApi();
    if (response) return response;
    if (!tenant)
      return NextResponse.json({ error: "Tenant required" }, { status: 403 });

    const url = new URL(req.url);
    const status = url.searchParams.get("status");
    const priority = url.searchParams.get("priority");
    const assigneeId = url.searchParams.get("assigneeId");
    const assigneeType = url.searchParams.get(
      "assigneeType",
    ) as AssigneeType | null;

    const conditions = [eq(tasks.tenantId, tenant.id)];
    if (status && status !== "all") conditions.push(eq(tasks.status, status));
    if (priority && priority !== "all")
      conditions.push(eq(tasks.priority, priority));
    if (assigneeId && assigneeType === "USER")
      conditions.push(eq(tasks.assigneeId, assigneeId));
    if (assigneeId && assigneeType === "TEAM")
      conditions.push(eq(tasks.assigneeTeamId, assigneeId));

    const rows = await db
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
      .where(and(...conditions));

    const tasksOut = rows.map((row) => {
      const assigneeName =
        row.assigneeType === "TEAM"
          ? row.assigneeTeamName || ""
          : row.assigneeUserName || row.assigneeUserEmail || "";
      return { ...row, assigneeName };
    });

    return NextResponse.json({ tasks: tasksOut });
  } catch (err) {
    console.error("GET /api/admin/tasks error", err);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const { tenant, session, response } = await requireTenantApi();
    if (response) return response;
    if (!tenant)
      return NextResponse.json({ error: "Tenant required" }, { status: 403 });

    const body = await req.json();
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const description =
      typeof body.description === "string" ? body.description.trim() : null;
    const status = normalizeStatus(body.status);
    const priority = normalizePriority(body.priority);
    const dueAt = parseDate(body.dueAt);

    let assigneeType: AssigneeType = "UNASSIGNED";
    let assigneeUserId: string | null = null;
    let assigneeTeamId: string | null = null;

    if (body.assigneeType === "USER" && typeof body.assigneeId === "string") {
      const user = await db.query.users.findFirst({
        where: eq(users.id, body.assigneeId),
      });
      if (!user || user.tenantId !== tenant.id)
        return NextResponse.json(
          { error: "Invalid assignee" },
          { status: 400 },
        );
      assigneeType = "USER";
      assigneeUserId = user.id;
    } else if (
      body.assigneeType === "TEAM" &&
      typeof body.assigneeId === "string"
    ) {
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
      assigneeType = "TEAM";
      assigneeTeamId = team.id;
    }

    const creatorId = session?.user?.id ?? null;

    if (!title)
      return NextResponse.json({ error: "Missing title" }, { status: 400 });

    const inserted = await db
      .insert(tasks)
      .values({
        tenantId: tenant.id,
        title,
        description,
        status,
        priority,
        dueAt,
        assigneeType,
        assigneeId: assigneeUserId,
        assigneeTeamId,
        createdBy: creatorId,
      })
      .returning();

    const created = inserted[0] ?? null;
    if (!created)
      return NextResponse.json(
        { error: "Failed to create task" },
        { status: 500 },
      );

    // hydrate with joins for display
    const row = await db
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
      .where(and(eq(tasks.id, created.id), eq(tasks.tenantId, tenant.id)))
      .then((r) => r[0] || null);

    const assigneeName = row
      ? row.assigneeType === "TEAM"
        ? row.assigneeTeamName || ""
        : row.assigneeUserName || row.assigneeUserEmail || ""
      : "";

    return NextResponse.json({
      task: row ? { ...row, assigneeName } : created,
    });
  } catch (err) {
    console.error("POST /api/admin/tasks error", err);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 },
    );
  }
}
