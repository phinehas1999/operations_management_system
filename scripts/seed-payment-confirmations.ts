import "dotenv/config";
import { db } from "../db/client";
import { invoices, paymentConfirmations } from "../db/schema";
import { paymentStatusEnum } from "../db/schema";
import { eq, desc, sql } from "drizzle-orm";

async function main() {
  console.log("Seeding payment confirmations...");

  // Fetch some existing invoices
  const allInvoices = await db.select().from(invoices).limit(50);

  if (allInvoices.length === 0) {
    console.log("No invoices found. Please seed tenants/invoices first.");
    return;
  }

  console.log(
    `Found ${allInvoices.length} invoices. creating confirmations...`,
  );

  const paymentMethods = ["Bank Transfer", "Credit Card", "PayPal", "Check"];

  for (const inv of allInvoices) {
    // Determine status based on invoice status or random
    // If Invoice is Paid -> create Approved confirmation
    // If Invoice is Due -> create Pending confirmation (simulating recent payment)
    // Sometimes create Rejected confirmation for any invoice (maybe history)

    let status: "Pending" | "Approved" | "Rejected" = "Pending";
    let amount = inv.amountCents;

    if (inv.status === "Paid") {
      status = "Approved";
    } else if (Math.random() > 0.7) {
      // 30% chance to have a pending payment for a due invoice
      status = "Pending";
    } else {
      // Skip some invoices to not have confirmation for everything
      if (Math.random() > 0.5) continue;
    }

    // Occasional rejected payment
    if (Math.random() > 0.9) {
      status = "Rejected";
    }

    const confirmationData = {
      tenantId: inv.tenantId,
      invoiceId: inv.id,
      amountCents: amount,
      currency: inv.currency,
      paymentDate: new Date(),
      paymentMethod:
        paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
      transactionReference: `TXN-${Math.random().toString(36).substring(7).toUpperCase()}`,
      proofFileUrl:
        Math.random() > 0.5 ? "https://example.com/receipt.pdf" : null,
      status: status,
      adminNote: status === "Rejected" ? "Invalid transaction ID" : null,
    };

    await db.insert(paymentConfirmations).values(confirmationData);
    console.log(
      `Created ${status} confirmation for Invoice ${inv.invoiceNumber}`,
    );
  }

  console.log("Seeding complete!");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
