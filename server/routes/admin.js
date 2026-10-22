const express = require('express');
const { Op } = require('sequelize');
const User = require('../models/User');
const Session = require('../models/Session');
const StoreListing = require('../models/StoreListing');
const CompetitionResult = require('../models/CompetitionResult');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

const router = express.Router();

// Bucket a list of Date objects into counts per day, for the last `days` days
// (oldest first), zero-filled so the chart has no gaps.
function dailyCounts(dates, days) {
  const buckets = new Map();
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - i);
    buckets.set(d.toISOString().slice(0, 10), 0);
  }

  for (const date of dates) {
    const key = new Date(date).toISOString().slice(0, 10);
    if (buckets.has(key)) {
      buckets.set(key, buckets.get(key) + 1);
    }
  }

  return [...buckets.entries()].map(([date, count]) => ({ date, count }));
}

// Admin-only: aggregate usage numbers for the project owner — no endpoint here
// ever returns raw user rows, passwords, or PII beyond what's needed for counts.
router.get('/stats', auth, requireRole('admin'), async (req, res) => {
  try {
    const days = Math.min(Number(req.query.days) || 30, 90);
    const since = new Date();
    since.setUTCDate(since.getUTCDate() - days);

    const [
      totalUsers,
      usersByRoleRaw,
      leaderboardPublicCount,
      recentUsers,
      totalSessions,
      recentSessions,
      listingsByStatusRaw,
      competitionResultsCount,
    ] = await Promise.all([
      User.count(),
      User.findAll({ attributes: ['role'], raw: true }),
      User.count({ where: { leaderboardPublic: true } }),
      User.findAll({ where: { createdAt: { [Op.gte]: since } }, attributes: ['createdAt'], raw: true }),
      Session.count(),
      Session.findAll({ where: { createdAt: { [Op.gte]: since } }, attributes: ['createdAt'], raw: true }),
      StoreListing.findAll({ attributes: ['status'], raw: true }),
      CompetitionResult.count(),
    ]);

    const usersByRole = usersByRoleRaw.reduce((acc, u) => {
      acc[u.role] = (acc[u.role] || 0) + 1;
      return acc;
    }, {});

    const listingsByStatus = listingsByStatusRaw.reduce((acc, l) => {
      acc[l.status] = (acc[l.status] || 0) + 1;
      return acc;
    }, {});

    res.json({
      generatedAt: new Date().toISOString(),
      rangeDays: days,
      users: {
        total: totalUsers,
        byRole: { archer: usersByRole.archer || 0, coach: usersByRole.coach || 0, admin: usersByRole.admin || 0 },
        leaderboardPublic: leaderboardPublicCount,
        leaderboardPrivate: totalUsers - leaderboardPublicCount,
        newInRange: recentUsers.length,
        dailySignups: dailyCounts(recentUsers.map((u) => u.createdAt), days),
      },
      sessions: {
        total: totalSessions,
        newInRange: recentSessions.length,
        dailySessions: dailyCounts(recentSessions.map((s) => s.createdAt), days),
      },
      store: {
        active: listingsByStatus.active || 0,
        reserved: listingsByStatus.reserved || 0,
        sold: listingsByStatus.sold || 0,
      },
      competitionResults: competitionResultsCount,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load admin stats' });
  }
});

module.exports = router;
