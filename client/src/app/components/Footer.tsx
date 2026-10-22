import Link from "next/link";

export default function Footer() {
  return (
    <footer style={{
      textAlign: "center",
      padding: "32px 24px",
      borderTop: "1px solid var(--border-light)",
      color: "var(--text-muted)",
      fontSize: "0.85rem",
    }}>
      <div style={{ marginBottom: 8, display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
        <Link href="/privacy-policy" style={{ color: "var(--text-secondary)" }}>Privacy Policy</Link>
        <Link href="/terms-of-service" style={{ color: "var(--text-secondary)" }}>Terms of Service</Link>
      </div>
      © {new Date().getFullYear()} Archery Kenya — Harambee!
    </footer>
  );
}
