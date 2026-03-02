const { Client } = require("pg");
require("dotenv").config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL is not set. Set it in your .env and retry.");
  process.exit(1);
}

async function main() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  try {
    console.log("Checking drizzle.__drizzle_migrations sequence...");
    const res = await client.query(
      "SELECT pg_get_serial_sequence('drizzle.__drizzle_migrations','id') AS seq",
    );
    const seqName = res.rows[0] && res.rows[0].seq;
    if (!seqName) {
      console.log(
        "No sequence found for drizzle.__drizzle_migrations.id — nothing to do.",
      );
      return;
    }

    console.log("Sequence found:", seqName);
    const setvalSql = `SELECT setval('${seqName}', (SELECT COALESCE(MAX(id), 0) FROM drizzle.__drizzle_migrations)) AS new_val`;
    const setRes = await client.query(setvalSql);
    console.log("Sequence reset result:", setRes.rows[0]);
  } catch (err) {
    console.error("Error while fixing sequence:", err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
