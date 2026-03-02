import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { db, users } from "@/db/client";
import { teams } from "@/db/adminSchema";
import { requireTenantApi } from "@/lib/tenant-auth";

export async function GET() {
  try {
    const { tenant, response } = await requireTenantApi();
    if (response) return response;
    if (!tenant)
      return NextResponse.json({ error: "Tenant required" }, { status: 403 });

    const userList = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
      })
      .from(users)
      .where(eq(users.tenantId, tenant.id));

    const teamList = await db
      .select({ id: teams.id, name: teams.name })
      .from(teams)
      .where(eq(teams.tenantId, tenant.id));

    return NextResponse.json({ users: userList, teams: teamList });
  } catch (err) {
    console.error("GET /api/admin/tasks/options error", err);
    return NextResponse.json(
      { error: "Failed to load options" },
      { status: 500 },
    );
  }
}
