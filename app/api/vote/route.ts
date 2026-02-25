import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { sql } from "@/lib/db";
import { hashEmail } from "@/lib/hash";
import { checkGeo } from "@/lib/geo";

const ALLOWED_DOMAIN = "@unal.edu.co";

export async function POST(req: NextRequest) {
  // ── 1. Auth ───────────────────────────────────────────────────────────────
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const email: string = session.user.email ?? "";
  if (!email.toLowerCase().endsWith(ALLOWED_DOMAIN)) {
    return NextResponse.json(
      { error: "Solo correos @unal.edu.co" },
      { status: 403 }
    );
  }

  // ── 2. Geo restriction ────────────────────────────────────────────────────
  const geo = await checkGeo(req.headers);
  if (!geo.allowed) {
    return NextResponse.json({ error: "geo_blocked" }, { status: 403 });
  }

  // ── 3. Parse body ─────────────────────────────────────────────────────────
  // Supports both single-choice { poll_id, option_id }
  // and multi-choice            { poll_id, option_ids: number[] }
  const body = await req.json().catch(() => ({}));
  const pollId = Number(body.poll_id);
  if (!Number.isInteger(pollId) || pollId < 1) {
    return NextResponse.json({ error: "Invalid poll_id" }, { status: 400 });
  }

  // Normalise to an array of option IDs
  let optionIds: number[];
  if (Array.isArray(body.option_ids)) {
    optionIds = body.option_ids.map(Number).filter(
      (n: number) => Number.isInteger(n) && n > 0
    );
  } else {
    const single = Number(body.option_id);
    optionIds = Number.isInteger(single) && single > 0 ? [single] : [];
  }

  if (optionIds.length === 0) {
    return NextResponse.json({ error: "No valid options selected" }, { status: 400 });
  }

  // ── 4. Validate poll exists, is open, and all option IDs belong to it ────
  const pollRows = (await sql`
    SELECT status, multi_choice
    FROM   polls
    WHERE  id = ${pollId}
    LIMIT 1
  `) as { status: string; multi_choice: boolean }[];

  if (pollRows.length === 0) {
    return NextResponse.json({ error: "Poll not found" }, { status: 404 });
  }
  const { status: pollStatus, multi_choice } = pollRows[0];
  if (pollStatus !== "open") {
    return NextResponse.json({ error: "Poll is closed" }, { status: 409 });
  }
  // Single-choice polls must receive exactly one option
  if (!multi_choice && optionIds.length > 1) {
    return NextResponse.json({ error: "Poll only allows one choice" }, { status: 400 });
  }

  // Verify every submitted option belongs to this poll
  const validOpts = (await sql`
    SELECT id FROM poll_options
    WHERE poll_id = ${pollId}
      AND id = ANY(${optionIds})
  `) as { id: number }[];

  if (validOpts.length !== optionIds.length) {
    return NextResponse.json({ error: "Invalid option(s) for poll" }, { status: 400 });
  }

  // ── 5. Deduplicate per (poll, voter) and insert all votes atomically ──────
  const emailHash = hashEmail(email);

  try {
    await sql.transaction([
      // Unique constraint on (poll_id, email_hash) handles dedup
      sql`INSERT INTO poll_voters (poll_id, email_hash) VALUES (${pollId}, ${emailHash})`,
      // Insert one row per selected option
      ...optionIds.map(
        (oid) => sql`INSERT INTO poll_votes (poll_id, option_id) VALUES (${pollId}, ${oid})`
      ),
    ]);
  } catch (err: unknown) {
    const pgErr = err as { code?: string };
    if (pgErr?.code === "23505") {
      return NextResponse.json({ error: "already_voted" }, { status: 409 });
    }
    console.error("[api/vote]", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}


