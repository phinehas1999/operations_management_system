import { NextResponse } from "next/server";
import { db, tenants, billingPlans } from "@/db/client";
import { eq } from "drizzle-orm";

type PatchBody = { id?: string; status?: string } & Record<string, any>;

export async function GET() {
  try {
    const rows = await db
      .select({
        id: tenants.id,
        slug: tenants.slug,
        name: tenants.name,
        planId: tenants.planId,
        status: tenants.status,
        seats: tenants.seats,
        adminEmail: tenants.adminEmail,
        monthlyRevenue: tenants.monthlyRevenue,
        settings: tenants.settings,
        createdAt: tenants.createdAt,
        planName: billingPlans.name,
        planSlug: billingPlans.slug,
      })
      .from(tenants)
      .leftJoin(billingPlans, eq(billingPlans.id, tenants.planId))
      .orderBy(tenants.name);
    return NextResponse.json(rows);
  } catch (err) {
    console.error("GET /api/superadmin/tenants error", err);
    return NextResponse.json(
      { error: "Failed to load tenants" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const body: PatchBody = await req.json();
    const { id } = body;
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    // If status provided, validate and update only status
    if (body.status !== undefined) {
      const status = body.status;
      if (!["Active", "Suspended"].includes(status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }
      const updated = await db
        .update(tenants)
        .set({ status: status as any })
        .where(eq(tenants.id, id))
        .returning();
      return NextResponse.json({ success: true, updated: updated[0] ?? null });
    }

    // Otherwise allow updating fields: name, slug, planId, seats, adminEmail, monthlyRevenue
    const patch: any = {};
    if (body.name !== undefined) patch.name = body.name;
    if (body.slug !== undefined) patch.slug = body.slug;
    if (body.planId !== undefined) patch.planId = body.planId;
    if (body.seats !== undefined) patch.seats = Number(body.seats || 0);
    if (body.adminEmail !== undefined)
      patch.adminEmail = body.adminEmail || null;
    if (body.monthlyRevenue !== undefined)
      patch.monthlyRevenue = Number(body.monthlyRevenue || 0);

    if (Object.keys(patch).length === 0) {
      return NextResponse.json(
        { error: "No updatable fields provided" },
        { status: 400 },
      );
    }

    const updated = await db
      .update(tenants)
      .set(patch)
      .where(eq(tenants.id, id))
      .returning();

    return NextResponse.json({ success: true, updated: updated[0] ?? null });
  } catch (err) {
    console.error("PATCH /api/superadmin/tenants error", err);
    return NextResponse.json(
      { error: "Failed to update tenant" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { id } = body as { id?: string };
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    await db.delete(tenants).where(eq(tenants.id, id));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/superadmin/tenants error", err);
    return NextResponse.json(
      { error: "Failed to delete tenant" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, slug, seats, adminEmail, monthlyRevenue } = body as any;
    if (!name || !slug) {
      return NextResponse.json(
        { error: "Missing name or slug" },
        { status: 400 },
      );
    }

    const insertData: any = {
      name,
      slug,
      status: "Active" as any,
      seats: seats ? Number(seats) : 1,
      adminEmail: adminEmail || null,
      monthlyRevenue: monthlyRevenue ? Number(monthlyRevenue) : 0,
    };

    if (body.planId) insertData.planId = body.planId;

    const insert = await db.insert(tenants).values(insertData).returning();

    return NextResponse.json({ success: true, tenant: insert[0] ?? null });
  } catch (err) {
    console.error("POST /api/superadmin/tenants error", err);
    return NextResponse.json(
      { error: "Failed to create tenant" },
      { status: 500 },
    );
  }
}
