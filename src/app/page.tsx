import Image from "next/image";
//import styles from "./page.module.css";

import React from "react";
//import Image from "next/image";
import styles from "./page.module.css";

const KENYA_COLORS = {
  black: "#000",
  red: "#d32f2f",
  green: "#006600",
  white: "#fff",
  gold: "#FFD700",
};

function ArcheryLogo({ size = 80 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="22" stroke={KENYA_COLORS.black} strokeWidth="2" fill={KENYA_COLORS.white}/>
      <circle cx="24" cy="24" r="14" stroke={KENYA_COLORS.green} strokeWidth="3" fill={KENYA_COLORS.white}/>
      <circle cx="24" cy="24" r="7" stroke={KENYA_COLORS.red} strokeWidth="3" fill={KENYA_COLORS.white}/>
      <line x1="24" y1="2" x2="24" y2="46" stroke={KENYA_COLORS.black} strokeWidth="2"/>
      <polygon points="24,2 21,8 27,8" fill={KENYA_COLORS.black}/>
    </svg>
  );
}

export default function Home() {
  return (
    <main style={{
      minHeight: "100vh",
      background: `linear-gradient(135deg, ${KENYA_COLORS.green} 0%, ${KENYA_COLORS.white} 100%)`,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    }}>
      <header style={{
        display: "flex",
        alignItems: "center",
        gap: "1.5rem",
        background: `linear-gradient(90deg, ${KENYA_COLORS.black} 0%, ${KENYA_COLORS.red} 50%, ${KENYA_COLORS.green} 100%)`,
        color: KENYA_COLORS.white,
        padding: "1.5rem 2rem",
        borderRadius: 16,
        marginBottom: 32,
        boxShadow: "0 4px 24px #0002"
      }}>
        <ArcheryLogo size={64} />
        <span style={{ fontWeight: 900, fontSize: "2.2rem", letterSpacing: 2, textShadow: "1px 1px 2px #0008" }}>
          Archery Kenya
        </span>
      </header>
      <h1 style={{ fontSize: "2.5rem", fontWeight: 800, marginBottom: "1rem", color: KENYA_COLORS.black }}>
        Karibu Archery Kenya!
      </h1>
      <p style={{ fontSize: "1.2rem", maxWidth: 600, margin: "0 auto 2rem auto", color: KENYA_COLORS.black }}>
        Welcome to the home of Kenyan archery. Track your progress, connect with the community, shop for gear, and stay updated on all things archery in Kenya.
      </p>
      <div style={{ fontSize: "1.1rem", fontWeight: 500, color: KENYA_COLORS.red, marginBottom: 24 }}>
        <span role="img" aria-label="flag">🇰🇪</span> Passion. Precision. Pride. <span role="img" aria-label="bow">🏹</span>
      </div>
      <div style={{ margin: '2rem 0' }}>
        <a href="/login" style={{
          background: KENYA_COLORS.red,
          color: KENYA_COLORS.white,
          padding: '0.8rem 2rem',
          borderRadius: 8,
          fontWeight: 700,
          fontSize: '1.1rem',
          textDecoration: 'none',
          boxShadow: '0 2px 8px #0002',
        }}>
          Log In to Track Scores
        </a>
      </div>
      <footer style={{ marginTop: 48, color: KENYA_COLORS.green, fontWeight: 600 }}>
        &copy; {new Date().getFullYear()} Archery Kenya
      </footer>
    </main>
  );
}
