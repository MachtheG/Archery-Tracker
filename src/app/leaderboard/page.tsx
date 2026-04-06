"use client";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

type Result = { id: number; archer: string; score: number; event: string; date: string };

const initialResults: Result[] = [
  { id: 1, archer: "Jane Wambui", score: 682, event: "Nairobi Open", date: "2026-02-18" },
  { id: 2, archer: "Samuel Kiptoo", score: 670, event: "Nairobi Open", date: "2026-02-18" },
  { id: 3, archer: "Amina Hassan", score: 665, event: "Nairobi Open", date: "2026-02-18" },
  { id: 4, archer: "Brian Otieno", score: 640, event: "Nairobi Open", date: "2026-02-18" },
  { id: 5, archer: "Grace Njeri", score: 635, event: "Mombasa Classic", date: "2026-03-01" },
];

const MEDALS = ["🥇", "🥈", "🥉"];

export default function Leaderboard() {
  const { user } = useAuth();
  const [results, setResults] = useState<Result[]>(initialResults);
  const [archer, setArcher] = useState("");
  const [score, setScore] = useState("");
  const [event, setEvent] = useState("");
  const [error, setError] = useState("");

  const canPost = user?.role === "coach" || user?.role === "admin";

  const handlePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!archer.trim() || !score.trim() || !event.trim() || isNaN(Number(score))) {
      setError("All fields required. Score must be a number.");
      return;
    }
    setResults([
      { id: Date.now(), archer, score: Number(score), event, date: new Date().toISOString().slice(0, 10) },
      ...results,
    ]);
    setArcher("");
    setScore("");
    setEvent("");
    setError("");
  };

  const sorted = [...results].sort((a, b) => b.score - a.score);

  return (
    <div className="page-wrap">
      <h1 className="page-title">Leaderboard</h1>
      <p className="page-subtitle">Top archery scores across Kenya</p>

      {/* Post form — Coach & Admin only */}
      {canPost && (
        <div className="card" style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 14 }}>Post a Result</h2>
          <form onSubmit={handlePost} style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "flex-end" }}>
            <div style={{ flex: "1 1 140px" }}>
              <label style={{ fontSize: "0.8rem", fontWeight: 600, marginBottom: 4, display: "block" }}>Archer</label>
              <input className="input" value={archer} onChange={e => setArcher(e.target.value)} placeholder="Name" />
            </div>
            <div style={{ flex: "0 1 100px" }}>
              <label style={{ fontSize: "0.8rem", fontWeight: 600, marginBottom: 4, display: "block" }}>Score</label>
              <input className="input" value={score} onChange={e => setScore(e.target.value)} placeholder="720" />
            </div>
            <div style={{ flex: "1 1 140px" }}>
              <label style={{ fontSize: "0.8rem", fontWeight: 600, marginBottom: 4, display: "block" }}>Event</label>
              <input className="input" value={event} onChange={e => setEvent(e.target.value)} placeholder="Competition name" />
            </div>
            <button type="submit" className="btn btn-gold">Post Result</button>
          </form>
          {error && <div className="error-text" style={{ marginTop: 8 }}>{error}</div>}
        </div>
      )}

      {!user && <p style={{ color: "var(--text-muted)", marginBottom: 24 }}>Log in to see full leaderboard features.</p>}
      {user && !canPost && <p style={{ color: "var(--text-muted)", marginBottom: 24, fontSize: "0.9rem" }}>Only coaches and admins can post results.</p>}

      {/* Leaderboard table */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--ke-black)", color: "var(--ke-white)" }}>
              <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600, fontSize: "0.85rem" }}>#</th>
              <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600, fontSize: "0.85rem" }}>Archer</th>
              <th style={{ padding: "12px 16px", textAlign: "center", fontWeight: 600, fontSize: "0.85rem" }}>Score</th>
              <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600, fontSize: "0.85rem" }}>Event</th>
              <th style={{ padding: "12px 16px", textAlign: "right", fontWeight: 600, fontSize: "0.85rem" }}>Date</th>
            </tr>
          </thead>
          <tbody>
            {sorted.slice(0, 15).map((r, i) => (
              <tr key={r.id} style={{
                borderBottom: "1px solid var(--border-light)",
                background: i < 3 ? "rgba(212,160,23,0.06)" : undefined,
              }}>
                <td style={{ padding: "12px 16px", fontWeight: i < 3 ? 800 : 500 }}>
                  {i < 3 ? MEDALS[i] : i + 1}
                </td>
                <td style={{ padding: "12px 16px", fontWeight: i < 3 ? 700 : 400 }}>{r.archer}</td>
                <td style={{ padding: "12px 16px", textAlign: "center", fontWeight: 700, color: "var(--ke-green)" }}>{r.score}</td>
                <td style={{ padding: "12px 16px", fontSize: "0.9rem", color: "var(--text-secondary)" }}>{r.event}</td>
                <td style={{ padding: "12px 16px", textAlign: "right", fontSize: "0.85rem", color: "var(--text-muted)" }}>{r.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}