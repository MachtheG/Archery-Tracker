"use client";
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getSessions, computeSessionStats } from "../lib/storage";
import type { ScoreSession } from "../lib/storage";
import { LineChart, BarChart, ScatterPlot } from "../components/ProgressChart";
import { getWindDirectionLabel } from "../lib/weather";
import Link from "next/link";

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<ScoreSession[]>([]);
  const [selectedDistance, setSelectedDistance] = useState<number | "all">("all");

  useEffect(() => {
    setSessions(getSessions());
  }, []);

  if (!user) {
    return (
      <div className="page-wrap" style={{ textAlign: "center", paddingTop: 80 }}>
        <h1 className="page-title">Analytics</h1>
        <p style={{ color: "var(--text-secondary)", marginBottom: 24 }}>Please log in to view your analytics.</p>
        <Link href="/login" className="btn btn-green">Log In</Link>
      </div>
    );
  }

  const filtered = selectedDistance === "all"
    ? sessions
    : sessions.filter(s => s.distance === selectedDistance);

  const distances = [...new Set(sessions.map(s => s.distance))].sort((a, b) => a - b);

  // ── Score over time (line chart) ──
  const timeData = [...filtered]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-20)
    .map(s => {
      const { percentage } = computeSessionStats(s);
      return { label: s.date.slice(5), value: parseFloat(percentage.toFixed(1)) };
    });

  // ── Average by distance (bar chart) ──
  const distAvg = distances.map(d => {
    const distSessions = sessions.filter(s => s.distance === d);
    const avgPct = distSessions.reduce((sum, s) => sum + computeSessionStats(s).percentage, 0) / distSessions.length;
    return { label: `${d}m`, value: parseFloat(avgPct.toFixed(1)), color: d >= 70 ? "var(--ke-red)" : d >= 50 ? "var(--ke-gold)" : "var(--ke-green)" };
  });

  // ── Wind vs Score (scatter) ──
  const windData = sessions
    .filter(s => s.weather.windSpeed !== undefined)
    .map(s => ({
      x: s.weather.windSpeed || 0,
      y: computeSessionStats(s).percentage,
    }));

  // ── Monthly totals ──
  const monthlyMap = new Map<string, { totalPct: number; count: number; arrows: number }>();
  sessions.forEach(s => {
    const month = s.date.slice(0, 7);
    const { percentage, totalArrows } = computeSessionStats(s);
    const existing = monthlyMap.get(month) || { totalPct: 0, count: 0, arrows: 0 };
    monthlyMap.set(month, { totalPct: existing.totalPct + percentage, count: existing.count + 1, arrows: existing.arrows + totalArrows });
  });
  const monthlyData = [...monthlyMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12)
    .map(([month, data]) => ({
      label: month.slice(2), // YY-MM
      value: parseFloat((data.totalPct / data.count).toFixed(1)),
    }));

  // ── Summary stats ──
  const totalSessions = sessions.length;
  const totalArrows = sessions.reduce((s, sess) => s + computeSessionStats(sess).totalArrows, 0);
  const avgPct = sessions.length > 0
    ? (sessions.reduce((s, sess) => s + computeSessionStats(sess).percentage, 0) / sessions.length).toFixed(1)
    : "0";
  const bestSession = sessions.length > 0
    ? sessions.reduce((best, s) => computeSessionStats(s).percentage > computeSessionStats(best).percentage ? s : best, sessions[0])
    : null;

  // ── Wind pattern analysis ──
  const windBuckets: Record<string, { total: number; count: number }> = {
    "Calm (0-5)": { total: 0, count: 0 },
    "Light (5-10)": { total: 0, count: 0 },
    "Moderate (10-20)": { total: 0, count: 0 },
    "Strong (20+)": { total: 0, count: 0 },
  };
  sessions.forEach(s => {
    if (s.weather.windSpeed === undefined) return;
    const ws = s.weather.windSpeed;
    const bucket = ws <= 5 ? "Calm (0-5)" : ws <= 10 ? "Light (5-10)" : ws <= 20 ? "Moderate (10-20)" : "Strong (20+)";
    windBuckets[bucket].total += computeSessionStats(s).percentage;
    windBuckets[bucket].count += 1;
  });

  return (
    <div className="page-wrap" id="analytics-report">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 className="page-title">Progress Analytics</h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>Performance trends and pattern recognition</p>
        </div>
        <button onClick={() => window.print()} className="btn btn-dark" style={{ fontSize: "0.85rem" }}>📄 Export PDF</button>
      </div>

      {/* Distance filter */}
      <div style={{ display: "flex", gap: 6, marginTop: 20, marginBottom: 28, flexWrap: "wrap" }}>
        <button onClick={() => setSelectedDistance("all")} className="btn" style={{
          fontSize: "0.8rem", padding: "5px 12px",
          background: selectedDistance === "all" ? "var(--ke-black)" : "var(--bg-card)",
          color: selectedDistance === "all" ? "var(--ke-white)" : "var(--text-secondary)",
          border: `1px solid ${selectedDistance === "all" ? "var(--ke-black)" : "var(--border-light)"}`,
        }}>All</button>
        {distances.map(d => (
          <button key={d} onClick={() => setSelectedDistance(d)} className="btn" style={{
            fontSize: "0.8rem", padding: "5px 12px",
            background: selectedDistance === d ? "var(--ke-black)" : "var(--bg-card)",
            color: selectedDistance === d ? "var(--ke-white)" : "var(--text-secondary)",
            border: `1px solid ${selectedDistance === d ? "var(--ke-black)" : "var(--border-light)"}`,
          }}>{d}m</button>
        ))}
      </div>

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 14, marginBottom: 32 }}>
        <div className="card" style={{ textAlign: "center", padding: "16px 12px" }}>
          <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--ke-green)" }}>{totalSessions}</div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Sessions</div>
        </div>
        <div className="card" style={{ textAlign: "center", padding: "16px 12px" }}>
          <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--ke-red)" }}>{totalArrows.toLocaleString()}</div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Arrows Shot</div>
        </div>
        <div className="card" style={{ textAlign: "center", padding: "16px 12px" }}>
          <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--ke-gold)" }}>{avgPct}%</div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Avg Score %</div>
        </div>
        {bestSession && (
          <div className="card" style={{ textAlign: "center", padding: "16px 12px" }}>
            <div style={{ fontSize: "1.6rem", fontWeight: 800 }}>{computeSessionStats(bestSession).percentage.toFixed(1)}%</div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Best Session</div>
          </div>
        )}
      </div>

      {/* Score over time */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: 16 }}>Score Trend (% of Maximum)</h2>
        <LineChart data={timeData} yLabel="Score %" color="var(--ke-green)" />
      </div>

      {/* Average by distance */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: 16 }}>Average by Distance</h2>
        <BarChart data={distAvg} yLabel="Avg %" />
      </div>

      {/* Pattern Recognition: Wind vs Score */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: 8 }}>🌬️ Pattern Recognition — Wind vs Score</h2>
        <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: 16 }}>
          How wind speed affects your performance. The dashed line shows the trend.
        </p>
        <ScatterPlot data={windData} xLabel="Wind Speed (km/h)" yLabel="Score %" color="var(--ke-red)" />

        {/* Wind bucket analysis */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10, marginTop: 16 }}>
          {Object.entries(windBuckets).map(([bucket, data]) => (
            <div key={bucket} style={{ textAlign: "center", padding: 10, background: "var(--bg-primary)", borderRadius: "var(--radius-sm)" }}>
              <div style={{ fontSize: "1.1rem", fontWeight: 800, color: data.count > 0 ? "var(--text-primary)" : "var(--text-muted)" }}>
                {data.count > 0 ? `${(data.total / data.count).toFixed(1)}%` : "—"}
              </div>
              <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{bucket}</div>
              <div style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>{data.count} sessions</div>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly progress */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: 16 }}>Monthly Progress</h2>
        <LineChart data={monthlyData} yLabel="Avg %" color="var(--ke-gold)" />
      </div>

      {/* Recent sessions */}
      <div className="card" style={{ padding: 0, overflow: "auto" }}>
        <h2 style={{ fontSize: "1.05rem", fontWeight: 700, padding: "16px 20px 8px" }}>Recent Sessions</h2>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
          <thead>
            <tr style={{ background: "var(--ke-black)", color: "var(--ke-white)" }}>
              <th style={{ padding: "10px 16px", textAlign: "left" }}>Date</th>
              <th style={{ padding: "10px 12px" }}>Round</th>
              <th style={{ padding: "10px 12px" }}>Score</th>
              <th style={{ padding: "10px 12px" }}>%</th>
              <th style={{ padding: "10px 12px" }}>X</th>
              <th style={{ padding: "10px 12px" }}>Wind</th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 15).map(s => {
              const stats = computeSessionStats(s);
              return (
                <tr key={s.id} style={{ borderBottom: "1px solid var(--border-light)" }}>
                  <td style={{ padding: "10px 16px" }}>{s.date}</td>
                  <td style={{ padding: "10px 12px", textAlign: "center" }}>{s.roundName}</td>
                  <td style={{ padding: "10px 12px", textAlign: "center", fontWeight: 700 }}>{s.totalScore}/{stats.maxScore}</td>
                  <td style={{ padding: "10px 12px", textAlign: "center", color: "var(--ke-green)", fontWeight: 700 }}>{stats.percentage.toFixed(1)}%</td>
                  <td style={{ padding: "10px 12px", textAlign: "center" }}>{s.xCount}</td>
                  <td style={{ padding: "10px 12px", textAlign: "center", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    {s.weather.windSpeed !== undefined ? `${s.weather.windSpeed} km/h ${s.weather.windDirection !== undefined ? getWindDirectionLabel(s.weather.windDirection) : ""}` : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
