"use client";
import { useRef, useCallback } from "react";
import { getTargetFace } from "../lib/rounds";
import type { ArrowScore } from "../lib/storage";

const CENTER = 200;
const MAX_RADIUS = 180;

type Props = {
  arrows: ArrowScore[];
  onArrowPlaced?: (arrow: ArrowScore) => void;
  disabled?: boolean;
  size?: number;
  targetFaceType?: string;
};

export default function VirtualTarget({
  arrows,
  onArrowPlaced,
  disabled = false,
  size,
  targetFaceType = "standard-10",
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const face = getTargetFace(targetFaceType);
  const ringCount = face.rings.length;
  const ringWidth = MAX_RADIUS / ringCount;
  const xRingRadius = face.hasXRing ? ringWidth * face.xRingFraction : 0;

  const getScoreFromDist = useCallback(
    (dist: number): { value: number; isX: boolean } => {
      if (dist > MAX_RADIUS) return { value: face.missScore, isX: false };

      // X-ring check
      if (face.hasXRing && dist <= xRingRadius) {
        return { value: face.maxArrowScore, isX: true };
      }

      // Which ring? ringIndex 0 = innermost, ringCount-1 = outermost
      const ringFromCenter = Math.ceil(dist / ringWidth);
      const idx = ringCount - ringFromCenter; // map to rings array (outside-first)
      if (idx < 0) return { value: face.missScore, isX: false };
      const ring = face.rings[Math.min(idx, ringCount - 1)];
      return { value: ring.score, isX: false };
    },
    [face, ringCount, ringWidth, xRingRadius]
  );

  const handleClick = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (disabled || !onArrowPlaced) return;
      const svg = svgRef.current;
      if (!svg) return;

      const rect = svg.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 400;
      const y = ((e.clientY - rect.top) / rect.height) * 400;
      const dist = Math.sqrt((x - CENTER) ** 2 + (y - CENTER) ** 2);

      const { value, isX } = getScoreFromDist(dist);
      onArrowPlaced({ value, isX, position: { x, y } });
    },
    [disabled, onArrowPlaced, getScoreFromDist]
  );

  // Draw rings from outermost to innermost
  const ringsReversed = [...face.rings].reverse(); // outermost first for SVG layering

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 400 400"
      onClick={handleClick}
      style={{
        width: size || "100%",
        maxWidth: 380,
        cursor: disabled ? "default" : "crosshair",
        borderRadius: 8,
      }}
    >
      {/* Background */}
      <rect width="400" height="400" fill={face.bgFill} rx="8" />

      {/* Rings from outermost to innermost */}
      {ringsReversed.map((ring, i) => {
        // outermost ring i=0 has radius MAX_RADIUS, innermost i=ringCount-1 has radius ringWidth
        const radius = MAX_RADIUS - i * ringWidth;
        return (
          <circle
            key={`ring-${i}`}
            cx={CENTER}
            cy={CENTER}
            r={radius}
            fill={ring.fill}
            stroke={ring.stroke}
            strokeWidth="0.8"
          />
        );
      })}

      {/* Ring divider lines (thin separators between same-color rings) */}
      {ringsReversed.map((_, i) => {
        if (i === 0) return null;
        const radius = MAX_RADIUS - i * ringWidth;
        return (
          <circle
            key={`div-${i}`}
            cx={CENTER}
            cy={CENTER}
            r={radius}
            fill="none"
            stroke="rgba(0,0,0,0.15)"
            strokeWidth="0.4"
          />
        );
      })}

      {/* X ring marker */}
      {face.hasXRing && (
        <circle
          cx={CENTER}
          cy={CENTER}
          r={xRingRadius}
          fill="none"
          stroke={face.rings[face.rings.length - 1].stroke}
          strokeWidth="1"
        />
      )}

      {/* Cross lines */}
      <line
        x1={CENTER}
        y1={CENTER - MAX_RADIUS}
        x2={CENTER}
        y2={CENTER + MAX_RADIUS}
        stroke="rgba(0,0,0,0.08)"
        strokeWidth="0.5"
      />
      <line
        x1={CENTER - MAX_RADIUS}
        y1={CENTER}
        x2={CENTER + MAX_RADIUS}
        y2={CENTER}
        stroke="rgba(0,0,0,0.08)"
        strokeWidth="0.5"
      />

      {/* Arrow markers */}
      {arrows.map((arrow, i) => {
        if (!arrow.position) return null;
        return (
          <g key={i}>
            <circle
              cx={arrow.position.x}
              cy={arrow.position.y}
              r="6"
              fill="rgba(0,0,0,0.85)"
              stroke="#fff"
              strokeWidth="1.5"
            />
            <text
              x={arrow.position.x}
              y={arrow.position.y + 0.5}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="7"
              fill="#fff"
              fontWeight="700"
              style={{ pointerEvents: "none" }}
            >
              {arrow.isX ? "X" : arrow.value === 0 ? "M" : arrow.value}
            </text>
          </g>
        );
      })}

      {/* Label */}
      {!disabled && (
        <text
          x={CENTER}
          y={390}
          textAnchor="middle"
          fontSize="10"
          fill="#999"
          style={{ pointerEvents: "none" }}
        >
          Click to place arrow
        </text>
      )}

      {/* Target name badge */}
      <text
        x={CENTER}
        y={16}
        textAnchor="middle"
        fontSize="9"
        fill="rgba(0,0,0,0.35)"
        fontWeight="600"
        style={{ pointerEvents: "none" }}
      >
        {face.name}
      </text>
    </svg>
  );
}
