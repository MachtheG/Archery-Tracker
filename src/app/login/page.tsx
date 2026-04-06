"use client";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
      router.push("/dashboard");
    } else {
      setError("Invalid email or password. Make sure you've signed up first.");
    }
  };

  return (
    <main style={{
      minHeight: "calc(100vh - var(--nav-height) - 4px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 24px",
      background: "var(--bg-primary)",
    }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: 6 }}>Welcome back</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>Log in to your Archery Kenya account</p>
        </div>
        <form onSubmit={handleSubmit} className="card" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ fontSize: "0.85rem", fontWeight: 600, marginBottom: 6, display: "block" }}>Email</label>
            <input
              type="email"
              className="input"
              placeholder="you@example.com"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label style={{ fontSize: "0.85rem", fontWeight: 600, marginBottom: 6, display: "block" }}>Password</label>
            <input
              type="password"
              className="input"
              placeholder="Your password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-green" disabled={loading} style={{ width: "100%", marginTop: 4 }}>
            {loading ? "Logging in..." : "Log In"}
          </button>
          {error && <div className="error-text" style={{ textAlign: "center" }}>{error}</div>}
          <div style={{ textAlign: "center", fontSize: "0.9rem", color: "var(--text-secondary)" }}>
            Don&apos;t have an account?{" "}
            <Link href="/signup" style={{ color: "var(--ke-green)", fontWeight: 600 }}>Sign Up</Link>
          </div>
        </form>
      </div>
    </main>
  );
}
