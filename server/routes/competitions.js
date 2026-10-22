const express = require('express');
const { body, validationResult } = require('express-validator');
const CompetitionResult = require('../models/CompetitionResult');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

const router = express.Router();

function serialize(r) {
  return {
    id: r.id.toString(),
    eventName: r.eventName,
    eventDate: r.eventDate,
    archerName: r.archerName,
    club: r.club || '',
    category: r.category || '',
    score: r.score,
    round: r.round || '',
    notes: r.notes || '',
    postedByUserId: r.postedByUserId.toString(),
  };
}

// Public: full competition results history — a separate leaderboard from the
// auto-computed monthly training leaderboard. Entries here are posted manually
// by coaches/admins from real-world events, not derived from logged sessions.
router.get('/', async (req, res) => {
  try {
    const results = await CompetitionResult.findAll({
      order: [['eventDate', 'DESC'], ['score', 'DESC']],
    });
    res.json({ results: results.map(serialize) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load competition results' });
  }
});

// Coach/admin only: post a result from a past competition
router.post(
  '/',
  auth,
  requireRole('coach', 'admin'),
  [
    body('eventName').notEmpty().withMessage('Event name is required'),
    body('eventDate').isISO8601().withMessage('Valid event date is required'),
    body('archerName').notEmpty().withMessage('Archer name is required'),
    body('score').isInt({ min: 0 }).withMessage('Valid score is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { eventName, eventDate, archerName, club, category, score, round, notes } = req.body;

      const result = await CompetitionResult.create({
        postedByUserId: req.user.userId,
        eventName,
        eventDate,
        archerName,
        club,
        category,
        score,
        round,
        notes,
      });

      res.status(201).json({ result: serialize(result) });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to post result' });
    }
  }
);

// Coach/admin only: remove a result (e.g. posted in error)
router.delete('/:id', auth, requireRole('coach', 'admin'), async (req, res) => {
  try {
    const result = await CompetitionResult.findByPk(req.params.id);
    if (!result) {
      return res.status(404).json({ message: 'Result not found' });
    }
    await result.destroy();
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete result' });
  }
});

module.exports = router;
