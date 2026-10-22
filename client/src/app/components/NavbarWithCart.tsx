"use client";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import Link from "next/link";

export default function NavbarWithCart() {
  const { user, logout } = useAuth();
  const { items } = useCart();
  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/score-session", label: "Score" },
    { href: "/analytics", label: "Analytics" },
    { href: "/equipment", label: "Equipment" },
    { href: "/leaderboard", label: "Leaderboard" },
    { href: "/competitions", label: "Competitions" },
    { href: "/community", label: "Community" },
    { href: "/training-blog", label: "Blog" },
    { href: "/national-updates", label: "Updates" },
    { href: "/store", label: "Store" },
  ];

  return (
    <nav style={{
      background: "var(--ke-black)",
      height: "var(--nav-height)",
      display: "flex",
      alignItems: "center",
      padding: "0 24px",
      position: "sticky",
      top: 0,
      zIndex: 100,
    }}>
      {/* Logo */}
      <Link href="/" style={{
        color: "var(--ke-white)",
        fontWeight: 800,
        fontSize: "1.05rem",
        letterSpacing: "-0.5px",
        marginRight: 24,
        whiteSpace: "nowrap",
      }}>
        🏹 Archery KE
      </Link>

      {/* Links */}
      <div style={{
        display: "flex",
        gap: 2,
        flex: 1,
        overflowX: "auto",
      }}>
        {navLinks.map(link => (
          <Link key={link.href} href={link.href} style={{
            color: "rgba(255,255,255,0.7)",
            fontSize: "0.82rem",
            fontWeight: 500,
            padding: "5px 8px",
            borderRadius: "var(--radius-sm)",
            whiteSpace: "nowrap",
            transition: "color 0.15s",
          }}>
            {link.label}
          </Link>
        ))}
      </div>

      {/* Right */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginLeft: 12 }}>
        <Link href="/cart" style={{ color: "var(--ke-gold)", position: "relative", display: "flex", alignItems: "center" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h7.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
          {cartCount > 0 && (
            <span style={{
              position: "absolute", top: -6, right: -8,
              background: "var(--ke-red)", color: "#fff", borderRadius: "50%",
              width: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "0.6rem", fontWeight: 700,
            }}>{cartCount}</span>
          )}
        </Link>

        {user ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Link href="/dashboard" style={{
              color: "var(--ke-white)", fontSize: "0.8rem", fontWeight: 600,
              padding: "5px 10px", background: "var(--ke-green)", borderRadius: "var(--radius-sm)",
            }}>
              Dashboard
            </Link>
            <Link href="/account" style={{
              color: "rgba(255,255,255,0.6)", fontSize: "0.75rem", fontWeight: 600,
              padding: "4px 8px", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "var(--radius-sm)",
            }}>
              Account
            </Link>
            <button onClick={logout} style={{
              background: "none", border: "1px solid rgba(255,255,255,0.2)",
              color: "rgba(255,255,255,0.6)", fontSize: "0.75rem", padding: "4px 8px",
              borderRadius: "var(--radius-sm)", cursor: "pointer", fontFamily: "inherit",
            }}>
              Logout
            </button>
          </div>
        ) : (
          <Link href="/login" style={{
            color: "var(--ke-white)", fontSize: "0.8rem", fontWeight: 600,
            padding: "5px 12px", background: "var(--ke-green)", borderRadius: "var(--radius-sm)",
          }}>
            Log In
          </Link>
        )}
      </div>
    </nav>
  );
}
