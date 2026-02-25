import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

function checkAuth(req: NextRequest): boolean {
  const auth = req.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  return token === process.env.ADMIN_PASSWORD;
}

// ── GET /api/admin/polls — list all polls with counts ────────────────────────
export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const polls = (await sql`
      SELECT
        p.id,
        p.title,
        p.status,
        p.multi_choice,
        p.created_at,
        p.closed_at,
        COALESCE(voters.cnt, 0)::int AS total_voters,
        COALESCE(votes.cnt,  0)::int AS total_votes
      FROM polls p
      LEFT JOIN (
        SELECT poll_id, COUNT(*)::int AS cnt FROM poll_voters GROUP BY poll_id
      ) voters ON voters.poll_id = p.id
      LEFT JOIN (
        SELECT poll_id, COUNT(*)::int AS cnt FROM poll_votes GROUP BY poll_id
      ) votes ON votes.poll_id = p.id
      ORDER BY p.created_at DESC
    `) as {
      id: number;
      title: string;
      status: string;
      multi_choice: boolean;
      created_at: string;
      closed_at: string | null;
      total_voters: number;
      total_votes: number;
    }[];

    const options = (await sql`
      SELECT
        o.id,
        o.poll_id,
        o.text,
        o.position,
        COALESCE(COUNT(v.id), 0)::int AS votes
      FROM poll_options o
      LEFT JOIN poll_votes v ON v.option_id = o.id
      GROUP BY o.id
      ORDER BY o.poll_id, o.position
    `) as {
      id: number;
      poll_id: number;
      text: string;
      position: number;
      votes: number;
    }[];

    const byPoll = options.reduce<Record<number, typeof options>>((acc, o) => {
      if (!acc[o.poll_id]) acc[o.poll_id] = [];
      acc[o.poll_id].push(o);
      return acc;
    }, {});

    return NextResponse.json(
      polls.map((p) => ({ ...p, options: byPoll[p.id] ?? [] }))
    );
  } catch (err) {
    console.error("[admin/polls GET]", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

// ── POST /api/admin/polls — create poll ──────────────────────────────────────
// Body: { title: string, options: string[], multi_choice?: boolean }
export async function POST(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const title: string        = (body.title ?? "").trim();
  const options: string[]    = Array.isArray(body.options) ? body.options : [];
  const multiChoice: boolean = Boolean(body.multi_choice);

  if (!title || options.length < 2) {
    return NextResponse.json(
      { error: "title and at least 2 options required" },
      { status: 400 }
    );
  }

  try {
    const [poll] = (await sql`
      INSERT INTO polls (title, status, multi_choice) VALUES (${title}, 'open', ${multiChoice})
      RETURNING id
    `) as { id: number }[];

    const pollId = poll.id;

    for (let i = 0; i < options.length; i++) {
      const text = options[i].trim();
      if (text) {
        await sql`
          INSERT INTO poll_options (poll_id, text, position)
          VALUES (${pollId}, ${text}, ${i})
        `;
      }
    }

    return NextResponse.json({ ok: true, id: pollId }, { status: 201 });
  } catch (err) {
    console.error("[admin/polls POST]", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

// ── PATCH /api/admin/polls — open / close poll, or toggle hidden ─────────────
// Body: { id: number, status: 'open' | 'closed' }
//    OR { id: number, hidden: boolean }
export async function PATCH(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const id = Number(body.id);

  if (!Number.isInteger(id) || id < 1) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  try {
    // ── Toggle hidden ────────────────────────────────────────────────────────
    if (typeof body.hidden === "boolean") {
      await sql`UPDATE polls SET hidden = ${body.hidden} WHERE id = ${id}`;
      return NextResponse.json({ ok: true });
    }

    // ── Toggle status ────────────────────────────────────────────────────────
    const status = body.status as string;
    if (!["open", "closed"].includes(status)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    if (status === "closed") {
      await sql`UPDATE polls SET status = 'closed', closed_at = NOW() WHERE id = ${id}`;
    } else {
      await sql`UPDATE polls SET status = 'open', closed_at = NULL WHERE id = ${id}`;
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[admin/polls PATCH]", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

// ── DELETE /api/admin/polls — delete poll (cascades) ─────────────────────────
// Body: { id: number }
export async function DELETE(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const id = Number(body.id);

  if (!Number.isInteger(id) || id < 1) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  try {
    await sql`DELETE FROM polls WHERE id = ${id}`;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[admin/polls DELETE]", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
