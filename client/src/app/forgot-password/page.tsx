"use client";
import { useState } from "react";
import { apiUrl } from "../lib/api";
import Link from "next/link";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch(apiUrl("/api/auth/forgot-password"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    } catch {
      // Intentionally ignored — we show the same message either way below.
    }
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <main style={{
      minHeight: "calc(100vh - var(--nav-height) - 4px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "40px 24px", background: "var(--bg-primary)",
    }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: 6 }}>Reset your password</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
            Enter the email on your account and we&apos;ll send a reset link.
          </p>
        </div>

        {submitted ? (
          <div className="card" style={{ textAlign: "center" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>✉️</div>
            <p style={{ color: "var(--text-secondary)", marginBottom: 20 }}>
              If an account exists for <strong>{email}</strong>, a password reset link is on its way. Check your inbox.
            </p>
            <Link href="/login" className="btn btn-outline">Back to Login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="card" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ fontSize: "0.85rem", fontWeight: 600, marginBottom: 6, display: "block" }}>Email</label>
              <input
                type="email"
                className="input"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-green" disabled={loading} style={{ width: "100%" }}>
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
            <div style={{ textAlign: "center", fontSize: "0.9rem", color: "var(--text-secondary)" }}>
              <Link href="/login" style={{ color: "var(--ke-green)", fontWeight: 600 }}>Back to Login</Link>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
