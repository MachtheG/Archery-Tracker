"use client";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

type Update = { id: number; coach: string; content: string; date: string };

const initialUpdates: Update[] = [
  { id: 1, coach: "Coach Wanjiru", content: "🏹 National Trials: March 10 at Kasarani, Nairobi. All categories. Registration closes March 5.", date: "2026-02-18" },
  { id: 2, coach: "Coach Otieno", content: "📍 County League Round 3: March 24 at Kisumu Archery Range. Recurve & Compound.", date: "2026-02-19" },
  { id: 3, coach: "Admin KAF", content: "📋 Team selection for All-Africa Games announced. Check your email for details.", date: "2026-02-20" },
];

export default function NationalUpdates() {
  const { user } = useAuth();
  const [updates, setUpdates] = useState<Update[]>(initialUpdates);
  const [content, setContent] = useState("");
  const [error, setError] = useState("");

  const canPost = user?.role === "coach" || user?.role === "admin";

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
    <div className="page-wrap">
      <h1 className="page-title">National Updates</h1>
      <p className="page-subtitle">Competitions, events, and announcements from Archery Kenya</p>

      {canPost && (
        <div className="card" style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 14 }}>Post an Update</h2>
          <form onSubmit={handlePost} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <textarea
              className="textarea"
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Announce a competition, event, or national update..."
              rows={3}
            />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              {error && <span className="error-text">{error}</span>}
              <button type="submit" className="btn btn-red" style={{ marginLeft: "auto" }}>Post Update</button>
            </div>
          </form>
        </div>
      )}

      {user && !canPost && (
        <p style={{ color: "var(--text-muted)", marginBottom: 24, fontSize: "0.9rem" }}>Only coaches and admins can post updates.</p>
      )}
      {!user && (
        <p style={{ color: "var(--text-muted)", marginBottom: 24, fontSize: "0.9rem" }}>Log in to view full features.</p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {updates.map(update => (
          <div key={update.id} className="card" style={{ borderLeft: "3px solid var(--ke-red)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontWeight: 700, color: "var(--ke-red)", fontSize: "0.95rem" }}>{update.coach}</span>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{update.date}</span>
            </div>
            <p style={{ fontSize: "0.95rem", color: "var(--text-primary)", lineHeight: 1.6 }}>{update.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}