import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL!;
if (!url) throw new Error("DATABASE_URL is not set");

// Re-use the same http-over-fetch client across requests in a serverless context.
export const sql = neon(url);
