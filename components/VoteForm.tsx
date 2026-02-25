"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ActivePoll } from "@/app/vote/page";



interface Props {
  poll: ActivePoll;
}

export default function VoteForm({ poll }: Props) {
  const isMulti = poll.multi_choice;

  const [selected, setSelected] = useState<number | null>(null);
  const [multiSelected, setMultiSelected] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function toggleMulti(id: number) {
    setMultiSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const canSubmit = isMulti ? multiSelected.size > 0 : selected !== null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError(null);

    const payload = isMulti
      ? { poll_id: poll.id, option_ids: Array.from(multiSelected) }
      : { poll_id: poll.id, option_id: selected };

    const res = await fetch("/api/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      router.push("/thanks");
      return;
    }

    const body = await res.json().catch(() => ({}));
    if (body.error === "geo_blocked") {
      router.push("/blocked");
      return;
    }
    if (body.error === "already_voted") {
      router.push("/thanks");
      return;
    }

    setError(body.error ?? "Error al registrar el voto.");
    setLoading(false);
  }

  return (
    <div className="card">
      <h1>Votar</h1>
      <p className="vote-poll-title">{poll.title}</p>
      {isMulti && (
        <p className="vote-hint">
          Puedes seleccionar <strong>una o varias opciones</strong>.
        </p>
      )}
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="options-wrapper">
          <div className="options-grid">
            {poll.options.map((opt) => {
              const checked = isMulti ? multiSelected.has(opt.id) : selected === opt.id;
              return (
                <label
                  key={opt.id}
                  className={`option-card${checked ? " selected" : ""}`}
                >
                  <input
                    type={isMulti ? "checkbox" : "radio"}
                    name="option"
                    value={opt.id}
                    checked={checked}
                    onChange={() => isMulti ? toggleMulti(opt.id) : setSelected(opt.id)}
                  />
                  <span className="option-label">{opt.text}</span>
                </label>
              );
            })}
          </div>
        </div>
        {isMulti && multiSelected.size > 0 && (
          <p className="vote-selection-count">
            {multiSelected.size} {multiSelected.size === 1 ? "opcion seleccionada" : "opciones seleccionadas"}
          </p>
        )}
        <button
          type="submit"
          className="btn btn-submit"
          disabled={loading || !canSubmit}
        >
          {loading ? "Enviando…" : "Enviar voto"}
        </button>
      </form>
    </div>
  );
}

