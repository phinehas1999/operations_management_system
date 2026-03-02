import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { db, users } from "@/db/client";
import { userTeams, teams } from "@/db/adminSchema";
import { requireTenantApi } from "@/lib/tenant-auth";

export async function GET(req: Request, ctx: any) {
  try {
    const { session, tenant, response } = await requireTenantApi();
    if (response) return response;
    if (!tenant)
      return NextResponse.json({ error: "Tenant required" }, { status: 403 });

    // `ctx.params` can be a Promise in Next.js — await it before use
    const params = await ctx.params;
    const { teamId } = params ?? {};
    if (!teamId)
      return NextResponse.json({ error: "Missing teamId" }, { status: 400 });

    // ensure team belongs to tenant (use Drizzle select against adminSchema teams)
    const [t] = await db
      .select({ id: teams.id, tenantId: teams.tenantId })
      .from(teams)
      .where(eq(teams.id, teamId));
    if (!t || t.tenantId !== tenant.id)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    const rows = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        createdAt: users.createdAt,
        role: userTeams.role,
      })
      .from(userTeams)
      .leftJoin(users, eq(users.id, userTeams.userId))
      .where(eq(userTeams.teamId, teamId));

    return NextResponse.json({ success: true, members: rows });
  } catch (err) {
    console.error("GET /api/admin/teams/[teamId]/members error", err);
    return NextResponse.json(
      { error: "Failed to list members" },
      { status: 500 },
    );
  }
}
