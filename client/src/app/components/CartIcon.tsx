"use client";
import { useState } from "react";

export default function CartIcon({ count = 0, onClick }: { count?: number; onClick?: () => void }) {
  return (
    <div style={{ position: "relative", cursor: "pointer", display: "inline-block" }} onClick={onClick}>
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FFD700" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: "middle" }}>
        <circle cx="9" cy="21" r="1" fill="#FFD700" />
        <circle cx="20" cy="21" r="1" fill="#FFD700" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h7.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
      {count > 0 && (
        <span style={{
          position: "absolute",
          top: 0,
          right: 0,
          background: "#d32f2f",
          color: "#fff",
          borderRadius: "50%",
          padding: "0.2em 0.5em",
          fontSize: "0.8em",
          fontWeight: 700,
          minWidth: 18,
          textAlign: "center",
        }}>{count}</span>
      )}
    </div>
  );
}
