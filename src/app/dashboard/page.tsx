"use client";
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getSessions, computeSessionStats, getEquipmentList } from "../lib/storage";
import type { ScoreSession } from "../lib/storage";
import Link from "next/link";

function RoleBadge({ role }: { role: string }) {
  const cls = role === "admin" ? "badge-admin" : role === "coach" ? "badge-coach" : "badge-archer";
  return <span className={`badge ${cls}`}>{role}</span>;
}

// ── Archer Dashboard ──
function ArcherDashboard() {
  const [sessions, setSessions] = useState<ScoreSession[]>([]);
  const [eqCount, setEqCount] = useState(0);

  useEffect(() => {
    setSessions(getSessions());
    setEqCount(getEquipmentList().length);
  }, []);

  const totalArrows = sessions.reduce((s, sess) => s + computeSessionStats(sess).totalArrows, 0);
  const avgPct = sessions.length > 0
    ? (sessions.reduce((s, sess) => s + computeSessionStats(sess).percentage, 0) / sessions.length).toFixed(1)
    : "0";

  return (
    <>
      {/* Quick stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 14, marginBottom: 28 }}>
        {[
          { label: "Sessions", value: sessions.length, color: "var(--ke-green)" },
          { label: "Arrows Shot", value: totalArrows.toLocaleString(), color: "var(--ke-red)" },
          { label: "Avg Score", value: `${avgPct}%`, color: "var(--ke-gold)" },
          { label: "Equipment Sets", value: eqCount, color: "var(--text-primary)" },
        ].map(stat => (
          <div key={stat.label} className="card" style={{ textAlign: "center", padding: "18px 14px" }}>
            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 2 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14, marginBottom: 28 }}>
        {[
          { icon: "🎯", label: "New Score Session", href: "/score-session", desc: "Log arrows on a digital scorecard", color: "var(--ke-green)" },
          { icon: "📊", label: "View Analytics", href: "/analytics", desc: "Charts, trends, and patterns", color: "var(--ke-gold)" },
          { icon: "🏹", label: "My Equipment", href: "/equipment", desc: "Virtual Quiver & tuning log", color: "var(--ke-red)" },
          { icon: "🏆", label: "Leaderboard", href: "/leaderboard", desc: "See top archers", color: "var(--ke-black)" },
        ].map(item => (
          <Link key={item.href} href={item.href} className="card" style={{ textAlign: "center", padding: "24px 14px", cursor: "pointer" }}>
            <div style={{ fontSize: "2rem", marginBottom: 8 }}>{item.icon}</div>
            <div style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: 4 }}>{item.label}</div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{item.desc}</div>
          </Link>
        ))}
      </div>

      {/* Recent sessions */}
      {sessions.length > 0 && (
        <div className="card" style={{ padding: 0, overflow: "auto" }}>
          <div style={{ padding: "16px 20px 8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ fontSize: "1rem", fontWeight: 700 }}>Recent Sessions</h2>
            <Link href="/analytics" style={{ fontSize: "0.85rem", color: "var(--ke-green)", fontWeight: 600 }}>View all →</Link>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
            <thead>
              <tr style={{ background: "var(--bg-primary)" }}>
                <th style={{ padding: "8px 16px", textAlign: "left", fontWeight: 600 }}>Date</th>
                <th style={{ padding: "8px 12px", fontWeight: 600 }}>Round</th>
                <th style={{ padding: "8px 12px", fontWeight: 600 }}>Score</th>
                <th style={{ padding: "8px 12px", fontWeight: 600 }}>%</th>
              </tr>
            </thead>
            <tbody>
              {sessions.slice(0, 5).map(s => {
                const stats = computeSessionStats(s);
                return (
                  <tr key={s.id} style={{ borderBottom: "1px solid var(--border-light)" }}>
                    <td style={{ padding: "10px 16px" }}>{s.date}</td>
                    <td style={{ padding: "10px 12px", textAlign: "center" }}>{s.roundName}</td>
                    <td style={{ padding: "10px 12px", textAlign: "center", fontWeight: 700 }}>{s.totalScore}</td>
                    <td style={{ padding: "10px 12px", textAlign: "center", color: "var(--ke-green)", fontWeight: 700 }}>{stats.percentage.toFixed(1)}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

// ── Coach Dashboard ──
function CoachDashboard() {
  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14, marginBottom: 28 }}>
        {[
          { icon: "🎯", label: "Score a Session", href: "/score-session", desc: "Log practice or competition" },
          { icon: "🏹", label: "Post Training Routines", href: "/training-blog", desc: "Share drills with archers" },
          { icon: "📰", label: "Post National Updates", href: "/national-updates", desc: "Announce events" },
          { icon: "📊", label: "Update Leaderboard", href: "/leaderboard", desc: "Post competition results" },
          { icon: "📈", label: "My Analytics", href: "/analytics", desc: "View performance data" },
          { icon: "🏹", label: "My Equipment", href: "/equipment", desc: "Virtual Quiver" },
        ].map(item => (
          <Link key={item.label} href={item.href} className="card" style={{ textAlign: "center", padding: "24px 14px", cursor: "pointer" }}>
            <div style={{ fontSize: "2rem", marginBottom: 8 }}>{item.icon}</div>
            <div style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: 4 }}>{item.label}</div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{item.desc}</div>
          </Link>
        ))}
      </div>
    </>
  );
}

// ── Admin Dashboard ──
function AdminDashboard() {
  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14, marginBottom: 28 }}>
        {[
          { icon: "📊", label: "Manage Leaderboard", href: "/leaderboard", desc: "Post & manage results" },
          { icon: "📰", label: "National Updates", href: "/national-updates", desc: "Post announcements" },
          { icon: "🏹", label: "Training Blog", href: "/training-blog", desc: "Share routines" },
          { icon: "🎯", label: "Score a Session", href: "/score-session", desc: "Log a session" },
          { icon: "📈", label: "Analytics", href: "/analytics", desc: "View data & charts" },
          { icon: "🛒", label: "Store", href: "/store", desc: "View products" },
        ].map(item => (
          <Link key={item.label} href={item.href} className="card" style={{ textAlign: "center", padding: "24px 14px", cursor: "pointer" }}>
            <div style={{ fontSize: "2rem", marginBottom: 8 }}>{item.icon}</div>
            <div style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: 4 }}>{item.label}</div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{item.desc}</div>
          </Link>
        ))}
      </div>
    </>
  );
}

export default function Dashboard() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="page-wrap" style={{ textAlign: "center", paddingTop: 80 }}>
        <h1 className="page-title">Dashboard</h1>
        <p style={{ color: "var(--text-secondary)", marginBottom: 24 }}>Please log in to access your dashboard.</p>
        <Link href="/login" className="btn btn-green">Log In</Link>
      </div>
    );
  }

  return (
    <div className="page-wrap">
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>Dashboard</h1>
        <RoleBadge role={user.role} />
      </div>
      <p className="page-subtitle">
        Welcome back, <strong>{user.name}</strong>
        {user.club ? ` — ${user.club}` : ""}
      </p>

      {user.role === "archer" && <ArcherDashboard />}
      {user.role === "coach" && <CoachDashboard />}
      {user.role === "admin" && <AdminDashboard />}
    </div>
  );
}