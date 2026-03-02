import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";

import { db, users } from "@/db/client";
import { teams, userTeams } from "@/db/adminSchema";
import { requireTenantApi } from "@/lib/tenant-auth";

export async function POST(req: Request) {
  try {
    const { session, tenant, response } = await requireTenantApi();
    if (response) return response;
    if (!tenant)
      return NextResponse.json({ error: "Tenant required" }, { status: 403 });

    const body = await req.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const description =
      typeof body.description === "string" ? body.description.trim() : null;
    const managerId =
      typeof body.managerId === "string" ? body.managerId : null;
    const memberIds = Array.isArray(body.memberIds)
      ? body.memberIds.filter(Boolean)
      : [];

    if (!name)
      return NextResponse.json({ error: "Missing name" }, { status: 400 });

    // validate managerId and memberIds belong to tenant
    if (managerId) {
      const m = await db.query.users.findFirst({
        where: eq(users.id, managerId),
      });
      if (!m || m.tenantId !== tenant.id)
        return NextResponse.json({ error: "Invalid manager" }, { status: 400 });
    }
    if (memberIds.length > 0) {
      const members = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.tenantId, tenant.id));
      const validIds = new Set(members.map((r) => r.id));
      for (const id of memberIds) {
        if (!validIds.has(id))
          return NextResponse.json(
            { error: "Invalid member id" },
            { status: 400 },
          );
      }
    }

    const inserted = await db
      .insert(teams)
      .values({
        tenantId: tenant.id,
        name,
        description,
        managerId,
      })
      .returning();

    const created = inserted[0] ?? null;
    if (!created)
      return NextResponse.json(
        { error: "Failed to create team" },
        { status: 500 },
      );

    // insert user_teams entries for members and manager
    const toInsert: any[] = [];
    const memberSet = new Set(memberIds || []);
    // ensure manager isn't duplicated in members; manager will be inserted with MANAGER role
    if (managerId && memberSet.has(managerId)) {
      memberSet.delete(managerId);
    }
    for (const id of Array.from(memberSet)) {
      toInsert.push({ userId: id, teamId: created.id, role: "STAFF" });
    }
    if (managerId) {
      toInsert.push({ userId: managerId, teamId: created.id, role: "MANAGER" });
    }
    if (toInsert.length > 0) {
      // Insert rows one-by-one to avoid driver issues with multi-row inserts
      for (const row of toInsert) {
        try {
          await db.insert(userTeams).values(row);
        } catch (e) {
          console.error("Failed to insert user_team row", row, e);
        }
      }
    }

    return NextResponse.json({ success: true, team: created });
  } catch (err) {
    console.error("POST /api/admin/teams error", err);
    return NextResponse.json(
      { error: "Failed to create team" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { session, tenant, response } = await requireTenantApi();
    if (response) return response;
    if (!tenant)
      return NextResponse.json({ error: "Tenant required" }, { status: 403 });

    const body = await req.json();
    const id = typeof body.id === "string" ? body.id : null;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    // delete team scoped to tenant
    const deleted = await db.delete(teams).where(eq(teams.id, id)).returning();

    if (!deleted || deleted.length === 0) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/admin/teams error", err);
    return NextResponse.json(
      { error: "Failed to delete team" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const { session, tenant, response } = await requireTenantApi();
    if (response) return response;
    if (!tenant)
      return NextResponse.json({ error: "Tenant required" }, { status: 403 });

    const body = await req.json();
    const id = typeof body.id === "string" ? body.id : null;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const patch: any = {};
    if (body.name !== undefined) patch.name = body.name || null;
    if (body.description !== undefined)
      patch.description = body.description || null;
    if (body.managerId !== undefined) patch.managerId = body.managerId || null;

    // validate manager and members belong to tenant
    const memberIds = Array.isArray(body.memberIds)
      ? body.memberIds.filter(Boolean)
      : null;
    if (patch.managerId) {
      const m = await db.query.users.findFirst({
        where: eq(users.id, patch.managerId),
      });
      if (!m || m.tenantId !== tenant.id)
        return NextResponse.json({ error: "Invalid manager" }, { status: 400 });
    }
    if (memberIds && memberIds.length > 0) {
      const members = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.tenantId, tenant.id));
      const validIds = new Set(members.map((r) => r.id));
      for (const mid of memberIds)
        if (!validIds.has(mid))
          return NextResponse.json(
            { error: "Invalid member id" },
            { status: 400 },
          );
    }

    const updated = await db
      .update(teams)
      .set(patch)
      .where(eq(teams.id, id))
      .returning();
    const out = updated[0] ?? null;
    if (!out)
      return NextResponse.json({ error: "Team not found" }, { status: 404 });

    // reconcile user_teams membership and roles if memberIds provided
    if (memberIds) {
      // fetch existing memberships
      const existing = await db
        .select({ userId: userTeams.userId, role: userTeams.role })
        .from(userTeams)
        .where(eq(userTeams.teamId, id));
      const existingMap = new Map(existing.map((e: any) => [e.userId, e.role]));

      const newSet = new Set(memberIds);
      if (patch.managerId) newSet.add(patch.managerId);

      // to remove: existing keys not in newSet
      const toRemove = Array.from(existingMap.keys()).filter(
        (u) => !newSet.has(u),
      );
      if (toRemove.length > 0) {
        for (const uid of toRemove) {
          await db
            .delete(userTeams)
            .where(and(eq(userTeams.userId, uid), eq(userTeams.teamId, id)));
        }
      }

      // to add or update
      for (const uid of Array.from(newSet)) {
        const role = uid === patch.managerId ? "MANAGER" : "STAFF";
        if (!existingMap.has(uid)) {
          await db.insert(userTeams).values({ userId: uid, teamId: id, role });
        } else if (existingMap.get(uid) !== role) {
          await db
            .update(userTeams)
            .set({ role })
            .where(and(eq(userTeams.userId, uid), eq(userTeams.teamId, id)));
        }
      }
    }

    return NextResponse.json({ success: true, team: out });
  } catch (err) {
    console.error("PATCH /api/admin/teams error", err);
    return NextResponse.json(
      { error: "Failed to update team" },
      { status: 500 },
    );
  }
}
