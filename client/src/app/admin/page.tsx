"use client";
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { apiUrl, authHeaders } from "../lib/api";
import DailyBarChart from "../components/DailyBarChart";
import Link from "next/link";

type AdminStats = {
  generatedAt: string;
  rangeDays: number;
  users: {
    total: number;
    byRole: { archer: number; coach: number; admin: number };
    leaderboardPublic: number;
    leaderboardPrivate: number;
    newInRange: number;
    dailySignups: { date: string; count: number }[];
  };
  sessions: {
    total: number;
    newInRange: number;
    dailySessions: { date: string; count: number }[];
  };
  store: { active: number; reserved: number; sold: number };
  competitionResults: number;
};

function StatTile({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="card" style={{ textAlign: "center", padding: "18px 14px" }}>
      <div style={{ fontSize: "1.5rem", fontWeight: 800, color: color || "var(--text-primary)" }}>{value}</div>
      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 2 }}>{label}</div>
    </div>
  );
}

export default function AdminDashboard() {
  const { user, hasRole } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user || !hasRole("admin")) return;
    const token = localStorage.getItem("archery_token");
    fetch(apiUrl("/api/admin/stats?days=30"), { headers: authHeaders(token) })
      .then((res) => {
        if (res.status === 403) throw new Error("You don't have permission to view this page.");
        if (!res.ok) throw new Error("Failed to load admin stats.");
        return res.json();
      })
      .then(setStats)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [user, hasRole]);

  if (!user) {
    return (
      <div className="page-wrap" style={{ textAlign: "center", paddingTop: 80 }}>
        <h1 className="page-title">Admin Dashboard</h1>
        <p style={{ color: "var(--text-secondary)", marginBottom: 24 }}>Please log in.</p>
        <Link href="/login" className="btn btn-green">Log In</Link>
      </div>
    );
  }

  if (!hasRole("admin")) {
    return (
      <div className="page-wrap" style={{ textAlign: "center", paddingTop: 80 }}>
        <h1 className="page-title">Admin Dashboard</h1>
        <p style={{ color: "var(--text-secondary)" }}>This page is only available to administrators.</p>
      </div>
    );
  }

  return (
    <div className="page-wrap">
      <h1 className="page-title">Admin Dashboard</h1>
      <p className="page-subtitle">Usage overview — no raw user data, just aggregate counts.</p>

      {loading && <p style={{ color: "var(--text-muted)" }}>Loading...</p>}
      {error && <p className="error-text">{error}</p>}

      {stats && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 14, marginBottom: 28 }}>
            <StatTile label="Total Archers/Coaches/Admins" value={stats.users.total} color="var(--ke-green)" />
            <StatTile label={`New Signups (${stats.rangeDays}d)`} value={stats.users.newInRange} color="var(--ke-gold)" />
            <StatTile label="Total Sessions Logged" value={stats.sessions.total} color="var(--ke-red)" />
            <StatTile label={`New Sessions (${stats.rangeDays}d)`} value={stats.sessions.newInRange} color="var(--ke-red)" />
            <StatTile label="Public on Leaderboard" value={stats.users.leaderboardPublic} />
            <StatTile label="Private / Opted Out" value={stats.users.leaderboardPrivate} />
            <StatTile label="Competition Results Posted" value={stats.competitionResults} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 28 }}>
            <div className="card">
              <h2 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: 14 }}>Daily Signups — last {stats.rangeDays} days</h2>
              <DailyBarChart data={stats.users.dailySignups} color="var(--ke-gold)" />
            </div>
            <div className="card">
              <h2 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: 14 }}>Daily Sessions Logged — last {stats.rangeDays} days</h2>
              <DailyBarChart data={stats.sessions.dailySessions} color="var(--ke-red)" />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div className="card">
              <h2 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: 12 }}>Users by Role</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: "0.85rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}><span>Archers</span><strong>{stats.users.byRole.archer}</strong></div>
                <div style={{ display: "flex", justifyContent: "space-between" }}><span>Coaches</span><strong>{stats.users.byRole.coach}</strong></div>
                <div style={{ display: "flex", justifyContent: "space-between" }}><span>Admins</span><strong>{stats.users.byRole.admin}</strong></div>
              </div>
            </div>
            <div className="card">
              <h2 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: 12 }}>Marketplace Listings</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: "0.85rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}><span>Active</span><strong style={{ color: "var(--ke-green)" }}>{stats.store.active}</strong></div>
                <div style={{ display: "flex", justifyContent: "space-between" }}><span>Reserved</span><strong style={{ color: "var(--ke-gold)" }}>{stats.store.reserved}</strong></div>
                <div style={{ display: "flex", justifyContent: "space-between" }}><span>Sold</span><strong style={{ color: "var(--text-muted)" }}>{stats.store.sold}</strong></div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
