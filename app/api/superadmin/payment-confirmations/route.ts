import { NextResponse } from "next/server";
import { eq, desc } from "drizzle-orm";

import { auth } from "@/auth";
import { db } from "@/db/client";
import { paymentConfirmations, invoices } from "@/db/schema";
import { requireTenantApi } from "@/lib/tenant-auth";

export async function GET() {
  const session = await auth();

  // Superadmin sees all confirmations
  if (session?.user?.role === "SUPERADMIN") {
    const confirmations = await db.query.paymentConfirmations.findMany({
      with: {
        tenant: true,
        invoice: true,
      },
      orderBy: [desc(paymentConfirmations.createdAt)],
    });

    return NextResponse.json(confirmations);
  }

  // Tenant (admin) sees only their own confirmations
  const tenantId = session?.user?.tenantId;
  if (!tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const confirmations = await db.query.paymentConfirmations.findMany({
    where: eq(paymentConfirmations.tenantId, tenantId),
    with: {
      invoice: true,
    },
    orderBy: [desc(paymentConfirmations.createdAt)],
  });

  return NextResponse.json(confirmations);
}

export async function POST(req: Request) {
  const { tenant, response } = await requireTenantApi();
  if (response) return response;

  try {
    const body = await req.json().catch(() => ({}));
    const {
      invoiceId,
      amountCents,
      amount,
      currency = "USD",
      paymentDate,
      paymentMethod,
      transactionReference,
      proofFileUrl,
    } = body as Record<string, unknown>;

    if (!invoiceId || !paymentDate || !paymentMethod) {
      return NextResponse.json(
        { error: "invoiceId, paymentDate, and paymentMethod are required" },
        { status: 400 },
      );
    }

    const invoice = await db.query.invoices.findFirst({
      where: eq(invoices.id, invoiceId as string),
    });

    if (!invoice || invoice.tenantId !== tenant!.id) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const resolvedAmountCents = Math.max(
      0,
      Math.round(Number(amountCents ?? amount ?? invoice.amountCents ?? 0)),
    );

    const [created] = await db
      .insert(paymentConfirmations)
      .values({
        tenantId: tenant!.id,
        invoiceId: invoice.id,
        amountCents: resolvedAmountCents,
        currency: (currency as string) || "USD",
        paymentDate: new Date(paymentDate as string),
        paymentMethod: paymentMethod as string,
        transactionReference:
          typeof transactionReference === "string"
            ? transactionReference
            : null,
        proofFileUrl: typeof proofFileUrl === "string" ? proofFileUrl : null,
      })
      .returning();

    return NextResponse.json(created);
  } catch (error) {
    console.error("Error creating payment confirmation:", error);
    return NextResponse.json(
      { error: "Failed to create payment confirmation" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (session?.user?.role !== "SUPERADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, status, adminNote } = await req.json();

  if (!id || !status) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 },
    );
  }

  try {
    // Update confirmation status
    const [updatedConfirmation] = await db
      .update(paymentConfirmations)
      .set({
        status,
        adminNote,
        updatedAt: new Date(),
      })
      .where(eq(paymentConfirmations.id, id))
      .returning();

    // If approved, update invoice status
    if (status === "Approved" && updatedConfirmation.invoiceId) {
      await db
        .update(invoices)
        .set({
          status: "Paid",
          updatedAt: new Date(),
        })
        .where(eq(invoices.id, updatedConfirmation.invoiceId));
    }

    // If rejected and the related invoice is currently marked Paid, revert it to Due
    // (Simple heuristic for MVP — can be made more robust later.)
    if (status === "Rejected" && updatedConfirmation.invoiceId) {
      const found = await db
        .select()
        .from(invoices)
        .where(eq(invoices.id, updatedConfirmation.invoiceId));

      const invoice = found[0];
      if (invoice && invoice.status === "Paid") {
        await db
          .update(invoices)
          .set({ status: "Due", updatedAt: new Date() })
          .where(eq(invoices.id, updatedConfirmation.invoiceId));
      }
    }

    return NextResponse.json(updatedConfirmation);
  } catch (error) {
    console.error("Error updating payment confirmation:", error);
    return NextResponse.json(
      { error: "Failed to update payment confirmation" },
      { status: 500 },
    );
  }
}
