"use client";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

type Routine = { id: number; coach: string; content: string; date: string };

const initialRoutines: Routine[] = [
  { id: 1, coach: "Coach Wanjiru", content: "Monday: 50 arrows at 70m, focus on anchor point. Emphasize consistent draw length.", date: "2026-02-18" },
  { id: 2, coach: "Coach Otieno", content: "Wednesday: 30 arrows blank bale with eyes closed, focusing on back tension release.", date: "2026-02-19" },
  { id: 3, coach: "Coach Wanjiru", content: "Friday: Competition simulation — 72 arrows scored, 6-arrow ends, 4 minutes per end.", date: "2026-02-20" },
];

export default function TrainingBlog() {
  const { user } = useAuth();
  const [routines, setRoutines] = useState<Routine[]>(initialRoutines);
  const [content, setContent] = useState("");
  const [error, setError] = useState("");

  const canPost = user?.role === "coach" || user?.role === "admin";

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
    <div className="page-wrap">
      <h1 className="page-title">Training Blog</h1>
      <p className="page-subtitle">Training routines and drills shared by coaches</p>

      {canPost && (
        <div className="card" style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 14 }}>Post a Routine</h2>
          <form onSubmit={handlePost} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <textarea
              className="textarea"
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Describe the training routine, drills, and focus areas..."
              rows={3}
            />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              {error && <span className="error-text">{error}</span>}
              <button type="submit" className="btn btn-green" style={{ marginLeft: "auto" }}>Post</button>
            </div>
          </form>
        </div>
      )}

      {user && !canPost && (
        <p style={{ color: "var(--text-muted)", marginBottom: 24, fontSize: "0.9rem" }}>Only coaches and admins can post routines.</p>
      )}
      {!user && (
        <p style={{ color: "var(--text-muted)", marginBottom: 24, fontSize: "0.9rem" }}>Log in to interact with training content.</p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {routines.map(routine => (
          <div key={routine.id} className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontWeight: 700, color: "var(--ke-green)", fontSize: "0.95rem" }}>{routine.coach}</span>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{routine.date}</span>
            </div>
            <p style={{ fontSize: "0.95rem", color: "var(--text-primary)", lineHeight: 1.6 }}>{routine.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}