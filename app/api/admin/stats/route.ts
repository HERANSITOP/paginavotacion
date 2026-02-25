import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

function checkAuth(req: NextRequest): boolean {
  const auth = req.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  return token === process.env.ADMIN_PASSWORD;
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [polls, totalVoters, recentVotes] = await Promise.all([
      // All polls with per-option vote counts
      sql`
        SELECT
          p.id           AS poll_id,
          p.title,
          p.status,
          p.multi_choice,
          p.hidden,
          p.created_at,
          o.id         AS option_id,
          o.text,
          o.position,
          COALESCE(COUNT(v.id), 0)::int AS votes
        FROM polls p
        JOIN poll_options o ON o.poll_id = p.id
        LEFT JOIN poll_votes v ON v.option_id = o.id
        GROUP BY p.id, o.id
        ORDER BY p.created_at DESC, o.position
      `,
      // Total unique voters (across all polls)
      sql`SELECT COUNT(DISTINCT email_hash)::int AS total FROM poll_voters`,
      // Last 20 votes with poll + option info
      sql`
        SELECT
          v.id,
          p.title     AS poll_title,
          o.text      AS option_text,
          v.created_at
        FROM poll_votes v
        JOIN poll_options o ON o.id = v.option_id
        JOIN polls        p ON p.id = v.poll_id
        ORDER BY v.created_at DESC
        LIMIT 20
      `,
    ]);

    // Group into poll objects
    type Row = {
      poll_id: number; title: string; status: string; multi_choice: boolean; hidden: boolean; created_at: string;
      option_id: number; text: string; position: number; votes: number;
    };
    const pollMap = new Map<number, {
      id: number; title: string; status: string; multi_choice: boolean; hidden: boolean; created_at: string;
      total: number;
      options: { id: number; text: string; votes: number; pct: number }[];
    }>();

    for (const r of polls as Row[]) {
      if (!pollMap.has(r.poll_id)) {
        pollMap.set(r.poll_id, {
          id: r.poll_id, title: r.title, status: r.status, multi_choice: r.multi_choice,
          hidden: r.hidden, created_at: r.created_at, total: 0, options: [],
        });
      }
      pollMap.get(r.poll_id)!.options.push({
        id: r.option_id, text: r.text, votes: r.votes, pct: 0,
      });
      pollMap.get(r.poll_id)!.total += r.votes;
    }

    const pollsOut = Array.from(pollMap.values()).map((p) => {
      p.options.forEach((o) => {
        o.pct = p.total > 0 ? +((o.votes / p.total) * 100).toFixed(1) : 0;
      });
      return p;
    });

    return NextResponse.json({
      totalVoters: (totalVoters[0] as { total: number })?.total ?? 0,
      polls: pollsOut,
      recentVotes,
    });
  } catch (err) {
    console.error("[admin/stats]", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

