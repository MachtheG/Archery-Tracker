"use client";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

type Update = { id: number; coach: string; content: string; date: string };

const initialUpdates: Update[] = [
  { id: 1, coach: "Coach Wanjiru", content: "National Trials: March 10, Nairobi", date: "2026-02-18" },
  { id: 2, coach: "Coach Otieno", content: "County League: March 24, Kisumu", date: "2026-02-19" },
];

export default function NationalUpdates() {
  const { user } = useAuth();
  const [updates, setUpdates] = useState<Update[]>(initialUpdates);
  const [content, setContent] = useState("");
  const [error, setError] = useState("");

  const handlePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setError("Announcement cannot be empty");
      return;
    }
    setUpdates([
      { id: Date.now(), coach: user?.name || "Coach", content, date: new Date().toISOString().slice(0, 10) },
      ...updates,
    ]);
    setContent("");
    setError("");
  };

  return (
    <main style={{ padding: '2rem', maxWidth: 600, margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', fontWeight: 800 }}>National Updates</h1>
      {user?.role === "coach" ? (
        <form onSubmit={handlePost} style={{ margin: '2rem 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Announce a new competition or update..."
            rows={3}
            style={{ padding: 10, borderRadius: 6, border: '1px solid #ccc', fontSize: 16 }}
          />
          <button type="submit" style={{ background: '#d32f2f', color: '#fff', border: 'none', borderRadius: 6, padding: '0.7em 1.5em', fontWeight: 700, cursor: 'pointer', alignSelf: 'flex-end' }}>Post</button>
          {error && <div style={{ color: '#d32f2f', fontWeight: 600 }}>{error}</div>}
        </form>
      ) : user ? (
        <div style={{ textAlign: 'center', margin: '2rem 0', color: '#888' }}>Only coaches can post updates.</div>
      ) : (
        <div style={{ textAlign: 'center', margin: '2rem 0', color: '#888' }}>Log in to view and post updates.</div>
      )}
      <div style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Latest Announcements</h2>
        {updates.length === 0 ? (
          <div style={{ color: '#888' }}>No updates yet.</div>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {updates.map(update => (
              <li key={update.id} style={{ background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #0001', marginBottom: 16, padding: 16, textAlign: 'left' }}>
                <div style={{ fontWeight: 600, color: '#d32f2f' }}>{update.coach}</div>
                <div style={{ margin: '8px 0' }}>{update.content}</div>
                <div style={{ fontSize: 13, color: '#888', textAlign: 'right' }}>{update.date}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}