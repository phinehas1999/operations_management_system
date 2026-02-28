#!/usr/bin/env node
const dotenv = require("dotenv");
const { execSync } = require("child_process");

dotenv.config({ path: ".env" });
const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL not set in .env");
  process.exit(1);
}

// Newer drizzle-kit versions read config when run without args.
const cmd = `npx drizzle-kit generate --config ./drizzle.config.ts`;
console.log("Running:", cmd);
execSync(cmd, { stdio: "inherit" });
