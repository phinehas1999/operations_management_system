import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";

import { db, invoices, billingPlans } from "@/db/client";
import { requireTenantApi } from "@/lib/tenant-auth";

export async function GET() {
  const { tenant, response } = await requireTenantApi();
  if (response) return response;

  const rows = await db
    .select({
      id: invoices.id,
      invoiceNumber: invoices.invoiceNumber,
      tenantId: invoices.tenantId,
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
    .leftJoin(billingPlans, eq(billingPlans.id, invoices.planId))
    .where(and(eq(invoices.tenantId, tenant!.id)))
    .orderBy(invoices.issuedAt, invoices.invoiceNumber);

  const data = rows.map((row) => ({
    ...row,
    planName: row.planName ?? row.planNameFallback ?? null,
  }));

  return NextResponse.json(data);
}
