
const articles = [
  // Compound
  { type: 'Compound', title: 'Getting Started with Compound Bows', snippet: 'Learn the basics of compound archery, from bow setup to your first shot.', url: '#' },
  { type: 'Compound', title: 'Tuning Your Compound Bow', snippet: 'A guide to tuning your compound bow for maximum accuracy and consistency.', url: '#' },
  { type: 'Compound', title: 'Compound Bow Maintenance Tips', snippet: 'Keep your compound bow in top shape with these essential maintenance tips.', url: '#' },
  { type: 'Compound', title: 'Choosing Arrows for Compound Archery', snippet: 'How to select the right arrows for your compound bow and shooting style.', url: '#' },
  { type: 'Compound', title: 'Advanced Compound Bow Sights', snippet: 'Explore the latest in compound bow sight technology and how to use them.', url: '#' },
  // Barebow
  { type: 'Barebow', title: 'Introduction to Barebow Archery', snippet: 'Discover the fundamentals of barebow archery and why it’s growing in popularity.', url: '#' },
  { type: 'Barebow', title: 'Barebow Form and Technique', snippet: 'Master the form and technique unique to barebow archery.', url: '#' },
  { type: 'Barebow', title: 'Stringwalking Explained', snippet: 'A beginner’s guide to stringwalking for barebow archers.', url: '#' },
  { type: 'Barebow', title: 'Barebow Equipment Choices', snippet: 'What to look for when choosing barebow equipment.', url: '#' },
  { type: 'Barebow', title: 'Mental Game in Barebow', snippet: 'How to develop the mental toughness needed for barebow competition.', url: '#' },
  // Recurve
  { type: 'Recurve', title: 'Recurve Archery for Beginners', snippet: 'Start your recurve journey with these essential tips.', url: '#' },
  { type: 'Recurve', title: 'Setting Up a Recurve Bow', snippet: 'Step-by-step guide to setting up your recurve bow.', url: '#' },
  { type: 'Recurve', title: 'Recurve Tuning and Maintenance', snippet: 'Keep your recurve bow shooting straight with these tuning tips.', url: '#' },
  { type: 'Recurve', title: 'Competition Preparation for Recurve Archers', snippet: 'How to prepare for your first recurve competition.', url: '#' },
  { type: 'Recurve', title: 'Recurve Archery Drills', snippet: 'Effective drills to improve your recurve archery skills.', url: '#' },
];

const KENYA_COLORS = {
  black: '#000',
  red: '#d32f2f',
  green: '#006600',
  white: '#fff',
  gold: '#FFD700',
};

export default function Community() {
  return (
    <main style={{
      padding: '2rem',
      background: `linear-gradient(135deg, ${KENYA_COLORS.green} 0%, ${KENYA_COLORS.gold} 100%)`,
      minHeight: '100vh',
    }}>
      <h1 style={{ textAlign: 'center', color: KENYA_COLORS.black, fontWeight: 800, marginBottom: 32 }}>Archery Community Articles</h1>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'center' }}>
        {['Compound', 'Barebow', 'Recurve'].map((type) => (
          <section key={type} style={{ minWidth: 320, maxWidth: 400, flex: 1, background: KENYA_COLORS.white, borderRadius: 12, boxShadow: '0 2px 16px #0001', padding: 20, marginBottom: 24 }}>
            <h2 style={{ color: KENYA_COLORS.green, borderBottom: `2px solid ${KENYA_COLORS.gold}`, paddingBottom: 8 }}>{type} Archery</h2>
            {articles.filter(a => a.type === type).map((a, i) => (
              <div key={a.title} style={{ margin: '18px 0' }}>
                <h3 style={{ color: KENYA_COLORS.red, fontSize: '1.1rem', marginBottom: 4 }}>{a.title}</h3>
                <p style={{ color: KENYA_COLORS.black, marginBottom: 4 }}>{a.snippet}</p>
                <a href={a.url} style={{ color: KENYA_COLORS.green, fontWeight: 600, textDecoration: 'underline' }}>Read more</a>
              </div>
            ))}
          </section>
        ))}
      </div>
    </main>
  );
}