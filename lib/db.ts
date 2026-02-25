import { neon } from "@neondatabase/serverless";

// Lazily resolved so the module can be imported during build without DATABASE_URL.
// The error will only surface at request-time when the variable is actually needed.
function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  return neon(url);
}

// Typed as a tagged-template that always returns Promise<Row[]> so callers can
// index and iterate freely without fighting the union type from @neondatabase.
type Row = Record<string, unknown>;
type SqlQuery = {
  (strings: TemplateStringsArray, ...values: unknown[]): Promise<Row[]>;
  transaction: (queries: Promise<Row[]>[]) => Promise<Row[][]>;
};

export const sql: SqlQuery = Object.assign(
  (strings: TemplateStringsArray, ...values: unknown[]) =>
    getDb()(strings, ...values) as Promise<Row[]>,
  {
    transaction: (queries: Promise<Row[]>[]) =>
      (getDb() as unknown as { transaction: (q: Promise<Row[]>[]) => Promise<Row[][]> }).transaction(queries),
  }
);
