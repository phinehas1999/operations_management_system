import { defineConfig } from "drizzle-kit";
import dotenv from "dotenv";

// Load environment variables from .env (for CLI tooling)
dotenv.config({ path: ".env" });

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});
