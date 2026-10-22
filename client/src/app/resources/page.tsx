"use client";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

type Post = { id: number; author: string; content: string; date: string };

const initialPosts: Post[] = [
  { id: 1, author: "Coach Wanjiru", content: "Always warm up before shooting — 10 min stretching then 10 blank bale arrows.", date: "2026-02-18" },
  { id: 2, author: "Archer Kimani", content: "Check your nocking point every session. A 1mm shift can affect grouping significantly.", date: "2026-02-19" },
  { id: 3, author: "Coach Otieno", content: "Mental focus is as important as form. Try box breathing before each end: 4-4-4-4.", date: "2026-02-19" },
];

export default function Resources() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [content, setContent] = useState("");
  const [error, setError] = useState("");

  const handlePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setError("Tip cannot be empty");
      return;
    }
    setPosts([
      { id: Date.now(), author: user?.name || "Anonymous", content, date: new Date().toISOString().slice(0, 10) },
      ...posts,
    ]);
    setContent("");
    setError("");
  };

  return (
    <div className="page-wrap">
      <h1 className="page-title">Resources & Tips</h1>
      <p className="page-subtitle">Archery knowledge shared by the community</p>

      {user ? (
        <div className="card" style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 14 }}>Share a Tip</h2>
          <form onSubmit={handlePost} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <textarea className="textarea" value={content} onChange={e => setContent(e.target.value)} placeholder="Share a tip, resource, or technique..." rows={3} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              {error && <span className="error-text">{error}</span>}
              <button type="submit" className="btn btn-green" style={{ marginLeft: "auto" }}>Post</button>
            </div>
          </form>
        </div>
      ) : (
        <p style={{ color: "var(--text-muted)", marginBottom: 24, fontSize: "0.9rem" }}>Log in to share your own tips.</p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {posts.map(post => (
          <div key={post.id} className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontWeight: 700, color: "var(--ke-green)", fontSize: "0.95rem" }}>{post.author}</span>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{post.date}</span>
            </div>
            <p style={{ fontSize: "0.95rem", color: "var(--text-primary)", lineHeight: 1.6 }}>{post.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}