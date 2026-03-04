import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { db, assets } from "@/db/client";
import { requireTenantApi } from "@/lib/tenant-auth";

export async function GET(_req: Request, context: any) {
  const params = context?.params ?? {};
  const { tenant, response } = await requireTenantApi();
  if (response) return response;

  const row = await db.query.assets.findFirst({
    where: (a, { eq }) => eq(a.id, params.id) && eq(a.tenantId, tenant!.id),
  });
  if (!row) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json(row);
}

export async function PATCH(req: Request, context: any) {
  const params = context?.params ?? {};
  const { tenant, response } = await requireTenantApi();
  if (response) return response;

  const body = await req.json().catch(() => ({}));
  const updates: Record<string, any> = {};
  if (body.name !== undefined) updates.name = body.name;
  if (body.category !== undefined) updates.category = body.category;
  if (body.quantity !== undefined)
    updates.quantity = Number(body.quantity) || 0;
  if (body.minimumThreshold !== undefined)
    updates.minimumThreshold = Number(body.minimumThreshold) || 0;
  if (body.teamId !== undefined) updates.teamId = body.teamId ?? null;
  if (body.status !== undefined) updates.status = body.status;

  const existing = await db.query.assets.findFirst({
    where: (a, { eq }) => eq(a.id, params.id) && eq(a.tenantId, tenant!.id),
  });
  if (!existing)
    return NextResponse.json({ error: "not_found" }, { status: 404 });

  const updated = await db
    .update(assets)
    .set(updates)
    .where(eq(assets.id, params.id))
    .returning();
  return NextResponse.json(updated[0]);
}

export async function DELETE(_req: Request, context: any) {
  const params = context?.params ?? {};
  const { tenant, response } = await requireTenantApi();
  if (response) return response;

  const existing = await db.query.assets.findFirst({
    where: (a, { eq }) => eq(a.id, params.id) && eq(a.tenantId, tenant!.id),
  });
  if (!existing)
    return NextResponse.json({ error: "not_found" }, { status: 404 });

  await db.delete(assets).where(eq(assets.id, params.id));
  return NextResponse.json({ ok: true });
}
