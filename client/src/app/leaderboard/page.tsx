"use client";
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { apiUrl } from "../lib/api";

type LeaderboardEntry = {
  archer: string;
  club: string;
  category: string;
  score: number;
  roundName: string;
  date: string;
  sessionsLogged: number;
};

const MEDALS = ["🥇", "🥈", "🥉"];

function monthOptions(): { value: string; label: string }[] {
  const opts = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString(undefined, { month: "long", year: "numeric" });
    opts.push({ value, label });
  }
  return opts;
}

export default function Leaderboard() {
  const { user, setLeaderboardPublic } = useAuth();
  const months = monthOptions();
  const [month, setMonth] = useState(months[0].value);
  const [results, setResults] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglePending, setTogglePending] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(apiUrl(`/api/leaderboard?month=${month}`))
      .then((res) => res.json())
      .then((data) => setResults(data.results || []))
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, [month]);

  const handleTogglePrivacy = async () => {
    if (!user) return;
    setTogglePending(true);
    await setLeaderboardPublic(!user.leaderboardPublic);
    setTogglePending(false);
  };

  return (
    <div className="page-wrap">
      <h1 className="page-title">Leaderboard</h1>
      <p className="page-subtitle">Top scores logged by archers across Kenya this month, from real sessions</p>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
        <div>
          <label style={{ fontSize: "0.8rem", fontWeight: 600, marginBottom: 4, display: "block" }}>Month</label>
          <select className="select" value={month} onChange={(e) => setMonth(e.target.value)}>
            {months.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>

        {user && (
          <div style={{ fontSize: "0.85rem", textAlign: "right" }}>
            <div style={{ color: "var(--text-secondary)", marginBottom: 4 }}>
              You are currently{" "}
              <strong style={{ color: user.leaderboardPublic ? "var(--ke-green)" : "var(--text-muted)" }}>
                {user.leaderboardPublic ? "visible" : "hidden"}
              </strong>{" "}
              on the public leaderboard.
            </div>
            <button
              onClick={handleTogglePrivacy}
              disabled={togglePending}
              className="btn btn-outline"
              style={{ fontSize: "0.8rem", padding: "4px 12px" }}
            >
              {togglePending ? "Updating..." : user.leaderboardPublic ? "Make my scores private" : "Make my scores public"}
            </button>
          </div>
        )}
      </div>

      {!user && (
        <p style={{ color: "var(--text-muted)", marginBottom: 20 }}>
          Log in and start logging sessions to appear here, or to opt out of the public leaderboard.
        </p>
      )}

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--ke-black)", color: "var(--ke-white)" }}>
              <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600, fontSize: "0.85rem" }}>#</th>
              <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600, fontSize: "0.85rem" }}>Archer</th>
              <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600, fontSize: "0.85rem" }}>Club</th>
              <th style={{ padding: "12px 16px", textAlign: "center", fontWeight: 600, fontSize: "0.85rem" }}>Best Score</th>
              <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600, fontSize: "0.85rem" }}>Round</th>
              <th style={{ padding: "12px 16px", textAlign: "right", fontWeight: 600, fontSize: "0.85rem" }}>Date</th>
            </tr>
          </thead>
          <tbody>
            {results.slice(0, 50).map((r, i) => (
              <tr key={`${r.archer}-${i}`} style={{
                borderBottom: "1px solid var(--border-light)",
                background: i < 3 ? "rgba(212,160,23,0.06)" : undefined,
              }}>
                <td style={{ padding: "12px 16px", fontWeight: i < 3 ? 800 : 500 }}>
                  {i < 3 ? MEDALS[i] : i + 1}
                </td>
                <td style={{ padding: "12px 16px", fontWeight: i < 3 ? 700 : 400 }}>{r.archer}</td>
                <td style={{ padding: "12px 16px", fontSize: "0.9rem", color: "var(--text-secondary)" }}>{r.club}</td>
                <td style={{ padding: "12px 16px", textAlign: "center", fontWeight: 700, color: "var(--ke-green)" }}>{r.score}</td>
                <td style={{ padding: "12px 16px", fontSize: "0.9rem", color: "var(--text-secondary)" }}>{r.roundName}</td>
                <td style={{ padding: "12px 16px", textAlign: "right", fontSize: "0.85rem", color: "var(--text-muted)" }}>{r.date}</td>
              </tr>
            ))}
            {!loading && results.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: "24px 16px", textAlign: "center", color: "var(--text-muted)" }}>
                  No public scores logged for this month yet.
                </td>
              </tr>
            )}
            {loading && (
              <tr>
                <td colSpan={6} style={{ padding: "24px 16px", textAlign: "center", color: "var(--text-muted)" }}>
                  Loading...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
