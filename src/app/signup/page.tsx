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
  const [selectedRoles, setSelectedRoles] = useState<string[]>(["archer"]);
  const [club, setClub] = useState("");
  const [category, setCategory] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const toggleRole = (role: string) => {
    setSelectedRoles(prev => {
      if (prev.includes(role)) {
        // Don't allow removing last role
        if (prev.length === 1) return prev;
        return prev.filter(r => r !== role);
      }
      return [...prev, role];
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (selectedRoles.length === 0) {
      setError("Please select at least one role.");
      return;
    }
    const ok = await signup(name, email, password, selectedRoles, club, category);
    if (ok) {
      setSuccess(true);
    } else {
      setError("An account with this email already exists or there was an error.");
    }
  };

  const roleOptions = [
    { value: "archer", label: "Archer", icon: "🎯", desc: "Log scores, track equipment, view analytics" },
    { value: "coach", label: "Coach", icon: "📋", desc: "Post training routines, manage leaderboard" },
  ];

  return (
    <main style={{
      minHeight: "calc(100vh - var(--nav-height) - 4px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 24px",
      background: "var(--bg-primary)",
    }}>
      <div style={{ width: "100%", maxWidth: 480 }}>
        {success ? (
          <div className="card" style={{ textAlign: "center", padding: "40px 24px" }}>
            <div style={{ fontSize: "3rem", marginBottom: 12 }}>✉️</div>
            <h2 style={{ fontSize: "1.4rem", fontWeight: 800, marginBottom: 12 }}>Check Your Email</h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: 20 }}>
              We've sent a verification link to <strong>{email}</strong>. Please click the link to verify your account and complete registration.
            </p>
            <Link href="/login" className="btn btn-outline" style={{ display: "inline-block" }}>
              Return to Login
            </Link>
          </div>
        ) : (
          <>
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <h1 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: 6 }}>Create your account</h1>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>Join Archery Kenya today</p>
            </div>
            
            <button type="button" className="btn btn-outline" style={{ width: "100%", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
              <img src="https://www.google.com/favicon.ico" alt="Google" style={{ width: 18, height: 18 }} />
              Sign up with Google
            </button>
            <div style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: 16 }}>— OR —</div>

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

          {/* Multi-role selection */}
          <div>
            <label style={{ fontSize: "0.85rem", fontWeight: 600, marginBottom: 8, display: "block" }}>
              Role(s) <span style={{ fontWeight: 400, color: "var(--text-muted)" }}>— select one or more</span>
            </label>
            <div style={{ display: "flex", gap: 10 }}>
              {roleOptions.map(opt => {
                const active = selectedRoles.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => toggleRole(opt.value)}
                    style={{
                      flex: 1,
                      padding: "14px 12px",
                      borderRadius: "var(--radius-sm)",
                      border: `2px solid ${active ? "var(--ke-green)" : "var(--border-light)"}`,
                      background: active ? "rgba(0, 107, 63, 0.06)" : "var(--bg-primary)",
                      cursor: "pointer",
                      textAlign: "center",
                      transition: "all 0.15s",
                      fontFamily: "inherit",
                    }}
                  >
                    <div style={{ fontSize: "1.5rem", marginBottom: 4 }}>{opt.icon}</div>
                    <div style={{ fontWeight: 700, fontSize: "0.9rem", color: active ? "var(--ke-green)" : "var(--text-primary)" }}>
                      {opt.label}
                    </div>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: 2 }}>{opt.desc}</div>
                    {active && (
                      <div style={{ marginTop: 6, fontSize: "0.7rem", color: "var(--ke-green)", fontWeight: 700 }}>✓ Selected</div>
                    )}
                  </button>
                );
              })}
            </div>
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
          <div style={{ textAlign: "center", fontSize: "0.8rem", color: "var(--text-muted)", marginTop: 4 }}>
            Admin access? <Link href="/admin/register" style={{ color: "var(--ke-gold)", fontWeight: 600 }}>Register as Admin →</Link>
          </div>
        </form>
        </>
        )}
      </div>
    </main>
  );
}
