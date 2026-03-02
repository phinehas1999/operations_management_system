import { NextResponse } from "next/server";
import { hash } from "argon2";
import { eq, and } from "drizzle-orm";

import { db, users } from "@/db/client";
import { requireTenantApi } from "@/lib/tenant-auth";
import type { Role } from "@/db/schema";

export async function POST(req: Request) {
  try {
    const { session, tenant, response } = await requireTenantApi();
    if (response) return response;

    if (!tenant) {
      return NextResponse.json({ error: "Tenant required" }, { status: 403 });
    }

    const body = await req.json();
    const name = typeof body.name === "string" ? body.name.trim() : null;
    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const role =
      typeof body.role === "string" ? (body.role as Role) : ("STAFF" as Role);

    if (!email || !password) {
      return NextResponse.json(
        { error: "Missing email or password" },
        { status: 400 },
      );
    }

    const existing = await db.query.users.findFirst({
      where: eq(users.email, email),
    });
    if (existing) {
      return NextResponse.json(
        { error: "User with that email already exists" },
        { status: 409 },
      );
    }

    const passwordHash = await hash(password);

    const inserted = await db
      .insert(users)
      .values({
        email,
        name,
        password: passwordHash,
        role: role as Role,
        tenantId: tenant.id,
        isSuperAdmin: false,
      })
      .returning();

    const created = inserted[0] ?? null;
    if (!created) {
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 500 },
      );
    }

    // Do not return password hash to client
    const { password: _p, ...safe } = created as any;

    return NextResponse.json({ success: true, user: safe });
  } catch (err: any) {
    console.error("POST /api/admin/users error", err);
    const msg = typeof err?.message === "string" ? err.message : "";
    if (msg.includes("duplicate key") || msg.includes("unique")) {
      if (msg.includes("users_email") || msg.includes("email")) {
        return NextResponse.json(
          { error: "User with that email already exists" },
          { status: 409 },
        );
      }
    }
    return NextResponse.json(
      { error: "Failed to create user" },
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

    const deleted = await db
      .delete(users)
      .where(and(eq(users.id, id), eq(users.tenantId, tenant.id)))
      .returning();
    if (!deleted || deleted.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/admin/users error", err);
    return NextResponse.json(
      { error: "Failed to delete user" },
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
    if (body.email !== undefined) {
      const safeEmail =
        typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
      if (!safeEmail) {
        return NextResponse.json({ error: "Invalid email" }, { status: 400 });
      }
      // ensure uniqueness within tenant
      const existing = await db.query.users.findFirst({
        where: and(eq(users.email, safeEmail), eq(users.tenantId, tenant.id)),
      });
      if (existing && existing.id !== id) {
        return NextResponse.json(
          { error: "User with that email already exists" },
          { status: 409 },
        );
      }
      patch.email = safeEmail;
    }
    if (body.role !== undefined) patch.role = body.role;
    if (body.status !== undefined) patch.status = body.status;

    if (Object.keys(patch).length === 0) {
      return NextResponse.json(
        { error: "No updatable fields provided" },
        { status: 400 },
      );
    }

    const updated = await db
      .update(users)
      .set(patch)
      .where(and(eq(users.id, id), eq(users.tenantId, tenant.id)))
      .returning();
    const out = updated[0] ?? null;
    if (!out)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const { password: _p, ...safe } = out as any;
    return NextResponse.json({ success: true, user: safe });
  } catch (err) {
    console.error("PATCH /api/admin/users error", err);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 },
    );
  }
}
