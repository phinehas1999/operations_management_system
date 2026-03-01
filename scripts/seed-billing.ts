import "dotenv/config";
import { randomInt } from "crypto";
import { db, billingPlans, invoices, tenants } from "../db/client";
import { eq } from "drizzle-orm";

async function upsertPlan(p: any) {
  const existing = await db
    .select()
    .from(billingPlans)
    .where(eq(billingPlans.slug, p.slug));

  if (existing.length) return existing[0];

  const [inserted] = await db.insert(billingPlans).values(p).returning();
  return inserted;
}

async function upsertTenantBySlug(slug: string, data: any) {
  const existing = await db
    .select()
    .from(tenants)
    .where(eq(tenants.slug, slug));
  if (existing.length) return existing[0];

  const [inserted] = await db.insert(tenants).values(data).returning();
  return inserted;
}

function cents(n: number) {
  return Math.round(n * 100);
}

async function main() {
  console.log("Seeding billing plans, tenants and invoices...");

  const planDefs = [
    {
      name: "Free",
      slug: "free",
      priceMonthlyCents: cents(0),
      priceYearlyCents: cents(0),
      seats: 3,
      features: ["Basic tasks", "1 team", "Email support"],
    },
    {
      name: "Pro",
      slug: "pro",
      priceMonthlyCents: cents(29),
      priceYearlyCents: cents(299),
      seats: 25,
      features: ["Unlimited tasks", "Teams", "Priority support"],
    },
    {
      name: "Enterprise",
      slug: "enterprise",
      priceMonthlyCents: cents(199),
      priceYearlyCents: cents(1999),
      seats: null,
      features: ["SAML SSO", "Dedicated support", "Custom SLAs"],
    },
  ];

  const createdPlans: any[] = [];
  for (const p of planDefs) {
    const plan = await upsertPlan(p);
    createdPlans.push(plan);
    console.log("Plan ready:", plan.slug ?? plan.name);
  }

  // Create tenants
  const TENANT_COUNT = Number(process.env.SEED_TENANT_COUNT || "10");

  const samplePrefixes = [
    "Acme",
    "Beta",
    "Gamma",
    "Delta",
    "Epsilon",
    "Zeta",
    "Eta",
    "Theta",
    "Iota",
    "Kappa",
    "Lambda",
    "Omicron",
  ];

  const tenantNames: string[] = [];
  for (let i = 0; i < TENANT_COUNT; i++) {
    const base = samplePrefixes[i] ?? `Tenant`;
    tenantNames.push(`${base} ${i + 1}`);
  }

  const createdTenants: any[] = [];

  for (let i = 0; i < tenantNames.length; i++) {
    const name = tenantNames[i];
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + (i + 1);

    // pick a plan round-robin
    const plan = createdPlans[i % createdPlans.length];

    const seats = plan.seats ?? randomInt(5, 200);

    const tenantData = {
      name,
      slug,
      planId: plan?.id ?? null,
      status: "Active" as any,
      seats,
      adminEmail: `${slug.replace(/-/g, "")}@example.com`,
      monthlyRevenue: randomInt(0, 20000),
    };

    const tenant = await upsertTenantBySlug(slug, tenantData);
    createdTenants.push({ ...tenant, planRef: plan });
    console.log(existingOrCreatedLog(tenant, name));
  }

  // Create invoices for each tenant (1-3 invoices)
  const statuses = ["Paid", "Due", "Overdue"] as const;
  for (const t of createdTenants) {
    // Skip creating invoices if tenant already has invoices (idempotent)
    const existingInv = await db
      .select()
      .from(invoices)
      .where(eq(invoices.tenantId, t.id))
      .limit(1);
    if (existingInv.length) {
      console.log("Skipping invoices for", t.name, "- already present.");
      continue;
    }

    const num = randomInt(1, 4);
    for (let k = 0; k < num; k++) {
      const plan = t.planRef as any;
      const baseCents = plan?.priceMonthlyCents ?? cents(randomInt(10, 500));
      const amountCents = baseCents; // could randomize a bit
      const status = statuses[randomInt(0, statuses.length)];

      const invoiceNumber = `${new Date().getFullYear()}-${Date.now().toString().slice(-6)}-${randomInt(10, 999)}`;

      const [inv] = await db
        .insert(invoices)
        .values({
          invoiceNumber,
          tenantId: t.id,
          planId: plan?.id ?? null,
          planName: plan?.name ?? null,
          amountCents,
          currency: "USD",
          status: status as any,
          issuedAt: new Date(
            Date.now() - randomInt(0, 1000 * 60 * 60 * 24 * 90),
          ),
          dueAt: new Date(Date.now() + randomInt(0, 1000 * 60 * 60 * 24 * 30)),
        })
        .returning();

      console.log(
        "Created invoice",
        inv.invoiceNumber,
        "for",
        t.name,
        "status",
        inv.status,
      );
    }
  }

  function existingOrCreatedLog(tenant: any, desiredName: string) {
    if (tenant && tenant.name === desiredName)
      return `Tenant ready: ${tenant.name}`;
    if (tenant) return `Tenant exists: ${tenant.name}`;
    return `Tenant created: ${desiredName}`;
  }

  console.log("Seeding complete.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
