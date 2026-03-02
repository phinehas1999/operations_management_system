import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db, tenants } from "@/db/client";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json(null, { status: 401 });

    const tenantId = session.user.tenantId;
    if (!tenantId) return NextResponse.json(null, { status: 404 });

    const t = await db.query.tenants.findFirst({
      where: eq(tenants.id, tenantId),
    });
    if (!t) return NextResponse.json(null, { status: 404 });

    return NextResponse.json({ id: t.id, name: t.name });
  } catch (err) {
    console.error("GET /api/tenant/current error", err);
    return NextResponse.json(null, { status: 500 });
  }
}
