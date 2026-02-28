import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set. Add it to your environment.");
}

const sql = neon(connectionString);

export const db = drizzle({ client: sql, schema });
export type DbClient = typeof db;
export * from "./schema";
