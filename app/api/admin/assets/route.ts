import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { db, assets } from "@/db/client";
import { requireTenantApi } from "@/lib/tenant-auth";

export async function GET() {
  const { tenant, response } = await requireTenantApi();
  if (response) return response;

  const rows = await db.query.assets.findMany({
    where: eq(assets.tenantId, tenant!.id),
    orderBy: (a, { desc }) => desc(a.createdAt),
  });

  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const { tenant, response, session } = await requireTenantApi();
  if (response) return response;

  const body = await req.json().catch(() => ({}));
  const {
    name,
    category,
    quantity = 0,
    minimumThreshold = 0,
    teamId = null,
    status = "Active",
  } = body;

  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const created = await db
    .insert(assets)
    .values({
      name,
      category: category ?? null,
      quantity: Number(quantity) || 0,
      minimumThreshold: Number(minimumThreshold) || 0,
      status: status ?? "Active",
      teamId: teamId ?? null,
      tenantId: tenant!.id,
    })
    .returning();

  return NextResponse.json(created[0]);
}
