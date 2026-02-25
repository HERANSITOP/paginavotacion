/**
 * Run database migrations against Neon DB.
 * Usage: node scripts/migrate.mjs
 * Requires DATABASE_URL in environment (or .env.local).
 */

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// Load .env.local if present (Next.js convention)
try {
  const { config } = await import("dotenv");
  config({ path: resolve(process.cwd(), ".env.local") });
} catch {
  // dotenv is optional; rely on env being pre-set
}

const { neon } = await import("@neondatabase/serverless");

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("ERROR: DATABASE_URL is not set.");
  process.exit(1);
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const schemaFile = readFileSync(resolve(__dirname, "../sql/schema.sql"), "utf8");

// Remove single-line comments, then split on semicolons.
// The Neon HTTP client doesn't support multiple statements per call.
const withoutComments = schemaFile
  .split("\n")
  .filter((line) => !line.trim().startsWith("--"))
  .join("\n");

const statements = withoutComments
  .split(";")
  .map((s) => s.trim())
  .filter((s) => s.length > 0);

const db = neon(url);

console.log(`Running ${statements.length} migration statements…`);
for (const stmt of statements) {
  console.log(" →", stmt.substring(0, 60).replace(/\s+/g, " "));
  await db(stmt);
}
console.log("✅  Migrations complete.");
