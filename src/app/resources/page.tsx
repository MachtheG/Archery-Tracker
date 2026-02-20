"use client";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

type Post = { id: number; author: string; content: string; date: string };

const initialPosts: Post[] = [
  { id: 1, author: "Coach Wanjiru", content: "Always warm up before shooting.", date: "2026-02-18" },
  { id: 2, author: "Archer Kimani", content: "Check your nocking point every session.", date: "2026-02-19" },
  { id: 3, author: "Coach Otieno", content: "Mental focus is as important as form.", date: "2026-02-19" },
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
    <main style={{ padding: '2rem', maxWidth: 600, margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', fontWeight: 800 }}>Archery Resources & Tips</h1>
      {user ? (
        <form onSubmit={handlePost} style={{ margin: '2rem 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Share a tip or resource..."
            rows={3}
            style={{ padding: 10, borderRadius: 6, border: '1px solid #ccc', fontSize: 16 }}
          />
          <button type="submit" style={{ background: '#006600', color: '#fff', border: 'none', borderRadius: 6, padding: '0.7em 1.5em', fontWeight: 700, cursor: 'pointer', alignSelf: 'flex-end' }}>Post</button>
          {error && <div style={{ color: '#d32f2f', fontWeight: 600 }}>{error}</div>}
        </form>
      ) : (
        <div style={{ textAlign: 'center', margin: '2rem 0', color: '#888' }}>Log in to post your own tips.</div>
      )}
      <div style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Latest Tips & Resources</h2>
        {posts.length === 0 ? (
          <div style={{ color: '#888' }}>No tips yet.</div>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {posts.map(post => (
              <li key={post.id} style={{ background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #0001', marginBottom: 16, padding: 16, textAlign: 'left' }}>
                <div style={{ fontWeight: 600, color: '#006600' }}>{post.author}</div>
                <div style={{ margin: '8px 0' }}>{post.content}</div>
                <div style={{ fontSize: 13, color: '#888', textAlign: 'right' }}>{post.date}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}