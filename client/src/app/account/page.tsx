"use client";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { apiUrl, authHeaders } from "../lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AccountSettings() {
  const { user, setLeaderboardPublic, setTwoFactorEnabled, deleteAccount } = useAuth();
  const router = useRouter();
  const [pending, setPending] = useState<"leaderboard" | "2fa" | "export" | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);

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

  const handleExport = async () => {
    setPending("export");
    try {
      const token = localStorage.getItem("archery_token");
      const res = await fetch(apiUrl("/api/auth/me/export"), { headers: authHeaders(token) });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `archery-tracker-export-${user.id}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } finally {
      setPending(null);
    }
  };

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeleteError("");
    setDeleting(true);
    const result = await deleteAccount(deletePassword);
    setDeleting(false);
    if (result.ok) {
      router.push("/");
    } else {
      setDeleteError(result.message);
    }
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

      <div className="card" style={{ marginTop: 20 }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 6 }}>Your Data</h2>
        <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: 14 }}>
          Download a copy of everything we hold about you — profile, sessions, equipment, tuning history, and
          marketplace listings. See our <Link href="/privacy-policy" style={{ color: "var(--ke-green)" }}>Privacy Policy</Link> for details.
        </p>
        <button onClick={handleExport} disabled={pending === "export"} className="btn btn-outline" style={{ fontSize: "0.8rem" }}>
          {pending === "export" ? "Preparing export..." : "Export my data (JSON)"}
        </button>
      </div>

      <div className="card" style={{ marginTop: 20, borderColor: "var(--ke-red)" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 6, color: "var(--ke-red)" }}>Delete Account</h2>
        <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: 14 }}>
          Permanently deletes your profile, sessions, equipment, and marketplace listings. This cannot be undone.
        </p>
        {!showDeleteConfirm ? (
          <button onClick={() => setShowDeleteConfirm(true)} className="btn btn-outline" style={{ fontSize: "0.8rem", color: "var(--ke-red)", borderColor: "var(--ke-red)" }}>
            Delete my account
          </button>
        ) : (
          <form onSubmit={handleDelete} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <label style={{ fontSize: "0.8rem", fontWeight: 600 }}>Confirm your password to permanently delete your account</label>
            <input
              type="password"
              className="input"
              required
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              placeholder="Your password"
            />
            <div style={{ display: "flex", gap: 8 }}>
              <button type="submit" disabled={deleting} className="btn btn-red" style={{ fontSize: "0.8rem" }}>
                {deleting ? "Deleting..." : "Permanently Delete Account"}
              </button>
              <button type="button" onClick={() => { setShowDeleteConfirm(false); setDeletePassword(""); setDeleteError(""); }} className="btn btn-outline" style={{ fontSize: "0.8rem" }}>
                Cancel
              </button>
            </div>
            {deleteError && <div className="error-text">{deleteError}</div>}
          </form>
        )}
      </div>
    </div>
  );
}
