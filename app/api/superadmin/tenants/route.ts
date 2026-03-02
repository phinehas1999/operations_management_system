import { NextResponse } from "next/server";
import { hash } from "argon2";
import { eq } from "drizzle-orm";

import { db, tenants, billingPlans, users } from "@/db/client";
import type { Role } from "@/db/schema";

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
    const {
      name,
      slug,
      seats,
      adminEmail,
      adminPassword,
      adminName,
      monthlyRevenue,
      status,
      planId,
    } = body as any;

    const safeName = typeof name === "string" ? name.trim() : "";
    const safeSlug = typeof slug === "string" ? slug.trim().toLowerCase() : "";
    const safeAdminEmail =
      typeof adminEmail === "string" ? adminEmail.trim().toLowerCase() : "";
    const safeAdminPassword =
      typeof adminPassword === "string" ? adminPassword.trim() : "";
    const safeAdminName =
      typeof adminName === "string" ? adminName.trim() : safeName;
    const safePlanId =
      typeof planId === "string" && planId.trim().length > 0
        ? planId.trim()
        : null;

    if (!safeName || !safeSlug) {
      return NextResponse.json(
        { error: "Missing name or slug" },
        { status: 400 },
      );
    }

    if (!safeAdminEmail || !safeAdminPassword) {
      return NextResponse.json(
        { error: "Missing admin email or password" },
        { status: 400 },
      );
    }

    const slugExists = await db.query.tenants.findFirst({
      where: eq(tenants.slug, safeSlug),
    });

    if (slugExists) {
      return NextResponse.json(
        { error: "Slug already exists" },
        { status: 409 },
      );
    }

    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, safeAdminEmail),
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with that email already exists" },
        { status: 409 },
      );
    }

    const insertData: any = {
      name: safeName,
      slug: safeSlug,
      status: status === "Active" || status === "Suspended" ? status : "Active",
      seats: seats ? Number(seats) : 1,
      adminEmail: safeAdminEmail || null,
      monthlyRevenue: monthlyRevenue ? Number(monthlyRevenue) : 0,
    };

    if (safePlanId) {
      const planExists = await db.query.billingPlans.findFirst({
        where: eq(billingPlans.id, safePlanId),
      });
      if (!planExists) {
        return NextResponse.json({ error: "Plan not found" }, { status: 400 });
      }
      insertData.planId = safePlanId;
    }

    const passwordHash = await hash(safeAdminPassword);

    // NOTE: neon-http driver doesn't support transactions. Insert tenant
    // first, then insert user. If user insert fails, remove the tenant
    // to avoid leaving partial state (best-effort rollback).
    const inserted = await db.insert(tenants).values(insertData).returning();
    const tenant = inserted[0] ?? null;
    if (!tenant) {
      return NextResponse.json(
        { error: "Failed to create tenant" },
        { status: 500 },
      );
    }

    try {
      await db.insert(users).values({
        email: safeAdminEmail,
        name: safeAdminName,
        password: passwordHash,
        role: "ADMIN" as Role,
        tenantId: tenant.id,
        isSuperAdmin: false,
      });
    } catch (userErr: any) {
      console.error(
        "Failed to create admin user, rolling back tenant",
        userErr,
      );
      try {
        await db.delete(tenants).where(eq(tenants.id, tenant.id));
      } catch (delErr) {
        console.error(
          "Failed to rollback tenant after user insert failure",
          delErr,
        );
      }

      const msg = typeof userErr?.message === "string" ? userErr.message : "";
      if (
        msg.includes("users_email") ||
        msg.includes("email") ||
        msg.includes("duplicate key")
      ) {
        return NextResponse.json(
          { error: "User with that email already exists" },
          { status: 409 },
        );
      }

      return NextResponse.json(
        { error: "Failed to create admin user" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, tenant });
  } catch (err: any) {
    console.error("POST /api/superadmin/tenants error", err);

    const message = typeof err?.message === "string" ? err.message : "";
    if (message.includes("duplicate key") || message.includes("unique")) {
      if (message.includes("tenants_slug") || message.includes("slug")) {
        return NextResponse.json(
          { error: "Slug already exists" },
          { status: 409 },
        );
      }
      if (message.includes("users_email") || message.includes("email")) {
        return NextResponse.json(
          { error: "User with that email already exists" },
          { status: 409 },
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to create tenant" },
      { status: 500 },
    );
  }
}
