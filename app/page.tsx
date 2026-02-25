import { sql } from "@/lib/db";
import ResultsTable from "@/components/ResultsTable";
import PollResults from "@/components/PollResults";
import HomeClient from "@/components/HomeClient";
import LoginButton from "@/components/LoginButton";
import type { PollResult } from "@/app/api/polls/route";

// ISR: refresh every 15 s
export const revalidate = 15;

async function getAllPolls(): Promise<PollResult[]> {
  try {
    const polls = (await sql`
      SELECT
        p.id,
        p.title,
        p.status,
        p.multi_choice,
        p.created_at,
        p.closed_at,
        COALESCE(voters.cnt, 0)::int AS total_votes
      FROM polls p
      LEFT JOIN (
        SELECT poll_id, COUNT(*)::int AS cnt FROM poll_votes GROUP BY poll_id
      ) voters ON voters.poll_id = p.id
      WHERE p.hidden = FALSE
      ORDER BY p.created_at DESC
    `) as {
      id: number; title: string; status: string; multi_choice: boolean;
      created_at: string; closed_at: string | null; total_votes: number;
    }[];

    const options = (await sql`
      SELECT
        o.id, o.poll_id, o.text, o.position,
        COALESCE(COUNT(v.id), 0)::int AS votes
      FROM poll_options o
      LEFT JOIN poll_votes v ON v.option_id = o.id
      GROUP BY o.id
      ORDER BY o.poll_id, o.position
    `) as {
      id: number; poll_id: number; text: string; position: number; votes: number;
    }[];

    const byPoll = options.reduce<Record<number, typeof options>>((acc, o) => {
      if (!acc[o.poll_id]) acc[o.poll_id] = [];
      acc[o.poll_id].push(o);
      return acc;
    }, {});

    return polls.map((p) => ({
      id: p.id,
      title: p.title,
      status: p.status as "open" | "closed",
      multi_choice: p.multi_choice,
      created_at: p.created_at,
      closed_at: p.closed_at,
      total_votes: p.total_votes,
      options: (byPoll[p.id] ?? []).map((o) => ({
        id: o.id, text: o.text, position: o.position, votes: o.votes,
      })),
    }));
  } catch {
    return [];
  }
}

// Poll #1 is the "Mecanismo de movilización" — shown with the rich ResultsTable.
// All others get the generic PollResults card.
export default async function HomePage() {
  const polls = await getAllPolls();
  const poll1 = polls.find((p) => p.id === 1);
  const otherPolls = polls.filter((p) => p.id !== 1);

  return (
    <>
      <a href="/admin" className="mesa-btn">
        🔑 Acceso Mesa
      </a>
      <div className="card">
        <HomeClient />

        {/* ── Login / vote CTA ───────────────────────────────────────────── */}
        <div className="login-block">
          <p className="login-hint">
            Inicia sesión con tu correo @unal.edu.co para votar.
          </p>
          <LoginButton />
        </div>

        {/* ── Extra polls (newest first, excluding poll #1) ───────────────── */}
        {otherPolls.map((poll) => (
          <section key={poll.id} className="results-section">
            <div className="poll-header">
              <h2>{poll.title}</h2>
              {poll.status === "open" ? (
                <span className="poll-badge poll-badge-open">🟢 Abierta</span>
              ) : (
                <span className="poll-badge poll-badge-closed">🔴 Cerrada</span>
              )}
            </div>
            <PollResults poll={poll} />
          </section>
        ))}

        {/* ── Poll #1: Mecanismo (rich table) ─────────────────────────────── */}
        {poll1 && (
          <section className="results-section">
            <div className="poll-header">
              <h2>{poll1.title}</h2>
              {poll1.status === "open" ? (
                <span className="poll-badge poll-badge-open">🟢 Abierta</span>
              ) : (
                <span className="poll-badge poll-badge-closed">🔴 Cerrada</span>
              )}
            </div>
            <ResultsTable
              results={poll1.options.map((o) => ({
                id: o.id,
                name: o.text,
                count: o.votes,
              }))}
            />
          </section>
        )}
      </div>
    </>
  );
}

