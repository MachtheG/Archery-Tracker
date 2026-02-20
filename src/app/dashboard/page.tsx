"use client";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

type Log = { id: number; date: string; arrows: number; notes: string };

const initialLogs: Log[] = [
  { id: 1, date: "2026-02-18", arrows: 60, notes: "70m, windy, focus on release." },
  { id: 2, date: "2026-02-19", arrows: 40, notes: "50m, blank bale, good grouping." },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<Log[]>(initialLogs);
  const [arrows, setArrows] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  if (!user) {
    return <main style={{ padding: '2rem', textAlign: 'center' }}><h1>Dashboard</h1><p>Please log in to view your dashboard.</p></main>;
  }

  const handleLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!arrows.trim() || isNaN(Number(arrows))) {
      setError("Enter number of arrows");
      return;
    }
    setLogs([
      { id: Date.now(), date: new Date().toISOString().slice(0, 10), arrows: Number(arrows), notes },
      ...logs,
    ]);
    setArrows("");
    setNotes("");
    setError("");
  };

  return (
    <main style={{ padding: '2rem', maxWidth: 700, margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', fontWeight: 800 }}>Dashboard</h1>
      {user.role === "archer" && (
        <>
          <form onSubmit={handleLog} style={{ margin: '2rem 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input value={arrows} onChange={e => setArrows(e.target.value)} placeholder="Arrows shot" style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc', fontSize: 16 }} />
            <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes (conditions, bow, etc)" rows={2} style={{ padding: 10, borderRadius: 6, border: '1px solid #ccc', fontSize: 16 }} />
            <button type="submit" style={{ background: '#006600', color: '#fff', border: 'none', borderRadius: 6, padding: '0.7em 1.5em', fontWeight: 700, cursor: 'pointer', alignSelf: 'flex-end' }}>Log Session</button>
            {error && <div style={{ color: '#d32f2f', fontWeight: 600 }}>{error}</div>}
          </form>
          <div style={{ marginTop: 24 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Your Training Log</h2>
            {logs.length === 0 ? (
              <div style={{ color: '#888' }}>No logs yet.</div>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {logs.map(log => (
                  <li key={log.id} style={{ background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #0001', marginBottom: 16, padding: 16, textAlign: 'left' }}>
                    <div style={{ fontWeight: 600, color: '#006600' }}>{log.date}</div>
                    <div>Arrows: {log.arrows}</div>
                    <div style={{ margin: '8px 0' }}>{log.notes}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
      {user.role === "coach" && (
        <div style={{ marginTop: 24 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Coach Access</h2>
          <div style={{ color: '#888' }}>Coach dashboard features coming soon. You will be able to view and manage archer logs.</div>
        </div>
      )}
    </main>
  );
}