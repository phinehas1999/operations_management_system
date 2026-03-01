import { NextRequest, NextResponse } from "next/server";
import { and, eq, ilike, or } from "drizzle-orm";

import { db, billingPlans, invoices, tenants } from "@/db/client";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search") || searchParams.get("q");
    const tenantId = searchParams.get("tenantId");
    const planId = searchParams.get("planId");

    const where = [] as any[];
    if (status && status !== "all")
      where.push(eq(invoices.status, status as any));
    if (tenantId) where.push(eq(invoices.tenantId, tenantId));
    if (planId) where.push(eq(invoices.planId, planId));
    if (search) {
      const term = `%${search}%`;
      where.push(
        or(
          ilike(invoices.invoiceNumber, term),
          ilike(invoices.planName, term),
          ilike(tenants.name, term),
        ),
      );
    }

    const rows = await db
      .select({
        id: invoices.id,
        invoiceNumber: invoices.invoiceNumber,
        tenantId: invoices.tenantId,
        tenantName: tenants.name,
        planId: invoices.planId,
        planName: invoices.planName,
        planNameFallback: billingPlans.name,
        amountCents: invoices.amountCents,
        currency: invoices.currency,
        status: invoices.status,
        issuedAt: invoices.issuedAt,
        dueAt: invoices.dueAt,
        periodStart: invoices.periodStart,
        periodEnd: invoices.periodEnd,
      })
      .from(invoices)
      .leftJoin(tenants, eq(tenants.id, invoices.tenantId))
      .leftJoin(billingPlans, eq(billingPlans.id, invoices.planId))
      .where(where.length ? and(...where) : undefined)
      .orderBy(invoices.issuedAt, invoices.invoiceNumber);

    const data = rows.map((row) => ({
      ...row,
      planName: row.planName ?? row.planNameFallback ?? null,
    }));

    return NextResponse.json(data);
  } catch (err) {
    console.error("GET /api/superadmin/invoices error", err);
    return NextResponse.json(
      { error: "Failed to load invoices" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const invoiceNumber = (body.invoiceNumber || "").trim();
    const tenantId = body.tenantId as string | undefined;
    let planId = body.planId as string | null | undefined;
    let planName = (body.planName || "").trim() || null;

    if (!invoiceNumber || !tenantId) {
      return NextResponse.json(
        { error: "Missing invoiceNumber or tenantId" },
        { status: 400 },
      );
    }

    if (planId && !planName) {
      const planLookup = await db
        .select({ name: billingPlans.name })
        .from(billingPlans)
        .where(eq(billingPlans.id, planId))
        .limit(1);
      planName = planLookup[0]?.name ?? planName;
    }

    const amountCents = Math.max(
      0,
      Math.round(Number(body.amountCents ?? body.amount ?? 0)),
    );

    const [invoice] = await db
      .insert(invoices)
      .values({
        invoiceNumber,
        tenantId,
        planId: planId || null,
        planName,
        amountCents,
        currency: (body.currency || "USD") as string,
        status: (body.status || "Due") as any,
        issuedAt: body.issuedAt ? new Date(body.issuedAt) : undefined,
        dueAt: body.dueAt ? new Date(body.dueAt) : undefined,
        periodStart: body.periodStart ? new Date(body.periodStart) : undefined,
        periodEnd: body.periodEnd ? new Date(body.periodEnd) : undefined,
        meta: body.meta || {},
      })
      .returning();

    return NextResponse.json({ success: true, invoice });
  } catch (err) {
    console.error("POST /api/superadmin/invoices error", err);
    return NextResponse.json(
      { error: "Failed to create invoice" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id } = body as { id?: string };
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const patch: Record<string, unknown> = {};
    if (body.invoiceNumber !== undefined)
      patch.invoiceNumber = (body.invoiceNumber || "").trim();
    if (body.tenantId !== undefined) patch.tenantId = body.tenantId;
    if (body.planId !== undefined) patch.planId = body.planId;
    if (body.planName !== undefined)
      patch.planName = (body.planName || "").trim();
    if (body.amountCents !== undefined || body.amount !== undefined)
      patch.amountCents = Math.max(
        0,
        Math.round(Number(body.amountCents ?? body.amount ?? 0)),
      );
    if (body.currency !== undefined) patch.currency = body.currency;
    if (body.status !== undefined) patch.status = body.status;
    if (body.issuedAt !== undefined)
      patch.issuedAt = body.issuedAt ? new Date(body.issuedAt) : null;
    if (body.dueAt !== undefined)
      patch.dueAt = body.dueAt ? new Date(body.dueAt) : null;
    if (body.periodStart !== undefined)
      patch.periodStart = body.periodStart ? new Date(body.periodStart) : null;
    if (body.periodEnd !== undefined)
      patch.periodEnd = body.periodEnd ? new Date(body.periodEnd) : null;
    if (body.meta !== undefined) patch.meta = body.meta;

    if (Object.keys(patch).length === 0) {
      return NextResponse.json(
        { error: "No updatable fields provided" },
        { status: 400 },
      );
    }

    const [updated] = await db
      .update(invoices)
      .set(patch)
      .where(eq(invoices.id, id))
      .returning();

    return NextResponse.json({ success: true, invoice: updated ?? null });
  } catch (err) {
    console.error("PATCH /api/superadmin/invoices error", err);
    return NextResponse.json(
      { error: "Failed to update invoice" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { id } = body as { id?: string };
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    await db.delete(invoices).where(eq(invoices.id, id));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/superadmin/invoices error", err);
    return NextResponse.json(
      { error: "Failed to delete invoice" },
      { status: 500 },
    );
  }
}
