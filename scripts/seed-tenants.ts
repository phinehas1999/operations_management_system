import "dotenv/config";
import { db, tenants } from "../db/client";

async function main() {
  const now = new Date().toISOString();

  const sample = [
    {
      name: "Acme Corporation",
      slug: "acme-corp",
      plan: "Enterprise",
      status: "Active",
      seats: 120,
      adminEmail: "admin@acme.example",
      monthlyRevenue: 2400,
    },
    {
      name: "Bluewater Ltd",
      slug: "bluewater",
      plan: "Pro",
      status: "Active",
      seats: 45,
      adminEmail: "ops@bluewater.example",
      monthlyRevenue: 540,
    },
    {
      name: "Greenfield Co",
      slug: "greenfield",
      plan: "Trial",
      status: "Active",
      seats: 8,
      adminEmail: "contact@greenfield.example",
      monthlyRevenue: 0,
    },
    {
      name: "Northbridge Partners",
      slug: "northbridge",
      plan: "Enterprise",
      status: "Suspended",
      seats: 300,
      adminEmail: "admin@northbridge.example",
      monthlyRevenue: 6800,
    },
    {
      name: "Summit Labs",
      slug: "summit-labs",
      plan: "Pro",
      status: "Active",
      seats: 22,
      adminEmail: "it@summit.example",
      monthlyRevenue: 330,
    },
    {
      name: "Harbor Retail",
      slug: "harbor-retail",
      plan: "Basic",
      status: "Suspended",
      seats: 12,
      adminEmail: "billing@harbor.example",
      monthlyRevenue: 95,
    },
    {
      name: "Vertex Solutions",
      slug: "vertex-solutions",
      plan: "Pro",
      status: "Active",
      seats: 60,
      adminEmail: "admin@vertex.example",
      monthlyRevenue: 720,
    },
    {
      name: "Pine & Co",
      slug: "pine-co",
      plan: "Trial",
      status: "Active",
      seats: 4,
      adminEmail: "hello@pine.example",
      monthlyRevenue: 0,
    },
    {
      name: "Orchid Media",
      slug: "orchid-media",
      plan: "Basic",
      status: "Active",
      seats: 10,
      adminEmail: "info@orchid.example",
      monthlyRevenue: 120,
    },
    {
      name: "Cobalt Systems",
      slug: "cobalt-systems",
      plan: "Pro",
      status: "Active",
      seats: 55,
      adminEmail: "admin@cobalt.example",
      monthlyRevenue: 660,
    },
    {
      name: "Amber Logistics",
      slug: "amber-logistics",
      plan: "Enterprise",
      status: "Active",
      seats: 200,
      adminEmail: "ops@amber.example",
      monthlyRevenue: 4800,
    },
    {
      name: "Nimbus Tech",
      slug: "nimbus-tech",
      plan: "Pro",
      status: "Active",
      seats: 34,
      adminEmail: "support@nimbus.example",
      monthlyRevenue: 408,
    },
    {
      name: "Sprout Farms",
      slug: "sprout-farms",
      plan: "Basic",
      status: "Active",
      seats: 6,
      adminEmail: "hello@sprout.example",
      monthlyRevenue: 72,
    },
    {
      name: "Helix Health",
      slug: "helix-health",
      plan: "Enterprise",
      status: "Active",
      seats: 150,
      adminEmail: "admin@helix.example",
      monthlyRevenue: 3000,
    },
    {
      name: "Atlas Finance",
      slug: "atlas-finance",
      plan: "Pro",
      status: "Active",
      seats: 48,
      adminEmail: "billing@atlas.example",
      monthlyRevenue: 576,
    },
  ];

  try {
    // Prepare insert values, rely on DB defaults for id and createdAt
    const values = sample.map((t) => ({
      name: t.name,
      slug: t.slug,
      plan: t.plan as any,
      status: t.status as any,
      seats: t.seats,
      adminEmail: t.adminEmail,
      monthlyRevenue: t.monthlyRevenue,
    }));

    await db.insert(tenants).values(values);
    console.log("Inserted", values.length, "tenants");
  } catch (err) {
    console.error("Failed to seed tenants", err);
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
