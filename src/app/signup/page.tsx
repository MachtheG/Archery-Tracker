"use client";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Signup() {
  const { signup, loading } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("archer");
  const [club, setClub] = useState("");
  const [category, setCategory] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const ok = await signup(name, email, password, role, club, category);
    if (ok) {
      router.push("/dashboard");
    } else {
      setError("An account with this email already exists.");
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
      <div style={{ width: "100%", maxWidth: 440 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: 6 }}>Create your account</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>Join Archery Kenya today</p>
        </div>
        <form onSubmit={handleSubmit} className="card" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ fontSize: "0.85rem", fontWeight: 600, marginBottom: 6, display: "block" }}>Full Name</label>
            <input type="text" className="input" placeholder="John Kamau" required value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: "0.85rem", fontWeight: 600, marginBottom: 6, display: "block" }}>Email</label>
            <input type="email" className="input" placeholder="you@example.com" required value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: "0.85rem", fontWeight: 600, marginBottom: 6, display: "block" }}>Password</label>
            <input type="password" className="input" placeholder="At least 6 characters" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: "0.85rem", fontWeight: 600, marginBottom: 6, display: "block" }}>Role</label>
            <select className="select" value={role} onChange={e => setRole(e.target.value)}>
              <option value="archer">Archer</option>
              <option value="coach">Coach</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ fontSize: "0.85rem", fontWeight: 600, marginBottom: 6, display: "block" }}>Club</label>
              <input type="text" className="input" placeholder="e.g. Nairobi Archers" required value={club} onChange={e => setClub(e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: "0.85rem", fontWeight: 600, marginBottom: 6, display: "block" }}>Category</label>
              <input type="text" className="input" placeholder="e.g. Recurve" required value={category} onChange={e => setCategory(e.target.value)} />
            </div>
          </div>
          <button type="submit" className="btn btn-green" disabled={loading} style={{ width: "100%", marginTop: 4 }}>
            {loading ? "Creating account..." : "Sign Up"}
          </button>
          {error && <div className="error-text" style={{ textAlign: "center" }}>{error}</div>}
          <div style={{ textAlign: "center", fontSize: "0.9rem", color: "var(--text-secondary)" }}>
            Already have an account?{" "}
            <Link href="/login" style={{ color: "var(--ke-green)", fontWeight: 600 }}>Log In</Link>
          </div>
        </form>
      </div>
    </main>
  );
}
