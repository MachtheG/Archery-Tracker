"use client";
import CartIcon from "../components/CartIcon";
import { useCart } from "../contexts/CartContext";

const KENYA_COLORS = {
  black: "#000",
  red: "#d32f2f",
  green: "#006600",
  white: "#fff",
  gold: "#FFD700",
};

export default function NavbarWithCart() {
  const { items } = useCart();
  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);
  return (
    <nav style={{
      background: `linear-gradient(90deg, ${KENYA_COLORS.green} 0%, ${KENYA_COLORS.red} 50%, ${KENYA_COLORS.black} 100%)`,
      padding: '1rem 2rem',
      display: 'flex',
      alignItems: 'center',
      fontWeight: 700,
      fontSize: '1.1rem',
      boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
      borderBottom: `2px solid ${KENYA_COLORS.white}`,
    }}>
      <div style={{ display: 'flex', gap: '1.5rem', flex: 1 }}>
        <a href="/" style={{ color: KENYA_COLORS.white, textDecoration: 'none' }}>Home</a>
        <a href="/community" style={{ color: KENYA_COLORS.white, textDecoration: 'none' }}>Community</a>
        <a href="/store" style={{ color: KENYA_COLORS.white, textDecoration: 'none' }}>Store</a>
        <a href="/resources" style={{ color: KENYA_COLORS.white, textDecoration: 'none' }}>Resources</a>
        <a href="/training-blog" style={{ color: KENYA_COLORS.white, textDecoration: 'none' }}>Training Blog</a>
        <a href="/national-updates" style={{ color: KENYA_COLORS.white, textDecoration: 'none' }}>National Updates</a>
        <a href="/leaderboard" style={{ color: KENYA_COLORS.white, textDecoration: 'none' }}>Leaderboard</a>
      </div>
      <div style={{ marginLeft: 'auto' }}>
        <a href="/cart" style={{ textDecoration: 'none' }}>
          <CartIcon count={cartCount} />
        </a>
      </div>
    </nav>
  );
}
