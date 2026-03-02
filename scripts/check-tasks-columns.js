import dotenv from "dotenv";
import pg from "pg";

dotenv.config({ path: ".env" });

(async () => {
  const { Client } = pg;
  const c = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  await c.connect();
  const r = await c.query(
    "select column_name, data_type from information_schema.columns where table_name='tasks' order by ordinal_position",
  );
  console.log(r.rows);
  await c.end();
})();
