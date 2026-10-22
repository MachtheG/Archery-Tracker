const express = require('express');
const { Op } = require('sequelize');
const Session = require('../models/Session');
const User = require('../models/User');

const router = express.Router();

function monthRange(month) {
  // month is "YYYY-MM"; build [start, end) in UTC
  const start = new Date(`${month}-01T00:00:00.000Z`);
  const end = new Date(start);
  end.setUTCMonth(end.getUTCMonth() + 1);
  return { start, end };
}

// Public: monthly leaderboard computed from real logged sessions.
// Archers who have set leaderboardPublic = false are excluded entirely from the
// query result, not just hidden client-side.
router.get('/', async (req, res) => {
  try {
    const month = /^\d{4}-\d{2}$/.test(req.query.month || '')
      ? req.query.month
      : new Date().toISOString().slice(0, 7);

    const { start, end } = monthRange(month);

    const sessions = await Session.findAll({
      where: { date: { [Op.gte]: start, [Op.lt]: end } },
      attributes: ['userId', 'totals', 'date'],
    });

    if (sessions.length === 0) {
      return res.json({ month, results: [] });
    }

    const userIds = [...new Set(sessions.map((s) => s.userId))];
    const users = await User.findAll({
      where: { id: userIds, leaderboardPublic: true },
      attributes: ['id', 'name', 'club', 'category'],
    });
    const userMap = new Map(users.map((u) => [u.id, u]));

    const counts = new Map();
    const best = new Map();

    for (const s of sessions) {
      if (!userMap.has(s.userId)) continue; // opted out or not found

      counts.set(s.userId, (counts.get(s.userId) || 0) + 1);

      const score = Number(s.totals?.totalScore) || 0;
      const current = best.get(s.userId);
      if (!current || score > current.score) {
        best.set(s.userId, {
          score,
          roundName: s.totals?.roundName || 'Practice',
          date: s.date,
        });
      }
    }

    const results = [...best.entries()]
      .map(([userId, b]) => {
        const u = userMap.get(userId);
        return {
          archer: u.name,
          club: u.club || '',
          category: u.category || '',
          score: b.score,
          roundName: b.roundName,
          date: new Date(b.date).toISOString().slice(0, 10),
          sessionsLogged: counts.get(userId),
        };
      })
      .sort((a, b) => b.score - a.score);

    res.json({ month, results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load leaderboard' });
  }
});

module.exports = router;
