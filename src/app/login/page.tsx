"use client";
const KENYA_COLORS = {
  black: '#000',
  red: '#d32f2f',
  green: '#006600',
  white: '#fff',
  gold: '#FFD700',
};

import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function Login() {
  const { login, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const ok = await login(email, password);
    if (ok) {
      router.push("/");
    } else {
      setError("Invalid email or password");
    }
  };

  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: `linear-gradient(135deg, ${KENYA_COLORS.green} 0%, ${KENYA_COLORS.gold} 100%)`,
    }}>
      <h1 style={{ color: KENYA_COLORS.black }}>Login</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 320, background: KENYA_COLORS.white, borderRadius: 12, boxShadow: '0 2px 16px #0002', padding: 24 }}>
        <input type="email" placeholder="Email" required value={email} onChange={e => setEmail(e.target.value)} style={{ padding: 8, fontSize: 16, borderRadius: 4, border: '1px solid #ccc' }} />
        <input type="password" placeholder="Password" required value={password} onChange={e => setPassword(e.target.value)} style={{ padding: 8, fontSize: 16, borderRadius: 4, border: '1px solid #ccc' }} />
        <button type="submit" disabled={loading} style={{ background: KENYA_COLORS.red, color: KENYA_COLORS.white, padding: '0.7rem', border: 'none', borderRadius: 4, fontWeight: 700, fontSize: 16, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
          {loading ? "Logging in..." : "Log In"}
        </button>
        {error && <div style={{ color: KENYA_COLORS.red, textAlign: 'center', fontWeight: 600 }}>{error}</div>}
        <div style={{ textAlign: 'center', marginTop: 8 }}>
          <span style={{ color: KENYA_COLORS.black }}>Don't have an account? </span>
          <a href="/signup" style={{ color: KENYA_COLORS.green, fontWeight: 600, textDecoration: 'underline' }}>Sign Up</a>
        </div>
      </form>
    </main>
  );
}
