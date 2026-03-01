import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "../db/schema";
import "dotenv/config";
import { eq } from "drizzle-orm";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const sql = neon(connectionString);
const db = drizzle(sql, { schema });

async function main() {
  console.log("Seeding payment confirmations...");

  // Fetch all existing invoices
  const allInvoices = await db.select().from(schema.invoices);

  if (allInvoices.length === 0) {
    console.log("No invoices found. Please seed invoices first.");
    return;
  }

  console.log(`Found ${allInvoices.length} invoices.`);

  const paymentMethods = ["Bank Transfer", "Credit Card", "PayPal", "Check"];
  const statuses: ("Pending" | "Approved" | "Rejected")[] = [
    "Pending",
    "Approved",
    "Rejected",
  ];

  let count = 0;

  for (const inv of allInvoices) {
    // 40% chance to have a payment confirmation for any given invoice
    if (Math.random() > 0.4) continue;

    // Pick a random status
    // Bias towards 'Pending' for demo purposes, so we have things to approve
    const rand = Math.random();
    let status: "Pending" | "Approved" | "Rejected" = "Pending";

    if (rand > 0.6) status = "Approved";
    else if (rand > 0.9) status = "Rejected";

    const amount = inv.amountCents;
    const method =
      paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
    const date = new Date();
    // randomize date slightly
    date.setDate(date.getDate() - Math.floor(Math.random() * 10));

    await db.insert(schema.paymentConfirmations).values({
      tenantId: inv.tenantId,
      invoiceId: inv.id,
      amountCents: amount,
      currency: inv.currency,
      paymentDate: date,
      paymentMethod: method,
      transactionReference: `TXN-${Math.random().toString(36).substring(7).toUpperCase()}`,
      proofFileUrl:
        Math.random() > 0.5
          ? "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
          : null,
      status: status,
      adminNote:
        status === "Rejected"
          ? "Transaction ID does not match our records."
          : null,
    });
    count++;
  }

  console.log(`Seeding complete. Created ${count} payment confirmations.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
