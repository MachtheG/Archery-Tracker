export default function TermsOfService() {
  return (
    <div className="page-wrap" style={{ maxWidth: 760 }}>
      <h1 className="page-title">Terms of Service</h1>
      <p className="page-subtitle">Last updated {new Date().toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" })}</p>

      <div className="card" style={{ lineHeight: 1.7, fontSize: "0.92rem" }}>
        <p>
          By creating an account on Archery Kenya, you agree to these terms. Please read them alongside our{" "}
          <a href="/privacy-policy" style={{ color: "var(--ke-green)", fontWeight: 600 }}>Privacy Policy</a>.
        </p>

        <h2 style={{ fontSize: "1.05rem", fontWeight: 700, marginTop: 24, marginBottom: 10 }}>Your account</h2>
        <ul style={{ paddingLeft: 20, display: "flex", flexDirection: "column", gap: 6 }}>
          <li>You must provide accurate information when signing up and keep your password secure.</li>
          <li>You are responsible for activity under your account. Enable two-factor authentication for extra protection.</li>
          <li>Admin accounts are only granted by an existing administrator — self-registration as admin is not possible.</li>
        </ul>

        <h2 style={{ fontSize: "1.05rem", fontWeight: 700, marginTop: 24, marginBottom: 10 }}>Leaderboards</h2>
        <ul style={{ paddingLeft: 20, display: "flex", flexDirection: "column", gap: 6 }}>
          <li>The monthly leaderboard is computed automatically from scoring sessions you log yourself.</li>
          <li>The Competition Results page holds official results from real events, posted by coaches/admins — report any error to an admin so it can be corrected.</li>
          <li>You can make your training scores private at any time; this does not affect posted competition results.</li>
        </ul>

        <h2 style={{ fontSize: "1.05rem", fontWeight: 700, marginTop: 24, marginBottom: 10 }}>Marketplace</h2>
        <ul style={{ paddingLeft: 20, display: "flex", flexDirection: "column", gap: 6 }}>
          <li>Archery Kenya does not process payments and is not a party to any sale. Buyers and sellers arrange payment and delivery directly between themselves.</li>
          <li>Listings must accurately describe the item. Misleading listings may be removed.</li>
          <li>We are not responsible for the condition, delivery, or payment of items sold through the marketplace.</li>
        </ul>

        <h2 style={{ fontSize: "1.05rem", fontWeight: 700, marginTop: 24, marginBottom: 10 }}>Acceptable use</h2>
        <p>You agree not to:</p>
        <ul style={{ paddingLeft: 20, display: "flex", flexDirection: "column", gap: 6 }}>
          <li>Attempt to access another user&apos;s account or data.</li>
          <li>Post false competition results or falsify scores.</li>
          <li>Use the platform for anything unlawful, abusive, or fraudulent.</li>
        </ul>

        <h2 style={{ fontSize: "1.05rem", fontWeight: 700, marginTop: 24, marginBottom: 10 }}>Account deletion</h2>
        <p>
          You may delete your account at any time from Account Settings. This permanently removes your profile and
          the content you created (sessions, equipment, marketplace listings). Posted competition results remain as
          part of the historical event record, as they document a real-world event rather than personal account data.
        </p>

        <h2 style={{ fontSize: "1.05rem", fontWeight: 700, marginTop: 24, marginBottom: 10 }}>Changes</h2>
        <p>
          We may update these terms as the service evolves. Continued use of Archery Kenya after a change means you
          accept the updated terms.
        </p>
      </div>
    </div>
  );
}
