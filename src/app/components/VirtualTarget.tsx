"use client";
import { useRef, useCallback } from "react";
import { RING_COLORS } from "../lib/rounds";
import type { ArrowScore } from "../lib/storage";

const CENTER = 200;
const MAX_RADIUS = 180;
const RING_WIDTH = MAX_RADIUS / 10;

type Props = {
  arrows: ArrowScore[];
  onArrowPlaced?: (arrow: ArrowScore) => void;
  disabled?: boolean;
  size?: number;
};

export default function VirtualTarget({ arrows, onArrowPlaced, disabled = false, size }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);

  const handleClick = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (disabled || !onArrowPlaced) return;
      const svg = svgRef.current;
      if (!svg) return;

      const rect = svg.getBoundingClientRect();
      const scaleX = 400 / rect.width;
      const scaleY = 400 / rect.height;
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;

      const dist = Math.sqrt((x - CENTER) ** 2 + (y - CENTER) ** 2);

      let value: number;
      let isX = false;

      if (dist > MAX_RADIUS) {
        value = 0; // Miss
      } else if (dist <= RING_WIDTH * 0.5) {
        value = 10;
        isX = true;
      } else {
        const ringFromCenter = Math.ceil(dist / RING_WIDTH);
        value = Math.max(1, 11 - ringFromCenter);
      }

      onArrowPlaced({ value, isX, position: { x, y } });
    },
    [disabled, onArrowPlaced]
  );

  // Draw rings from outside in
  const rings = [...RING_COLORS].reverse(); // ring 1 (outside) first

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
      <rect width="400" height="400" fill="#e8e5e0" rx="8" />

      {/* Rings from outside to inside */}
      {rings.map((rc, i) => {
        const radius = MAX_RADIUS - i * RING_WIDTH;
        return (
          <circle
            key={rc.ring}
            cx={CENTER}
            cy={CENTER}
            r={radius}
            fill={rc.fill}
            stroke={rc.stroke}
            strokeWidth="0.5"
          />
        );
      })}

      {/* X ring marker */}
      <circle cx={CENTER} cy={CENTER} r={RING_WIDTH * 0.5} fill="none" stroke="#b8960e" strokeWidth="1" />

      {/* Cross lines */}
      <line x1={CENTER} y1={CENTER - MAX_RADIUS} x2={CENTER} y2={CENTER + MAX_RADIUS} stroke="rgba(0,0,0,0.12)" strokeWidth="0.5" />
      <line x1={CENTER - MAX_RADIUS} y1={CENTER} x2={CENTER + MAX_RADIUS} y2={CENTER} stroke="rgba(0,0,0,0.12)" strokeWidth="0.5" />

      {/* Arrow markers */}
      {arrows.map((arrow, i) => {
        if (!arrow.position) return null;
        return (
          <g key={i}>
            <circle cx={arrow.position.x} cy={arrow.position.y} r="6" fill="rgba(0,0,0,0.8)" stroke="#fff" strokeWidth="1.5" />
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
        <text x={CENTER} y={390} textAnchor="middle" fontSize="10" fill="#999" style={{ pointerEvents: "none" }}>
          Click to place arrow
        </text>
      )}
    </svg>
  );
}
