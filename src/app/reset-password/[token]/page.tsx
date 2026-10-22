"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiUrl } from "../../lib/api";
import Link from "next/link";

export default function ResetPassword() {
  const params = useParams<{ token: string }>();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(apiUrl(`/api/auth/reset-password/${params?.token}`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => router.push("/login"), 2500);
      } else {
        setError(data.message || "This reset link is invalid or has expired.");
      }
    } catch {
      setError("Could not reach the server. Please try again.");
    }
    setLoading(false);
  };

  return (
    <main style={{
      minHeight: "calc(100vh - var(--nav-height) - 4px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "40px 24px", background: "var(--bg-primary)",
    }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: 6 }}>Choose a new password</h1>
        </div>

        {success ? (
          <div className="card" style={{ textAlign: "center" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>✅</div>
            <p style={{ color: "var(--text-secondary)" }}>Password updated. Redirecting you to log in...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="card" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ fontSize: "0.85rem", fontWeight: 600, marginBottom: 6, display: "block" }}>New Password</label>
              <input
                type="password"
                className="input"
                placeholder="At least 6 characters"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label style={{ fontSize: "0.85rem", fontWeight: 600, marginBottom: 6, display: "block" }}>Confirm Password</label>
              <input
                type="password"
                className="input"
                placeholder="Re-enter password"
                required
                minLength={6}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-green" disabled={loading} style={{ width: "100%" }}>
              {loading ? "Updating..." : "Update Password"}
            </button>
            {error && <div className="error-text" style={{ textAlign: "center" }}>{error}</div>}
            <div style={{ textAlign: "center", fontSize: "0.9rem", color: "var(--text-secondary)" }}>
              <Link href="/login" style={{ color: "var(--ke-green)", fontWeight: 600 }}>Back to Login</Link>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
