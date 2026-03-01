import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { paymentConfirmations, invoices } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "SUPERADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const confirmations = await db.query.paymentConfirmations.findMany({
    with: {
      tenant: true,
      invoice: true,
    },
    orderBy: [desc(paymentConfirmations.createdAt)],
  });

  return NextResponse.json(confirmations);
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
