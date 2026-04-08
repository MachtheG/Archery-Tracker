"use client";
import { useState } from "react";
import { useAuth, validateAdminCode } from "../../contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminRegister() {
  const { signup, loading } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [club, setClub] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateAdminCode(inviteCode)) {
      setError("Invalid admin invite code. Contact the Kenya Archery Association for access.");
      return;
    }

    const ok = await signup(name, email, password, ["admin", "coach", "archer"], club, "Admin");
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
          <div style={{ fontSize: "2.5rem", marginBottom: 8 }}>🔐</div>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 800, marginBottom: 6 }}>Admin Registration</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
            This page is for Kenya Archery Association administrators only.
            <br />You need an invite code to register.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Invite code */}
          <div style={{
            padding: 14,
            background: "rgba(204, 153, 0, 0.06)",
            border: "1px solid var(--ke-gold)",
            borderRadius: "var(--radius-sm)",
          }}>
            <label style={{ fontSize: "0.85rem", fontWeight: 700, marginBottom: 6, display: "block", color: "var(--ke-gold)" }}>
              🔑 Admin Invite Code
            </label>
            <input
              type="text"
              className="input"
              placeholder="Enter your invite code"
              required
              value={inviteCode}
              onChange={e => setInviteCode(e.target.value)}
              style={{ fontFamily: "monospace", letterSpacing: "1px" }}
            />
          </div>

          <div>
            <label style={{ fontSize: "0.85rem", fontWeight: 600, marginBottom: 6, display: "block" }}>Full Name</label>
            <input type="text" className="input" placeholder="Admin Name" required value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: "0.85rem", fontWeight: 600, marginBottom: 6, display: "block" }}>Email</label>
            <input type="email" className="input" placeholder="admin@archeryke.co.ke" required value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: "0.85rem", fontWeight: 600, marginBottom: 6, display: "block" }}>Password</label>
            <input type="password" className="input" placeholder="At least 6 characters" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: "0.85rem", fontWeight: 600, marginBottom: 6, display: "block" }}>Organisation / Club</label>
            <input type="text" className="input" placeholder="e.g. Kenya Archery Association" required value={club} onChange={e => setClub(e.target.value)} />
          </div>

          <button type="submit" className="btn btn-gold" disabled={loading} style={{ width: "100%", marginTop: 4 }}>
            {loading ? "Registering..." : "Register as Admin"}
          </button>
          {error && <div className="error-text" style={{ textAlign: "center" }}>{error}</div>}

          <div style={{ textAlign: "center", fontSize: "0.9rem", color: "var(--text-secondary)" }}>
            Not an admin?{" "}
            <Link href="/signup" style={{ color: "var(--ke-green)", fontWeight: 600 }}>Sign up as Archer/Coach →</Link>
          </div>
        </form>
      </div>
    </main>
  );
}
