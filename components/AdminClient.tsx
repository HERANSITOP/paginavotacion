"use client";

import { useState, useEffect, useCallback } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────
interface PollOption {
  id: number;
  text: string;
  votes: number;
  pct: number;
}

interface PollStat {
  id: number;
  title: string;
  status: string;
  multi_choice: boolean;
  hidden: boolean;
  created_at: string;
  total: number;
  options: PollOption[];
}

interface RecentVote {
  id: number;
  poll_title: string;
  option_text: string;
  created_at: string;
}

interface Stats {
  totalVoters: number;
  polls: PollStat[];
  recentVotes: RecentVote[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const EMOJIS = ["📋", "🔄", "🗣️", "✊", "✅", "📌", "🔵", "🟢", "🟡", "🟠"];

function badge(status: string) {
  return status === "open"
    ? <span className="poll-badge poll-badge-open">� Abierta</span>
    : <span className="poll-badge poll-badge-closed">� Cerrada</span>;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function AdminClient() {
  const [password, setPassword]   = useState("");
  const [authed, setAuthed]       = useState(false);
  const [stats, setStats]         = useState<Stats | null>(null);
  const [error, setError]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // ── Create-poll form state ────────────────────────────────────────────────
  const [newTitle, setNewTitle]         = useState("");
  const [newOptions, setNewOptions]     = useState(["", ""]);
  const [newMultiChoice, setNewMultiChoice] = useState(false);
  const [creating, setCreating]         = useState(false);
  const [createErr, setCreateErr]       = useState("");

  // ── Fetch stats ───────────────────────────────────────────────────────────
  const fetchStats = useCallback(async (pw: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/stats", {
        headers: { Authorization: `Bearer ${pw}` },
        cache: "no-store",
      });
      if (res.status === 401) { setError("Contraseña incorrecta."); setAuthed(false); return; }
      if (!res.ok) throw new Error();
      const data: Stats = await res.json();
      setStats(data);
      setAuthed(true);
      setLastUpdated(new Date());
    } catch {
      setError("No se pudieron cargar los datos.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-refresh every 15 s
  useEffect(() => {
    if (!authed || !password) return;
    const id = setInterval(() => fetchStats(password), 15000);
    return () => clearInterval(id);
  }, [authed, password, fetchStats]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    await fetchStats(password);
  }

  // ── Toggle open/closed ────────────────────────────────────────────────────
  async function togglePoll(id: number, currentStatus: string) {
    const next = currentStatus === "open" ? "closed" : "open";
    await fetch("/api/admin/polls", {
      method: "PATCH",
      headers: { Authorization: `Bearer ${password}`, "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: next }),
    });
    fetchStats(password);
  }

  // ── Delete poll ───────────────────────────────────────────────────────────
  async function deletePoll(id: number, title: string) {
    if (!confirm(`¿Eliminar la votación "${title}"? Se borrarán todos sus votos.`)) return;
    await fetch("/api/admin/polls", {
      method: "DELETE",
      headers: { Authorization: `Bearer ${password}`, "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchStats(password);
  }

  // ── Toggle hidden (visible en página pública) ─────────────────────────────
  async function toggleHidden(id: number, currentHidden: boolean) {
    await fetch("/api/admin/polls", {
      method: "PATCH",
      headers: { Authorization: `Bearer ${password}`, "Content-Type": "application/json" },
      body: JSON.stringify({ id, hidden: !currentHidden }),
    });
    fetchStats(password);
  }

  // ── Create poll ───────────────────────────────────────────────────────────
  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const opts = newOptions.map((o) => o.trim()).filter(Boolean);
    if (!newTitle.trim() || opts.length < 2) {
      setCreateErr("Necesitas un título y al menos 2 opciones.");
      return;
    }
    setCreating(true);
    setCreateErr("");
    const res = await fetch("/api/admin/polls", {
      method: "POST",
      headers: { Authorization: `Bearer ${password}`, "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle.trim(), options: opts, multi_choice: newMultiChoice }),
    });
    setCreating(false);
    if (!res.ok) { setCreateErr("Error al crear la votación."); return; }
    setNewTitle("");
    setNewOptions(["", ""]);
    setNewMultiChoice(false);
    fetchStats(password);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ── Login screen ──────────────────────────────────────────────────────────
  if (!authed) {
    return (
      <div className="admin-login-wrap">
        <div className="card admin-login-card">
          <div className="admin-lock-icon">🔐</div>
          <h1>Panel de Administración</h1>
          <p>Ingresa la contraseña para continuar.</p>
          <form onSubmit={handleLogin} className="admin-login-form">
            <input
              type="password"
              className="admin-input"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              required
            />
            {error && <p className="error">{error}</p>}
            <button type="submit" className="btn btn-submit" disabled={loading}>
              {loading ? "Verificando…" : "Entrar"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ── Dashboard ─────────────────────────────────────────────────────────────
  const openPolls   = stats?.polls.filter((p) => p.status === "open").length  ?? 0;
  const closedPolls = stats?.polls.filter((p) => p.status === "closed").length ?? 0;

  return (
    <div className="card admin-card">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="admin-header">
        <div>
          <div className="title-row">
            <h1>Panel de Administración</h1>
            <span className="site-badge">⬤ Admin</span>
          </div>
          {lastUpdated && (
            <p className="admin-updated">
              Actualizado: {lastUpdated.toLocaleTimeString("es-CO")} · auto‑refresh 15 s
            </p>
          )}
        </div>
        <button className="btn btn-ghost" onClick={() => fetchStats(password)} disabled={loading}>
          {loading ? "…" : "↻ Actualizar"}
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      {/* ── KPI row ─────────────────────────────────────────────────────── */}
      <div className="admin-kpis">
        <div className="admin-kpi">
          <span className="admin-kpi-value">{stats?.totalVoters ?? 0}</span>
          <span className="admin-kpi-label">Votantes únicos</span>
        </div>
        <div className="admin-kpi">
          <span className="admin-kpi-value">{openPolls}</span>
          <span className="admin-kpi-label">Votaciones abiertas</span>
        </div>
        <div className="admin-kpi">
          <span className="admin-kpi-value">{closedPolls}</span>
          <span className="admin-kpi-label">Votaciones cerradas</span>
        </div>
        <div className="admin-kpi">
          <span className="admin-kpi-value">{(stats?.polls ?? []).reduce((s, p) => s + p.total, 0)}</span>
          <span className="admin-kpi-label">Votos totales</span>
        </div>
      </div>

      {/* ── Create poll form ─────────────────────────────────────────────── */}
      <h2>➕ Nueva votación</h2>
      <form onSubmit={handleCreate} className="admin-create-form">
        <input
          className="admin-input"
          placeholder="Título de la votación"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          required
        />
        <div className="admin-options-list">
          {newOptions.map((opt, i) => (
            <div key={i} className="admin-option-row">
              <input
                className="admin-input admin-option-input"
                placeholder={`Opción ${i + 1}`}
                value={opt}
                onChange={(e) => {
                  const next = [...newOptions];
                  next[i] = e.target.value;
                  setNewOptions(next);
                }}
              />
              {newOptions.length > 2 && (
                <button
                  type="button"
                  className="btn btn-ghost admin-rm-btn"
                  onClick={() => setNewOptions(newOptions.filter((_, j) => j !== i))}
                >✕</button>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          className="btn btn-ghost"
          style={{ marginBottom: "0.75rem" }}
          onClick={() => setNewOptions([...newOptions, ""])}
        >
          + Agregar opción
        </button>
        {createErr && <p className="error">{createErr}</p>}
        <label className="admin-toggle-row">
          <input
            type="checkbox"
            checked={newMultiChoice}
            onChange={(e) => setNewMultiChoice(e.target.checked)}
            className="admin-toggle-checkbox"
          />
          <span className="admin-toggle-label">
            Seleccion multiple (los votantes pueden elegir varias opciones)
          </span>
        </label>
        <button type="submit" className="btn btn-submit" disabled={creating}>
          {creating ? "Creando…" : "Crear votación"}
        </button>
      </form>

      {/* ── Polls list ───────────────────────────────────────────────────── */}
      <div className="admin-polls-header-row">
        <h2>Votaciones ({stats?.polls.length ?? 0})</h2>
      </div>
      <div className="admin-polls-list">
        {(stats?.polls ?? []).map((poll) => (
          <div key={poll.id} className={`admin-poll-card${poll.hidden ? " admin-poll-card--collapsed" : ""}`}>
            <div className="admin-poll-header">
              <div className="admin-poll-title-row">
                {badge(poll.status)}
                <span className="admin-poll-title">{poll.title}</span>
                {poll.multi_choice && (
                  <span className="poll-badge" style={{ background: "rgba(100,160,255,0.15)", color: "#6ab0ff", border: "1px solid rgba(100,160,255,0.3)" }}>
                    Múltiples respuestas
                  </span>
                )}
                {poll.hidden && (
                  <span className="poll-badge" style={{ background: "rgba(255,255,255,0.06)", color: "#8899aa", border: "1px solid rgba(255,255,255,0.12)" }}>
                    👁 Oculta
                  </span>
                )}
                <span className="admin-poll-total">{poll.total} voto{poll.total !== 1 ? "s" : ""}</span>
              </div>
              <div className="admin-poll-actions">
                {poll.status === "closed" && (
                  <button
                    className={`btn ${poll.hidden ? "btn-ghost" : "admin-btn-warning"}`}
                    onClick={() => toggleHidden(poll.id, poll.hidden)}
                    title={poll.hidden ? "Mostrar en página pública" : "Ocultar de página pública"}
                  >
                    {poll.hidden ? "👁 Mostrar" : "🙈 Ocultar"}
                  </button>
                )}
                <button
                  className={`btn ${poll.status === "open" ? "admin-btn-danger" : "btn-ghost"}`}
                  onClick={() => togglePoll(poll.id, poll.status)}
                >
                  {poll.status === "open" ? "🔴 Cerrar" : "🟢 Abrir"}
                </button>
                <button
                  className="btn admin-btn-danger"
                  onClick={() => deletePoll(poll.id, poll.title)}
                >
                  🗑 Eliminar
                </button>
              </div>
            </div>

            {/* Options + bars */}
            <div className="admin-bars">
              {poll.options.map((o, i) => (
                <div key={o.id} className="admin-bar-row">
                  <div className="admin-bar-label">
                    <span>{EMOJIS[i % EMOJIS.length]} {o.text}</span>
                    <span className="admin-bar-meta">
                      <strong>{o.votes}</strong> · <span className="pct-badge">{o.pct}%</span>
                    </span>
                  </div>
                  <div className="progress-track admin-progress">
                    <div className="progress-fill" style={{ width: `${o.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {(stats?.polls.length ?? 0) === 0 && (
          <p className="muted">No hay votaciones aún.</p>
        )}
      </div>

      {/* ── Recent votes ─────────────────────────────────────────────────── */}
      <h2>Últimos 20 votos</h2>
      <div className="results-table-wrap">
        <table className="results-table admin-recent-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Votación</th>
              <th>Opción</th>
              <th>Fecha y hora</th>
            </tr>
          </thead>
          <tbody>
            {(stats?.recentVotes ?? []).map((v) => (
              <tr key={v.id}>
                <td className="admin-vote-id">{v.id}</td>
                <td>{v.poll_title}</td>
                <td>{v.option_text}</td>
                <td className="admin-vote-time">
                  {new Date(v.created_at).toLocaleString("es-CO", {
                    dateStyle: "short",
                    timeStyle: "medium",
                  })}
                </td>
              </tr>
            ))}
            {(stats?.recentVotes.length ?? 0) === 0 && (
              <tr>
                <td colSpan={4} style={{ textAlign: "center" }}>Sin votos aún.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

