export default function PrivacyPolicy() {
  return (
    <div className="page-wrap" style={{ maxWidth: 760 }}>
      <h1 className="page-title">Privacy Policy</h1>
      <p className="page-subtitle">Last updated {new Date().toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" })}</p>

      <div className="card" style={{ lineHeight: 1.7, fontSize: "0.92rem" }}>
        <p>
          Archery Kenya ("we", "us") is committed to protecting your personal data in line with Kenya&apos;s{" "}
          <strong>Data Protection Act, 2019</strong>. This policy explains what we collect, why, and the rights you
          have over it.
        </p>

        <h2 style={{ fontSize: "1.05rem", fontWeight: 700, marginTop: 24, marginBottom: 10 }}>What we collect</h2>
        <ul style={{ paddingLeft: 20, display: "flex", flexDirection: "column", gap: 6 }}>
          <li><strong>Account information:</strong> name, email address, password (stored as a one-way hash, never in plain text), club and category.</li>
          <li><strong>Performance data:</strong> scoring sessions, arrow-by-arrow results, equipment and tuning logs you enter.</li>
          <li><strong>Marketplace data:</strong> listings you post, including contact details you choose to share with buyers/sellers.</li>
          <li><strong>Usage data:</strong> basic technical logs (e.g. login timestamps) needed to keep the service secure and working.</li>
        </ul>

        <h2 style={{ fontSize: "1.05rem", fontWeight: 700, marginTop: 24, marginBottom: 10 }}>Why we collect it</h2>
        <ul style={{ paddingLeft: 20, display: "flex", flexDirection: "column", gap: 6 }}>
          <li>To provide the core service: tracking your scores, equipment, and training history.</li>
          <li>To operate the public leaderboard and competition results — <strong>only for archers who have opted in</strong>; you can make your scores private at any time in Account Settings.</li>
          <li>To operate the marketplace, including sending reservation/order emails between buyers and sellers.</li>
          <li>To secure your account (email verification, password reset, optional two-factor authentication).</li>
        </ul>

        <h2 style={{ fontSize: "1.05rem", fontWeight: 700, marginTop: 24, marginBottom: 10 }}>Who we share it with</h2>
        <p>
          We do not sell your data. Marketplace contact details are shared only with the specific buyer or seller
          involved in a transaction. We use third-party processors only to run the service itself — for example an
          email delivery provider to send verification, password reset, and transactional emails.
        </p>

        <h2 style={{ fontSize: "1.05rem", fontWeight: 700, marginTop: 24, marginBottom: 10 }}>How long we keep it</h2>
        <p>
          We retain your account and performance data for as long as your account is active. If you delete your
          account, your personal data and the content you created (sessions, equipment, listings) are permanently
          removed from our systems.
        </p>

        <h2 style={{ fontSize: "1.05rem", fontWeight: 700, marginTop: 24, marginBottom: 10 }}>Your rights</h2>
        <p>Under the Data Protection Act, 2019, and built directly into your Account Settings page, you can:</p>
        <ul style={{ paddingLeft: 20, display: "flex", flexDirection: "column", gap: 6 }}>
          <li><strong>Access</strong> your data — export a copy of everything we hold about you at any time.</li>
          <li><strong>Correct</strong> your data — update your profile, equipment, and session notes yourself.</li>
          <li><strong>Erase</strong> your data — permanently delete your account and associated content.</li>
          <li><strong>Object</strong> to processing — opt out of the public leaderboard at any time.</li>
        </ul>

        <h2 style={{ fontSize: "1.05rem", fontWeight: 700, marginTop: 24, marginBottom: 10 }}>Security</h2>
        <p>
          Passwords are hashed, not stored in plain text. We use rate limiting and optional email-based two-factor
          authentication to protect accounts, and encrypted connections in production. No system is perfectly
          secure, but we take reasonable technical measures to protect your data.
        </p>

        <h2 style={{ fontSize: "1.05rem", fontWeight: 700, marginTop: 24, marginBottom: 10 }}>Contact</h2>
        <p>
          Questions about this policy or your data can be directed to the Kenya Archery Association administrators
          through the contact details on this site.
        </p>
      </div>
    </div>
  );
}
