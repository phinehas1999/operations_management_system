require("dotenv").config();
const { Client } = require("pg");

const sample = [
  [
    "Acme Corporation",
    "acme-corp",
    "Enterprise",
    "Active",
    120,
    "admin@acme.example",
    2400,
  ],
  [
    "Bluewater Ltd",
    "bluewater",
    "Pro",
    "Active",
    45,
    "ops@bluewater.example",
    540,
  ],
  [
    "Greenfield Co",
    "greenfield",
    "Trial",
    "Active",
    8,
    "contact@greenfield.example",
    0,
  ],
  [
    "Northbridge Partners",
    "northbridge",
    "Enterprise",
    "Suspended",
    300,
    "admin@northbridge.example",
    6800,
  ],
  ["Summit Labs", "summit-labs", "Pro", "Active", 22, "it@summit.example", 330],
  [
    "Harbor Retail",
    "harbor-retail",
    "Basic",
    "Suspended",
    12,
    "billing@harbor.example",
    95,
  ],
  [
    "Vertex Solutions",
    "vertex-solutions",
    "Pro",
    "Active",
    60,
    "admin@vertex.example",
    720,
  ],
  ["Pine & Co", "pine-co", "Trial", "Active", 4, "hello@pine.example", 0],
  [
    "Orchid Media",
    "orchid-media",
    "Basic",
    "Active",
    10,
    "info@orchid.example",
    120,
  ],
  [
    "Cobalt Systems",
    "cobalt-systems",
    "Pro",
    "Active",
    55,
    "admin@cobalt.example",
    660,
  ],
  [
    "Amber Logistics",
    "amber-logistics",
    "Enterprise",
    "Active",
    200,
    "ops@amber.example",
    4800,
  ],
  [
    "Nimbus Tech",
    "nimbus-tech",
    "Pro",
    "Active",
    34,
    "support@nimbus.example",
    408,
  ],
  [
    "Sprout Farms",
    "sprout-farms",
    "Basic",
    "Active",
    6,
    "hello@sprout.example",
    72,
  ],
  [
    "Helix Health",
    "helix-health",
    "Enterprise",
    "Active",
    150,
    "admin@helix.example",
    3000,
  ],
  [
    "Atlas Finance",
    "atlas-finance",
    "Pro",
    "Active",
    48,
    "billing@atlas.example",
    576,
  ],
];

async function run() {
  const conn = process.env.DATABASE_URL;
  if (!conn) {
    console.error("DATABASE_URL not set");
    process.exit(1);
  }

  const client = new Client({ connectionString: conn });
  await client.connect();

  try {
    for (const row of sample) {
      const [name, slug, plan, status, seats, adminEmail, monthlyRevenue] = row;
      const text = `INSERT INTO tenants (name, slug, plan, status, seats, admin_email, monthly_revenue)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (slug) DO UPDATE SET
          name = EXCLUDED.name,
          plan = EXCLUDED.plan,
          status = EXCLUDED.status,
          seats = EXCLUDED.seats,
          admin_email = EXCLUDED.admin_email,
          monthly_revenue = EXCLUDED.monthly_revenue`;
      await client.query(text, [
        name,
        slug,
        plan,
        status,
        seats,
        adminEmail,
        monthlyRevenue,
      ]);
    }
    console.log("Seeded tenants (15)");
  } catch (err) {
    console.error("Seed failed", err);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

run();
