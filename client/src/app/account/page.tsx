"use client";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import Link from "next/link";

export default function AccountSettings() {
  const { user, setLeaderboardPublic, setTwoFactorEnabled } = useAuth();
  const [pending, setPending] = useState<"leaderboard" | "2fa" | null>(null);

  if (!user) {
    return (
      <div className="page-wrap" style={{ textAlign: "center", paddingTop: 80 }}>
        <h1 className="page-title">Account Settings</h1>
        <p style={{ color: "var(--text-secondary)", marginBottom: 24 }}>Please log in to manage your account.</p>
        <Link href="/login" className="btn btn-green">Log In</Link>
      </div>
    );
  }

  const toggleLeaderboard = async () => {
    setPending("leaderboard");
    await setLeaderboardPublic(!user.leaderboardPublic);
    setPending(null);
  };

  const toggleTwoFactor = async () => {
    setPending("2fa");
    await setTwoFactorEnabled(!user.twoFactorEnabled);
    setPending(null);
  };

  return (
    <div className="page-wrap" style={{ maxWidth: 640 }}>
      <h1 className="page-title">Account Settings</h1>
      <p className="page-subtitle">{user.name} — {user.email}</p>

      <div className="card" style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 6 }}>Leaderboard Privacy</h2>
        <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: 14 }}>
          When public, your best score each month is shown on the public leaderboard with your name and club.
        </p>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "0.9rem", fontWeight: 600, color: user.leaderboardPublic ? "var(--ke-green)" : "var(--text-muted)" }}>
            {user.leaderboardPublic ? "Visible on public leaderboard" : "Hidden from public leaderboard"}
          </span>
          <button onClick={toggleLeaderboard} disabled={pending === "leaderboard"} className="btn btn-outline" style={{ fontSize: "0.8rem" }}>
            {pending === "leaderboard" ? "Updating..." : user.leaderboardPublic ? "Make private" : "Make public"}
          </button>
        </div>
      </div>

      <div className="card">
        <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 6 }}>Two-Factor Authentication</h2>
        <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: 14 }}>
          When enabled, we&apos;ll email you a one-time 6-digit code every time you log in, in addition to your password.
        </p>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "0.9rem", fontWeight: 600, color: user.twoFactorEnabled ? "var(--ke-green)" : "var(--text-muted)" }}>
            {user.twoFactorEnabled ? "Enabled" : "Disabled"}
          </span>
          <button onClick={toggleTwoFactor} disabled={pending === "2fa"} className="btn btn-outline" style={{ fontSize: "0.8rem" }}>
            {pending === "2fa" ? "Updating..." : user.twoFactorEnabled ? "Disable" : "Enable"}
          </button>
        </div>
      </div>
    </div>
  );
}
