// One-time CLI script to create an admin (or coach) account, since self-serve
// signup can only ever create archer/coach accounts (see routes/auth.js).
//
// Usage:
//   node scripts/create-admin.js "Jane Doe" jane@example.com "a-strong-password" [role]
//
// role defaults to "admin"; pass "coach" to create a coach account instead.
require('dotenv').config();
const sequelize = require('../sequelize');
const User = require('../models/User');

async function main() {
  const [name, email, password, role = 'admin'] = process.argv.slice(2);

  if (!name || !email || !password) {
    console.error('Usage: node scripts/create-admin.js "Full Name" email@example.com password [admin|coach]');
    process.exit(1);
  }
  if (!['admin', 'coach'].includes(role)) {
    console.error('role must be "admin" or "coach"');
    process.exit(1);
  }

  await sequelize.authenticate();
  await sequelize.sync();

  const existing = await User.findOne({ where: { email } });
  if (existing) {
    console.error(`A user with email ${email} already exists (id ${existing.id}, role ${existing.role}).`);
    process.exit(1);
  }

  const user = await User.create({
    name,
    email,
    password,
    role,
    club: 'Kenya Archery Association',
    category: 'N/A',
    isVerified: true, // skip the email verification step for this bootstrap account
  });

  console.log(`Created ${role} account: ${user.email} (id ${user.id})`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
