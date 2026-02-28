import { NextResponse } from "next/server";
import { db, tenants } from "@/db/client";
import { eq } from "drizzle-orm";

type PatchBody = { id?: string; status?: string };

export async function GET() {
  try {
    const rows = await db.select().from(tenants).orderBy(tenants.name);
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
    const { id, status } = body;
    if (!id || !status) {
      return NextResponse.json(
        { error: "Missing id or status" },
        { status: 400 },
      );
    }

    // Only allow known statuses
    if (!["Active", "Suspended"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const updated = await db
      .update(tenants)
      .set({ status: status as any })
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
