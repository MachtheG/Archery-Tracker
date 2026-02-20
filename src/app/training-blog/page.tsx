"use client";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

type Routine = { id: number; coach: string; content: string; date: string };

const initialRoutines: Routine[] = [
  { id: 1, coach: "Coach Wanjiru", content: "Monday: 50 arrows at 70m, focus on anchor.", date: "2026-02-18" },
  { id: 2, coach: "Coach Otieno", content: "Wednesday: 30 arrows, blank bale, eyes closed.", date: "2026-02-19" },
];

export default function TrainingBlog() {
  const { user } = useAuth();
  const [routines, setRoutines] = useState<Routine[]>(initialRoutines);
  const [content, setContent] = useState("");
  const [error, setError] = useState("");

  const handlePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setError("Routine cannot be empty");
      return;
    }
    setRoutines([
      { id: Date.now(), coach: user?.name || "Coach", content, date: new Date().toISOString().slice(0, 10) },
      ...routines,
    ]);
    setContent("");
    setError("");
  };

  return (
    <main style={{ padding: '2rem', maxWidth: 600, margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', fontWeight: 800 }}>Training Blog</h1>
      {user?.role === "coach" ? (
        <form onSubmit={handlePost} style={{ margin: '2rem 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Post a new training routine..."
            rows={3}
            style={{ padding: 10, borderRadius: 6, border: '1px solid #ccc', fontSize: 16 }}
          />
          <button type="submit" style={{ background: '#006600', color: '#fff', border: 'none', borderRadius: 6, padding: '0.7em 1.5em', fontWeight: 700, cursor: 'pointer', alignSelf: 'flex-end' }}>Post</button>
          {error && <div style={{ color: '#d32f2f', fontWeight: 600 }}>{error}</div>}
        </form>
      ) : user ? (
        <div style={{ textAlign: 'center', margin: '2rem 0', color: '#888' }}>Only coaches can post routines.</div>
      ) : (
        <div style={{ textAlign: 'center', margin: '2rem 0', color: '#888' }}>Log in to view and post routines.</div>
      )}
      <div style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Latest Routines</h2>
        {routines.length === 0 ? (
          <div style={{ color: '#888' }}>No routines yet.</div>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {routines.map(routine => (
              <li key={routine.id} style={{ background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #0001', marginBottom: 16, padding: 16, textAlign: 'left' }}>
                <div style={{ fontWeight: 600, color: '#006600' }}>{routine.coach}</div>
                <div style={{ margin: '8px 0' }}>{routine.content}</div>
                <div style={{ fontSize: 13, color: '#888', textAlign: 'right' }}>{routine.date}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}