const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const sequelize = require('./sequelize');

// Sequelize models
const User = require('./models/User');
const Session = require('./models/Session');
const Equipment = require('./models/Equipment');
const TuningEntry = require('./models/TuningEntry');
const StoreListing = require('./models/StoreListing');
const CompetitionResult = require('./models/CompetitionResult');
const { seedStoreListings } = require('./utils/seed');

// Sync models with database
sequelize.authenticate()
  .then(() => {
    console.log('Database connection established');
    return sequelize.sync();
  })
  .then(() => {
    console.log('Database & tables synced');
    return seedStoreListings();
  })
  .catch((err) => {
    console.error('Unable to connect to the database:', err);
  });

const authRoutes = require('./routes/auth');
const sessionRoutes = require('./routes/sessions');
const equipmentRoutes = require('./routes/equipment');
const tuningRoutes = require('./routes/tuning');
const storeRoutes = require('./routes/store');
const leaderboardRoutes = require('./routes/leaderboard');
const competitionRoutes = require('./routes/competitions');
const orderRoutes = require('./routes/orders');
const uploadRoutes = require('./routes/uploads');

const app = express();

// Allow a comma-separated list of origins (e.g. staging + production client URLs)
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:3000')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

// crossOriginResourcePolicy relaxed so uploaded images under /uploads can be
// embedded from the client's origin (a different origin from the API in
// production, e.g. Vercel vs Render).
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser requests (no Origin header, e.g. curl/health checks)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);
app.use(express.json());

// Serves files written by routes/uploads.js — see the durability note there.
app.use('/uploads', express.static(path.join(__dirname, '../client/public/uploads')));

// Generous global limit as a backstop, with a tighter limit on sensitive auth
// endpoints (login/signup/password reset) to slow down credential stuffing
// and spam signups.
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300, standardHeaders: true, legacyHeaders: false }));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts. Please try again later.' },
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/signup', authLimiter);
app.use('/api/auth/forgot-password', authLimiter);
app.use('/api/auth/verify-2fa', authLimiter);
app.use('/api/auth/resend-verification', authLimiter);

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/tuning', tuningRoutes);
app.use('/api/store', storeRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/competitions', competitionRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/uploads', uploadRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
