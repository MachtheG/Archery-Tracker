"use client";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useRouter } from "next/navigation";
export default function Signup() {
  const { signup, loading } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const ok = await signup(name, email, password, role, club, category);
    if (ok) {
      router.push("/");
    } else {
      setError("Signup failed. Try again.");
    }
  };

  return (
    <main style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <h1>Sign Up</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 320 }}>
        <input type="text" placeholder="Name" required value={name} onChange={e => setName(e.target.value)} style={{ padding: 8, fontSize: 16, borderRadius: 4, border: '1px solid #ccc' }} />
        <input type="email" placeholder="Email" required value={email} onChange={e => setEmail(e.target.value)} style={{ padding: 8, fontSize: 16, borderRadius: 4, border: '1px solid #ccc' }} />
        <input type="password" placeholder="Password" required value={password} onChange={e => setPassword(e.target.value)} style={{ padding: 8, fontSize: 16, borderRadius: 4, border: '1px solid #ccc' }} />
        <input type="text" placeholder="Role (archer, coach, admin)" required value={role} onChange={e => setRole(e.target.value)} style={{ padding: 8, fontSize: 16, borderRadius: 4, border: '1px solid #ccc' }} />
        <input type="text" placeholder="Club" required value={club} onChange={e => setClub(e.target.value)} style={{ padding: 8, fontSize: 16, borderRadius: 4, border: '1px solid #ccc' }} />
        <input type="text" placeholder="Category" required value={category} onChange={e => setCategory(e.target.value)} style={{ padding: 8, fontSize: 16, borderRadius: 4, border: '1px solid #ccc' }} />
        <button type="submit" disabled={loading} style={{ background: '#006600', color: '#fff', padding: '0.7rem', border: 'none', borderRadius: 4, fontWeight: 700, fontSize: 16, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
          {loading ? "Signing up..." : "Sign Up"}
        </button>
        {error && <div style={{ color: '#d32f2f', textAlign: 'center', fontWeight: 600 }}>{error}</div>}
      </form>
    </main>
  );
}
