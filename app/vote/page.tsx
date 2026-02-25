import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { sql } from "@/lib/db";
import { hashEmail } from "@/lib/hash";
import VoteForm from "@/components/VoteForm";

export interface PollOption {
  id: number;
  text: string;
  position: number;
}

export interface ActivePoll {
  id: number;
  title: string;
  multi_choice: boolean;
  options: PollOption[];
}

/**
 * /vote — Server Component.
 * Middleware guarantees the user is authenticated.
 * Loads the *first open poll*, checks per-poll dedup,
 * and renders <VoteForm> with dynamic options.
 */
export default async function VotePage() {
  const session = await auth();
  const email = session?.user?.email ?? "";

  // ── 1. Find first open poll ───────────────────────────────────────────────
  const pollRows = (await sql`
    SELECT id, title, multi_choice
    FROM polls
    WHERE status = 'open'
    ORDER BY created_at DESC
    LIMIT 1
  `) as { id: number; title: string; multi_choice: boolean }[];

  if (pollRows.length === 0) {
    // No active poll
    return (
      <div className="card" style={{ textAlign: "center" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🗳️</div>
        <h2>No hay votación activa</h2>
        <p style={{ color: "var(--text-muted, #8899aa)", marginTop: ".5rem" }}>
          Espera a que la mesa directiva abra una votación.
        </p>
      </div>
    );
  }

  const poll = pollRows[0];

  // ── 2. Dedup check per (poll, voter) ──────────────────────────────────────
  if (email) {
    const hash = hashEmail(email);
    const voted = await sql`
      SELECT 1 FROM poll_voters
      WHERE poll_id = ${poll.id} AND email_hash = ${hash}
      LIMIT 1
    `;
    if (voted.length > 0) {
      redirect("/thanks");
    }
  }

  // ── 3. Load options ───────────────────────────────────────────────────────
  const optionRows = (await sql`
    SELECT id, text, position
    FROM poll_options
    WHERE poll_id = ${poll.id}
    ORDER BY position
  `) as PollOption[];

  const activePoll: ActivePoll = {
    id:           poll.id,
    title:        poll.title,
    multi_choice: poll.multi_choice,
    options:      optionRows,
  };

  return <VoteForm poll={activePoll} />;
}

