import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { db, users } from "@/db/client";
import { teams, userTeams } from "@/db/adminSchema";
import { requireTenantApi } from "@/lib/tenant-auth";

export async function GET(req: Request, ctx: any) {
  try {
    const { session, tenant, response } = await requireTenantApi();
    if (response) return response;
    if (!tenant)
      return NextResponse.json({ error: "Tenant required" }, { status: 403 });

    const params = await ctx.params;
    const { teamId } = params ?? {};
    if (!teamId)
      return NextResponse.json({ error: "Missing teamId" }, { status: 400 });

    const [t] = await db
      .select({
        id: teams.id,
        name: teams.name,
        description: teams.description,
        managerId: teams.managerId,
        tenantId: teams.tenantId,
      })
      .from(teams)
      .where(eq(teams.id, teamId));
    if (!t || t.tenantId !== tenant.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const members = await db
      .select({ id: users.id, name: users.name, role: userTeams.role })
      .from(userTeams)
      .leftJoin(users, eq(users.id, userTeams.userId))
      .where(eq(userTeams.teamId, teamId));

    return NextResponse.json({ success: true, team: t, members });
  } catch (err) {
    console.error("GET /api/admin/teams/[teamId] error", err);
    return NextResponse.json(
      { error: "Failed to fetch team" },
      { status: 500 },
    );
  }
}
