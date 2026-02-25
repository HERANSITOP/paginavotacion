import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

function checkAuth(req: NextRequest): boolean {
  const auth = req.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  return token === process.env.ADMIN_PASSWORD;
}

// DELETE /api/admin/reset
// Body (optional): { poll_id: number }  → clears votes for one poll
// Body (empty)                          → deletes ALL polls and their data
export async function DELETE(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const pollId = body?.poll_id ? Number(body.poll_id) : null;

    if (pollId && Number.isInteger(pollId)) {
      // Clear only votes + voters for this poll (keep poll & options)
      await sql`DELETE FROM poll_votes  WHERE poll_id = ${pollId}`;
      await sql`DELETE FROM poll_voters WHERE poll_id = ${pollId}`;
      return NextResponse.json({ ok: true, message: `Votes for poll ${pollId} cleared.` });
    }

    // Full wipe — cascade handles child tables via ON DELETE CASCADE
    await sql`DELETE FROM polls`;
    return NextResponse.json({ ok: true, message: "All polls and votes cleared." });
  } catch (err) {
    console.error("[admin/reset]", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

