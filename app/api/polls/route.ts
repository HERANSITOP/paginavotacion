import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const revalidate = 10; // ISR: refresh every 10 s

export interface PollOption {
  id: number;
  text: string;
  position: number;
  votes: number;
}

export interface PollResult {
  id: number;
  title: string;
  status: "open" | "closed";
  multi_choice: boolean;
  created_at: string;
  closed_at: string | null;
  total_votes: number;
  options: PollOption[];
}

export async function GET() {
  try {
    const polls = (await sql`
      SELECT
        p.id,
        p.title,
        p.status,
        p.multi_choice,
        p.created_at,
        p.closed_at,
        COALESCE(SUM(vote_counts.cnt), 0)::int AS total_votes
      FROM polls p
      LEFT JOIN (
        SELECT poll_id, COUNT(*)::int AS cnt
        FROM poll_votes
        GROUP BY poll_id
      ) vote_counts ON vote_counts.poll_id = p.id
      WHERE p.hidden = FALSE
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `) as {
      id: number;
      title: string;
      status: string;
      multi_choice: boolean;
      created_at: string;
      closed_at: string | null;
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

    const optionsByPoll = options.reduce<Record<number, PollOption[]>>(
      (acc, o) => {
        if (!acc[o.poll_id]) acc[o.poll_id] = [];
        acc[o.poll_id].push({
          id: o.id,
          text: o.text,
          position: o.position,
          votes: o.votes,
        });
        return acc;
      },
      {}
    );

    const result: PollResult[] = polls.map((p) => ({
      id: p.id,
      title: p.title,
      status: p.status as "open" | "closed",
      multi_choice: p.multi_choice,
      created_at: p.created_at,
      closed_at: p.closed_at,
      total_votes: p.total_votes,
      options: optionsByPoll[p.id] ?? [],
    }));

    return NextResponse.json(result);
  } catch (err) {
    console.error("[api/polls]", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
