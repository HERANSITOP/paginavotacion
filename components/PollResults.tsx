"use client";

import type { PollResult } from "@/app/api/polls/route";

interface Props {
  poll: PollResult;
}

export default function PollResults({ poll }: Props) {
  const total = poll.total_votes;

  if (poll.options.length === 0) {
    return <p className="muted">Sin opciones.</p>;
  }

  const sorted = [...poll.options].sort((a, b) => b.votes - a.votes);

  return (
    <div className="poll-results">
      <p className="poll-total">{total} {total === 1 ? "voto" : "votos"}</p>
      <ul className="poll-options-list">
        {sorted.map((opt) => {
          const pct = total > 0 ? +((opt.votes / total) * 100).toFixed(1) : 0;
          return (
            <li key={opt.id} className="poll-option-row">
              <div className="poll-option-top">
                <span className="poll-option-text">{opt.text}</span>
                <span className="poll-option-stat">
                  {opt.votes} <span className="pct-badge">{pct}%</span>
                </span>
              </div>
              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
