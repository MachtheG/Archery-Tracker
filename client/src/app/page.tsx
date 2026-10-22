"use client";
import { useAuth } from "./contexts/AuthContext";
import Link from "next/link";

function KenyaShield({ size = 64 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="24" cy="24" rx="16" ry="20" fill="#111" />
      <ellipse cx="24" cy="24" rx="13" ry="17" fill="#BB1600" />
      <ellipse cx="24" cy="24" rx="10" ry="14" fill="#006B3F" />
      <ellipse cx="24" cy="24" rx="7" ry="10" fill="#fff" />
      <line x1="24" y1="4" x2="24" y2="44" stroke="#111" strokeWidth="2" />
      <line x1="18" y1="12" x2="18" y2="36" stroke="#111" strokeWidth="1.5" />
      <line x1="30" y1="12" x2="30" y2="36" stroke="#111" strokeWidth="1.5" />
    </svg>
  );
}

export default function Home() {
  const { user } = useAuth();

  const features = [
    { icon: "🏹", title: "Track Sessions", desc: "Log every training and competition session with detailed stats." },
    { icon: "📊", title: "Leaderboard", desc: "See rankings and top archers from across Kenya." },
    { icon: "🏋️", title: "Training Blog", desc: "Coaches share training routines and tips." },
    { icon: "📰", title: "National Updates", desc: "Stay informed on competitions and national events." },
    { icon: "🛒", title: "Archery Store", desc: "Shop for bows, arrows, and accessories." },
    { icon: "🤝", title: "Community", desc: "Connect with archers across barebow, recurve, and compound." },
  ];

  return (
    <main>
      {/* Hero */}
      <section style={{
        background: "linear-gradient(135deg, #111 0%, #1a3a1a 100%)",
        color: "#fff",
        padding: "80px 24px 60px",
        textAlign: "center",
      }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <KenyaShield size={72} />
          <h1 style={{
            fontSize: "2.4rem",
            fontWeight: 900,
            letterSpacing: "-1px",
            margin: "20px 0 12px",
            lineHeight: 1.1,
          }}>
            Archery Kenya
          </h1>
          <p style={{
            fontSize: "1.1rem",
            color: "rgba(255,255,255,0.75)",
            marginBottom: 32,
            lineHeight: 1.6,
          }}>
            Track your progress. Train with the best. Triumph for Kenya.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            {user ? (
              <Link href="/dashboard" className="btn btn-green" style={{ fontSize: "1rem", padding: "12px 32px" }}>
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link href="/signup" className="btn btn-green" style={{ fontSize: "1rem", padding: "12px 32px" }}>
                  Get Started
                </Link>
                <Link href="/login" className="btn" style={{
                  fontSize: "1rem", padding: "12px 32px",
                  background: "rgba(255,255,255,0.1)",
                  color: "#fff",
                  border: "1px solid rgba(255,255,255,0.25)",
                }}>
                  Log In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Kenyan motto */}
      <div style={{
        textAlign: "center",
        padding: "20px 24px",
        background: "var(--bg-card)",
        borderBottom: "1px solid var(--border-light)",
      }}>
        <span style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--text-secondary)", letterSpacing: "2px" }}>
          🇰🇪 PASSION • PRECISION • PRIDE 🏹
        </span>
      </div>

      {/* Features */}
      <section style={{ maxWidth: 960, margin: "0 auto", padding: "48px 24px" }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 800, textAlign: "center", marginBottom: 32 }}>
          Everything you need
        </h2>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 20,
        }}>
          {features.map(f => (
            <div key={f.title} className="card" style={{ textAlign: "center", padding: "28px 20px" }}>
              <div style={{ fontSize: "2rem", marginBottom: 12 }}>{f.icon}</div>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: 6 }}>{f.title}</h3>
              <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
