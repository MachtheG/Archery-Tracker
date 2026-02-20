"use client";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

type Result = { id: number; archer: string; score: number; event: string; date: string };

const initialResults: Result[] = [
  { id: 1, archer: "Jane Wambui", score: 682, event: "Nairobi Open", date: "2026-02-18" },
  { id: 2, archer: "Samuel Kiptoo", score: 670, event: "Nairobi Open", date: "2026-02-18" },
  { id: 3, archer: "Amina Hassan", score: 665, event: "Nairobi Open", date: "2026-02-18" },
  { id: 4, archer: "Brian Otieno", score: 640, event: "Nairobi Open", date: "2026-02-18" },
];

export default function Leaderboard() {
  const { user } = useAuth();
  const [results, setResults] = useState<Result[]>(initialResults);
  const [archer, setArcher] = useState("");
  const [score, setScore] = useState("");
  const [event, setEvent] = useState("");
  const [error, setError] = useState("");

  const handlePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!archer.trim() || !score.trim() || !event.trim() || isNaN(Number(score))) {
      setError("All fields required, score must be a number");
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

  // Sort and highlight top 3
  const sorted = [...results].sort((a, b) => b.score - a.score);

  return (
    <main style={{ padding: '2rem', maxWidth: 700, margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', fontWeight: 800 }}>Leaderboard</h1>
      {user?.role === "coach" ? (
        <form onSubmit={handlePost} style={{ margin: '2rem 0', display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'center' }}>
          <input value={archer} onChange={e => setArcher(e.target.value)} placeholder="Archer Name" style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc', fontSize: 16, minWidth: 120 }} />
          <input value={score} onChange={e => setScore(e.target.value)} placeholder="Score" style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc', fontSize: 16, minWidth: 80 }} />
          <input value={event} onChange={e => setEvent(e.target.value)} placeholder="Event" style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc', fontSize: 16, minWidth: 120 }} />
          <button type="submit" style={{ background: '#FFD700', color: '#000', border: 'none', borderRadius: 6, padding: '0.7em 1.5em', fontWeight: 700, cursor: 'pointer' }}>Post Result</button>
          {error && <div style={{ color: '#d32f2f', fontWeight: 600, width: '100%' }}>{error}</div>}
        </form>
      ) : user ? (
        <div style={{ textAlign: 'center', margin: '2rem 0', color: '#888' }}>Only coaches can post results.</div>
      ) : (
        <div style={{ textAlign: 'center', margin: '2rem 0', color: '#888' }}>Log in to view and post results.</div>
      )}
      <div style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Top Archers</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, boxShadow: '0 2px 12px #0001', marginBottom: 24 }}>
          <thead>
            <tr style={{ background: '#006600', color: '#fff' }}>
              <th style={{ padding: 12 }}>Rank</th>
              <th style={{ padding: 12 }}>Archer</th>
              <th style={{ padding: 12 }}>Score</th>
              <th style={{ padding: 12 }}>Event</th>
              <th style={{ padding: 12 }}>Date</th>
            </tr>
          </thead>
          <tbody>
            {sorted.slice(0, 10).map((r, i) => (
              <tr key={r.id} style={{ background: i < 3 ? ['#FFD700', '#C0C0C0', '#CD7F32'][i] : undefined, fontWeight: i < 3 ? 700 : 400 }}>
                <td style={{ padding: 12 }}>{i + 1}</td>
                <td style={{ padding: 12 }}>{r.archer}</td>
                <td style={{ padding: 12 }}>{r.score}</td>
                <td style={{ padding: 12 }}>{r.event}</td>
                <td style={{ padding: 12 }}>{r.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}