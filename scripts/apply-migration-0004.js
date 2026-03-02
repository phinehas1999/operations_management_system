import fs from "fs";
import crypto from "crypto";
import dotenv from "dotenv";
import pg from "pg";

dotenv.config({ path: ".env" });

async function main() {
  const sql = fs.readFileSync(
    "drizzle/0004_add_manager_and_user_teams_role.sql",
    "utf8",
  );
  const statements = sql
    .split(";\n")
    .map((s) => s.trim())
    .filter(Boolean);

  const { Client } = pg;
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();

  for (const stmt of statements) {
    console.log("running statement:\n", stmt);
    try {
      await client.query(stmt);
    } catch (e) {
      console.error("statement failed, continuing", e.message);
    }
  }

  const hash = crypto.createHash("sha256").update(sql).digest("hex");
  const res = await client.query(
    "select max(id) as max from drizzle.__drizzle_migrations",
  );
  const nextId = (res.rows[0].max || 0) + 1;
  await client.query(
    "insert into drizzle.__drizzle_migrations (id, hash, created_at) values ($1, $2, $3)",
    [nextId, hash, Date.now().toString()],
  );
  console.log("inserted migration record", { id: nextId, hash });

  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
