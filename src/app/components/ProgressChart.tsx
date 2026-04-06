"use client";

// ===== Line Chart =====
type LineDataPoint = { label: string; value: number };

export function LineChart({
  data,
  width = 600,
  height = 260,
  yLabel = "",
  color = "var(--ke-green)",
}: {
  data: LineDataPoint[];
  width?: number;
  height?: number;
  yLabel?: string;
  color?: string;
}) {
  if (data.length === 0) return <div style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>No data</div>;

  const pad = { top: 20, right: 20, bottom: 44, left: 50 };
  const cw = width - pad.left - pad.right;
  const ch = height - pad.top - pad.bottom;

  const yMax = Math.max(...data.map(d => d.value), 1);
  const yMin = Math.min(...data.map(d => d.value), 0);
  const yRange = yMax - yMin || 1;

  const points = data.map((d, i) => ({
    x: pad.left + (data.length > 1 ? (i / (data.length - 1)) * cw : cw / 2),
    y: pad.top + ch - ((d.value - yMin) / yRange) * ch,
    ...d,
  }));

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  // Y-axis grid
  const yTicks = 5;
  const yGridLines = Array.from({ length: yTicks + 1 }, (_, i) => {
    const val = yMin + (yRange / yTicks) * i;
    const y = pad.top + ch - (i / yTicks) * ch;
    return { val: Math.round(val), y };
  });

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", maxWidth: width }}>
      {/* Grid */}
      {yGridLines.map((g, i) => (
        <g key={i}>
          <line x1={pad.left} y1={g.y} x2={width - pad.right} y2={g.y} stroke="var(--border-light)" strokeWidth="1" />
          <text x={pad.left - 8} y={g.y + 4} textAnchor="end" fontSize="9" fill="var(--text-muted)">{g.val}</text>
        </g>
      ))}

      {/* Y label */}
      {yLabel && (
        <text x={12} y={height / 2} textAnchor="middle" fontSize="9" fill="var(--text-muted)" transform={`rotate(-90, 12, ${height / 2})`}>{yLabel}</text>
      )}

      {/* Area fill */}
      <path
        d={`${pathD} L ${points[points.length - 1].x} ${pad.top + ch} L ${points[0].x} ${pad.top + ch} Z`}
        fill={color}
        opacity="0.08"
      />

      {/* Line */}
      <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

      {/* Points */}
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="4" fill={color} stroke="var(--bg-card)" strokeWidth="2" />
          {/* X-axis label */}
          <text x={p.x} y={height - pad.bottom + 16} textAnchor="middle" fontSize="8" fill="var(--text-muted)" transform={`rotate(-30, ${p.x}, ${height - pad.bottom + 16})`}>
            {p.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

// ===== Bar Chart =====
type BarDataPoint = { label: string; value: number; color?: string };

export function BarChart({
  data,
  width = 500,
  height = 240,
  yLabel = "",
}: {
  data: BarDataPoint[];
  width?: number;
  height?: number;
  yLabel?: string;
}) {
  if (data.length === 0) return <div style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>No data</div>;

  const pad = { top: 16, right: 20, bottom: 44, left: 50 };
  const cw = width - pad.left - pad.right;
  const ch = height - pad.top - pad.bottom;
  const yMax = Math.max(...data.map(d => d.value), 1);
  const barWidth = Math.min(40, (cw / data.length) * 0.6);
  const gap = (cw - barWidth * data.length) / (data.length + 1);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", maxWidth: width }}>
      {/* Y grid */}
      {[0, 0.25, 0.5, 0.75, 1].map((frac, i) => {
        const y = pad.top + ch * (1 - frac);
        return (
          <g key={i}>
            <line x1={pad.left} y1={y} x2={width - pad.right} y2={y} stroke="var(--border-light)" strokeWidth="1" />
            <text x={pad.left - 8} y={y + 4} textAnchor="end" fontSize="9" fill="var(--text-muted)">{Math.round(yMax * frac)}</text>
          </g>
        );
      })}

      {yLabel && (
        <text x={12} y={height / 2} textAnchor="middle" fontSize="9" fill="var(--text-muted)" transform={`rotate(-90, 12, ${height / 2})`}>{yLabel}</text>
      )}

      {/* Bars */}
      {data.map((d, i) => {
        const barH = (d.value / yMax) * ch;
        const x = pad.left + gap + i * (barWidth + gap);
        const y = pad.top + ch - barH;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barWidth} height={barH} rx="3" fill={d.color || "var(--ke-green)"} opacity="0.85" />
            <text x={x + barWidth / 2} y={y - 4} textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--text-primary)">{Math.round(d.value)}</text>
            <text x={x + barWidth / 2} y={height - pad.bottom + 14} textAnchor="middle" fontSize="9" fill="var(--text-muted)">{d.label}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ===== Scatter Plot (for pattern recognition) =====
type ScatterPoint = { x: number; y: number; label?: string };

export function ScatterPlot({
  data,
  width = 500,
  height = 260,
  xLabel = "",
  yLabel = "",
  color = "var(--ke-red)",
}: {
  data: ScatterPoint[];
  width?: number;
  height?: number;
  xLabel?: string;
  yLabel?: string;
  color?: string;
}) {
  if (data.length === 0) return <div style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>No data</div>;

  const pad = { top: 16, right: 20, bottom: 44, left: 50 };
  const cw = width - pad.left - pad.right;
  const ch = height - pad.top - pad.bottom;

  const xMax = Math.max(...data.map(d => d.x), 1);
  const xMin = Math.min(...data.map(d => d.x), 0);
  const yMax = Math.max(...data.map(d => d.y), 1);
  const yMin = Math.min(...data.map(d => d.y), 0);
  const xRange = xMax - xMin || 1;
  const yRange = yMax - yMin || 1;

  const points = data.map(d => ({
    px: pad.left + ((d.x - xMin) / xRange) * cw,
    py: pad.top + ch - ((d.y - yMin) / yRange) * ch,
    ...d,
  }));

  // Simple linear regression for trend line
  const n = data.length;
  const sumX = data.reduce((s, d) => s + d.x, 0);
  const sumY = data.reduce((s, d) => s + d.y, 0);
  const sumXY = data.reduce((s, d) => s + d.x * d.y, 0);
  const sumX2 = data.reduce((s, d) => s + d.x * d.x, 0);
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX || 1);
  const intercept = (sumY - slope * sumX) / n;

  const trendY1 = slope * xMin + intercept;
  const trendY2 = slope * xMax + intercept;
  const trendPx1 = pad.left;
  const trendPy1 = pad.top + ch - ((trendY1 - yMin) / yRange) * ch;
  const trendPx2 = pad.left + cw;
  const trendPy2 = pad.top + ch - ((trendY2 - yMin) / yRange) * ch;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", maxWidth: width }}>
      {/* Grid */}
      {[0, 0.25, 0.5, 0.75, 1].map((frac, i) => {
        const y = pad.top + ch * (1 - frac);
        return <line key={i} x1={pad.left} y1={y} x2={width - pad.right} y2={y} stroke="var(--border-light)" strokeWidth="1" />;
      })}

      {/* Trend line */}
      <line x1={trendPx1} y1={trendPy1} x2={trendPx2} y2={trendPy2} stroke={color} strokeWidth="1.5" strokeDasharray="4 3" opacity="0.5" />

      {/* Points */}
      {points.map((p, i) => (
        <circle key={i} cx={p.px} cy={p.py} r="5" fill={color} opacity="0.7" stroke="var(--bg-card)" strokeWidth="1.5" />
      ))}

      {/* Axis labels */}
      {xLabel && <text x={width / 2} y={height - 4} textAnchor="middle" fontSize="9" fill="var(--text-muted)">{xLabel}</text>}
      {yLabel && <text x={12} y={height / 2} textAnchor="middle" fontSize="9" fill="var(--text-muted)" transform={`rotate(-90, 12, ${height / 2})`}>{yLabel}</text>}
    </svg>
  );
}
