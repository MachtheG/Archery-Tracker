"use client";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { apiUrl } from "../lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Login() {
  const { login, verifyTwoFactor, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resendStatus, setResendStatus] = useState("");

  // 2FA step
  const [pendingToken, setPendingToken] = useState<string | null>(null);
  const [code, setCode] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setNeedsVerification(false);

    const result = await login(email, password);
    if (result.status === "ok") {
      router.push("/dashboard");
    } else if (result.status === "twoFactorRequired") {
      setPendingToken(result.pendingToken);
    } else if (result.status === "emailNotVerified") {
      setNeedsVerification(true);
    } else {
      setError(result.message);
    }
  };

  const handleResend = async () => {
    setResendStatus("Sending...");
    try {
      const res = await fetch(apiUrl("/api/auth/resend-verification"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setResendStatus("If that account needs verifying, a new email is on its way.");
      } else {
        setResendStatus("Something went wrong. Please try again.");
      }
    } catch {
      setResendStatus("Could not reach the server.");
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!pendingToken) return;
    const ok = await verifyTwoFactor(pendingToken, code);
    if (ok) {
      router.push("/dashboard");
    } else {
      setError("Incorrect or expired code.");
    }
  };

  if (pendingToken) {
    return (
      <main style={{
        minHeight: "calc(100vh - var(--nav-height) - 4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "40px 24px", background: "var(--bg-primary)",
      }}>
        <div style={{ width: "100%", maxWidth: 400 }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <h1 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: 6 }}>Enter your login code</h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
              We emailed a 6-digit code to {email}. It expires in 10 minutes.
            </p>
          </div>
          <form onSubmit={handleVerifyCode} className="card" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <input
              className="input"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="123456"
              inputMode="numeric"
              maxLength={6}
              required
              style={{ textAlign: "center", letterSpacing: "4px", fontSize: "1.2rem" }}
            />
            <button type="submit" className="btn btn-green" disabled={loading || code.length !== 6} style={{ width: "100%" }}>
              {loading ? "Verifying..." : "Verify & Log In"}
            </button>
            {error && <div className="error-text" style={{ textAlign: "center" }}>{error}</div>}
            <button type="button" onClick={() => setPendingToken(null)} className="btn btn-outline" style={{ width: "100%", fontSize: "0.85rem" }}>
              Back to login
            </button>
          </form>
        </div>
      </main>
    );
  }

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
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <label style={{ fontSize: "0.85rem", fontWeight: 600 }}>Password</label>
              <Link href="/forgot-password" style={{ fontSize: "0.8rem", color: "var(--ke-green)", fontWeight: 600 }}>
                Forgot password?
              </Link>
            </div>
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

          {needsVerification && (
            <div style={{
              padding: 12,
              background: "rgba(204, 153, 0, 0.06)",
              border: "1px solid var(--ke-gold)",
              borderRadius: "var(--radius-sm)",
              fontSize: "0.85rem",
              textAlign: "center",
            }}>
              <div style={{ marginBottom: 8 }}>Please verify your email before logging in.</div>
              <button type="button" onClick={handleResend} className="btn btn-outline" style={{ fontSize: "0.8rem" }}>
                Resend verification email
              </button>
              {resendStatus && <div style={{ marginTop: 8, color: "var(--text-secondary)" }}>{resendStatus}</div>}
            </div>
          )}

          <div style={{ textAlign: "center", fontSize: "0.9rem", color: "var(--text-secondary)" }}>
            Don&apos;t have an account?{" "}
            <Link href="/signup" style={{ color: "var(--ke-green)", fontWeight: 600 }}>Sign Up</Link>
          </div>
        </form>
      </div>
    </main>
  );
}
