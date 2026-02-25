import { neon } from "@neondatabase/serverless";

// Lazily resolved so the module can be imported during build without DATABASE_URL.
// The error will only surface at request-time when the variable is actually needed.
function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  return neon(url);
}

export const sql: ReturnType<typeof neon> = new Proxy({} as ReturnType<typeof neon>, {
  get(_target, prop) {
    const db = getDb();
    const value = (db as unknown as Record<string | symbol, unknown>)[prop];
    return typeof value === "function" ? value.bind(db) : value;
  },
  apply(_target, _thisArg, args) {
    return (getDb() as unknown as (...a: unknown[]) => unknown)(...args);
  },
});
