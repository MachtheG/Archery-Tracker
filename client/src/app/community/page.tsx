const articles = [
  // Compound
  { type: 'Compound', title: 'Getting Started with Compound Bows', snippet: 'Learn the basics of compound archery, from bow setup to your first shot.' },
  { type: 'Compound', title: 'Tuning Your Compound Bow', snippet: 'A guide to tuning your compound bow for maximum accuracy and consistency.' },
  { type: 'Compound', title: 'Compound Bow Maintenance Tips', snippet: 'Keep your compound bow in top shape with these essential maintenance tips.' },
  { type: 'Compound', title: 'Choosing Arrows for Compound Archery', snippet: 'How to select the right arrows for your compound bow and shooting style.' },
  { type: 'Compound', title: 'Advanced Compound Bow Sights', snippet: 'Explore the latest in compound bow sight technology and how to use them.' },
  // Barebow
  { type: 'Barebow', title: 'Introduction to Barebow Archery', snippet: "Discover the fundamentals of barebow archery and why it's growing in popularity." },
  { type: 'Barebow', title: 'Barebow Form and Technique', snippet: 'Master the form and technique unique to barebow archery.' },
  { type: 'Barebow', title: 'Stringwalking Explained', snippet: "A beginner's guide to stringwalking for barebow archers." },
  { type: 'Barebow', title: 'Barebow Equipment Choices', snippet: 'What to look for when choosing barebow equipment.' },
  { type: 'Barebow', title: 'Mental Game in Barebow', snippet: 'How to develop the mental toughness needed for barebow competition.' },
  // Recurve
  { type: 'Recurve', title: 'Recurve Archery for Beginners', snippet: 'Start your recurve journey with these essential tips.' },
  { type: 'Recurve', title: 'Setting Up a Recurve Bow', snippet: 'Step-by-step guide to setting up your recurve bow.' },
  { type: 'Recurve', title: 'Recurve Tuning and Maintenance', snippet: 'Keep your recurve bow shooting straight with these tuning tips.' },
  { type: 'Recurve', title: 'Competition Preparation for Recurve Archers', snippet: 'How to prepare for your first recurve competition.' },
  { type: 'Recurve', title: 'Recurve Archery Drills', snippet: 'Effective drills to improve your recurve archery skills.' },
];

const TYPE_COLORS: Record<string, string> = {
  Compound: "var(--ke-red)",
  Barebow: "var(--ke-green)",
  Recurve: "var(--ke-gold)",
};

export default function Community() {
  return (
    <div className="page-wrap">
      <h1 className="page-title">Community Articles</h1>
      <p className="page-subtitle">Knowledge base for compound, barebow, and recurve archers</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
        {['Compound', 'Barebow', 'Recurve'].map((type) => (
          <section key={type}>
            <h2 style={{
              fontSize: "1.15rem",
              fontWeight: 800,
              color: TYPE_COLORS[type],
              marginBottom: 14,
              paddingBottom: 8,
              borderBottom: `2px solid var(--border-light)`,
            }}>
              {type} Archery
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
              {articles.filter(a => a.type === type).map((a) => (
                <div key={a.title} className="card" style={{ padding: "18px 20px" }}>
                  <h3 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: 6, color: "var(--text-primary)" }}>{a.title}</h3>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>{a.snippet}</p>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}