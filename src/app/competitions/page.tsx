"use client";
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { apiUrl, authHeaders } from "../lib/api";

type CompetitionResult = {
  id: string;
  eventName: string;
  eventDate: string;
  archerName: string;
  club: string;
  category: string;
  score: number;
  round: string;
  notes: string;
  postedByUserId: string;
};

const MEDALS = ["🥇", "🥈", "🥉"];

export default function Competitions() {
  const { user, hasRole } = useAuth();
  const [results, setResults] = useState<CompetitionResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [eventFilter, setEventFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    eventName: "", eventDate: "", archerName: "", club: "", category: "", score: "", round: "", notes: "",
  });

  const canPost = hasRole("coach") || hasRole("admin");

  const refresh = () => {
    setLoading(true);
    fetch(apiUrl("/api/competitions"))
      .then((res) => res.json())
      .then((data) => setResults(data.results || []))
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { refresh(); }, []);

  const events = ["All", ...Array.from(new Set(results.map((r) => r.eventName)))];
  const filtered = eventFilter === "All" ? results : results.filter((r) => r.eventName === eventFilter);
  const sorted = [...filtered].sort((a, b) => b.score - a.score);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const token = localStorage.getItem("archery_token");
    try {
      const res = await fetch(apiUrl("/api/competitions"), {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders(token) },
        body: JSON.stringify({
          ...form,
          score: Number(form.score) || 0,
        }),
      });
      if (res.ok) {
        setForm({ eventName: "", eventDate: "", archerName: "", club: "", category: "", score: "", round: "", notes: "" });
        setShowForm(false);
        refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.message || "Failed to post result");
      }
    } catch {
      setError("Could not reach the server.");
    }
  };

  const handleDelete = async (id: string) => {
    const token = localStorage.getItem("archery_token");
    await fetch(apiUrl(`/api/competitions/${id}`), {
      method: "DELETE",
      headers: authHeaders(token),
    });
    refresh();
  };

  return (
    <div className="page-wrap">
      <h1 className="page-title">Competition Results</h1>
      <p className="page-subtitle">
        Official results from real-world competitions, posted by coaches and admins — separate from the
        auto-computed monthly training leaderboard.
      </p>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
        <div>
          <label style={{ fontSize: "0.8rem", fontWeight: 600, marginBottom: 4, display: "block" }}>Event</label>
          <select className="select" value={eventFilter} onChange={(e) => setEventFilter(e.target.value)}>
            {events.map((ev) => <option key={ev} value={ev}>{ev}</option>)}
          </select>
        </div>

        {canPost && (
          <button onClick={() => setShowForm(!showForm)} className="btn btn-green" style={{ fontSize: "0.85rem" }}>
            {showForm ? "Cancel" : "+ Post Competition Result"}
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card" style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 14 }}>Post a Result</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: 4 }}>Event Name</label>
              <input className="input" required value={form.eventName} onChange={(e) => setForm({ ...form, eventName: e.target.value })} placeholder="e.g. Nairobi Open 2026" />
            </div>
            <div>
              <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: 4 }}>Event Date</label>
              <input type="date" className="input" required value={form.eventDate} onChange={(e) => setForm({ ...form, eventDate: e.target.value })} />
            </div>
            <div>
              <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: 4 }}>Archer Name</label>
              <input className="input" required value={form.archerName} onChange={(e) => setForm({ ...form, archerName: e.target.value })} placeholder="e.g. Jane Wambui" />
            </div>
            <div>
              <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: 4 }}>Score</label>
              <input type="number" className="input" required min={0} value={form.score} onChange={(e) => setForm({ ...form, score: e.target.value })} placeholder="e.g. 682" />
            </div>
            <div>
              <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: 4 }}>Club (optional)</label>
              <input className="input" value={form.club} onChange={(e) => setForm({ ...form, club: e.target.value })} />
            </div>
            <div>
              <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: 4 }}>Category (optional)</label>
              <input className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g. Recurve Women" />
            </div>
            <div>
              <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: 4 }}>Round (optional)</label>
              <input className="input" value={form.round} onChange={(e) => setForm({ ...form, round: e.target.value })} placeholder="e.g. WA 70m" />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: 4 }}>Notes (optional)</label>
              <textarea className="textarea" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
          </div>
          <button type="submit" className="btn btn-green" style={{ marginTop: 14 }}>Post Result</button>
          {error && <div className="error-text" style={{ marginTop: 8 }}>{error}</div>}
        </form>
      )}

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--ke-black)", color: "var(--ke-white)" }}>
              <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600, fontSize: "0.85rem" }}>#</th>
              <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600, fontSize: "0.85rem" }}>Archer</th>
              <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600, fontSize: "0.85rem" }}>Club</th>
              <th style={{ padding: "12px 16px", textAlign: "center", fontWeight: 600, fontSize: "0.85rem" }}>Score</th>
              <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600, fontSize: "0.85rem" }}>Event</th>
              <th style={{ padding: "12px 16px", textAlign: "right", fontWeight: 600, fontSize: "0.85rem" }}>Date</th>
              {canPost && <th style={{ padding: "12px 16px" }}></th>}
            </tr>
          </thead>
          <tbody>
            {sorted.map((r, i) => (
              <tr key={r.id} style={{
                borderBottom: "1px solid var(--border-light)",
                background: i < 3 ? "rgba(212,160,23,0.06)" : undefined,
              }}>
                <td style={{ padding: "12px 16px", fontWeight: i < 3 ? 800 : 500 }}>{i < 3 ? MEDALS[i] : i + 1}</td>
                <td style={{ padding: "12px 16px", fontWeight: i < 3 ? 700 : 400 }}>{r.archerName}</td>
                <td style={{ padding: "12px 16px", fontSize: "0.9rem", color: "var(--text-secondary)" }}>{r.club}</td>
                <td style={{ padding: "12px 16px", textAlign: "center", fontWeight: 700, color: "var(--ke-green)" }}>{r.score}</td>
                <td style={{ padding: "12px 16px", fontSize: "0.9rem", color: "var(--text-secondary)" }}>{r.eventName}{r.round ? ` — ${r.round}` : ""}</td>
                <td style={{ padding: "12px 16px", textAlign: "right", fontSize: "0.85rem", color: "var(--text-muted)" }}>{r.eventDate}</td>
                {canPost && (
                  <td style={{ padding: "12px 16px", textAlign: "right" }}>
                    <button onClick={() => handleDelete(r.id)} className="btn btn-outline" style={{ fontSize: "0.7rem", padding: "2px 8px", color: "var(--ke-red)" }}>
                      Remove
                    </button>
                  </td>
                )}
              </tr>
            ))}
            {!loading && sorted.length === 0 && (
              <tr><td colSpan={7} style={{ padding: "24px 16px", textAlign: "center", color: "var(--text-muted)" }}>No competition results posted yet.</td></tr>
            )}
            {loading && (
              <tr><td colSpan={7} style={{ padding: "24px 16px", textAlign: "center", color: "var(--text-muted)" }}>Loading...</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {!user && <p style={{ color: "var(--text-muted)", marginTop: 16, fontSize: "0.85rem" }}>Coaches and admins can log in to post results.</p>}
    </div>
  );
}
