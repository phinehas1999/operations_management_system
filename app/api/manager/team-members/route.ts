import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";

import { db } from "@/db/client";
import { teams, userTeams } from "@/db/adminSchema";
import { requireTenantApi } from "@/lib/tenant-auth";

export async function GET() {
  try {
    const { session, tenant, response } = await requireTenantApi();
    if (response) return response;
    if (!session || !tenant) return NextResponse.json(null, { status: 401 });

    const managerId = session.user?.id;
    if (!managerId) return NextResponse.json(null, { status: 400 });

    // fetch teams managed by this manager
    const myTeams = await db
      .select({ id: teams.id, name: teams.name })
      .from(teams)
      .where(
        and(eq(teams.tenantId, tenant.id), eq(teams.managerId, managerId)),
      );

    // fetch members for each team
    const membersById: Record<string, any> = {};
    for (const t of myTeams) {
      const rows = await db
        .select({ userId: userTeams.userId, role: userTeams.role })
        .from(userTeams)
        .where(eq(userTeams.teamId, t.id));

      for (const r of rows) {
        const uid = String(r.userId);
        if (!membersById[uid]) {
          // fetch user basic info
          const u = await db.query.users.findFirst({
            where: eq((await import("@/db/schema")).users.id, r.userId),
          });
          membersById[uid] = {
            id: r.userId,
            name: (u && (u as any).name) || null,
            email: (u && (u as any).email) || null,
            role: r.role || null,
            teams: [t.name],
            createdAt: u ? (u as any).createdAt : null,
          };
        } else {
          if (!membersById[uid].teams.includes(t.name))
            membersById[uid].teams.push(t.name);
        }
      }
    }

    const members = Object.values(membersById);
    return NextResponse.json({ members });
  } catch (err) {
    console.error("GET /api/manager/team-members error", err);
    return NextResponse.json(null, { status: 500 });
  }
}
