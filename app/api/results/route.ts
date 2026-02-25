import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const revalidate = 30; // ISR: re-fetch results at most every 30 s

export interface OptionResult {
  id: number;
  name: string;
  count: number;
}

export async function GET() {
  try {
    const rows = await sql`
      SELECT o.id, o.name, COALESCE(COUNT(v.id), 0)::int AS count
      FROM options o
      LEFT JOIN votes v ON o.id = v.option_id
      GROUP BY o.id, o.name
      ORDER BY o.id
    `;
    return NextResponse.json(rows as OptionResult[]);
  } catch (err) {
    console.error("[api/results]", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
