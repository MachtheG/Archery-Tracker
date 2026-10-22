"use client";
import { useState } from "react";

type Point = { date: string; count: number };

export default function DailyBarChart({ data, color }: { data: Point[]; color: string }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...data.map((d) => d.count));
  const hovered = hover !== null ? data[hover] : null;

  return (
    <div>
      <div style={{ height: 22, marginBottom: 4, fontSize: "0.75rem", color: "var(--text-secondary)", textAlign: "center" }}>
        {hovered
          ? `${new Date(hovered.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })} — ${hovered.count}`
          : " "}
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 100 }}>
        {data.map((d, i) => {
          const heightPct = (d.count / max) * 100;
          return (
            <div
              key={d.date}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              style={{
                flex: 1,
                height: "100%",
                display: "flex",
                alignItems: "flex-end",
                cursor: "default",
              }}
              title={`${d.date}: ${d.count}`}
            >
              <div style={{
                width: "100%",
                maxWidth: 18,
                margin: "0 auto",
                height: d.count === 0 ? 2 : `${Math.max(heightPct, 4)}%`,
                background: color,
                opacity: hover === null || hover === i ? 1 : 0.35,
                borderRadius: "3px 3px 0 0",
                transition: "opacity 0.1s",
              }} />
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: "0.7rem", color: "var(--text-muted)" }}>
        <span>{new Date(data[0]?.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
        <span>{new Date(data[data.length - 1]?.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
      </div>
    </div>
  );
}
