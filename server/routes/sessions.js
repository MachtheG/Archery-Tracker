const express = require('express');
const { body, validationResult } = require('express-validator');
const Session = require('../models/Session');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all sessions for current user (most recent first)
router.get('/', auth, async (req, res) => {
  try {
    const sessions = await Session.findAll({
      where: { userId: req.user.userId },
      order: [['date', 'DESC']],
      limit: 50,
    });

    res.json({ sessions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load sessions' });
  }
});

// Create a new session
router.post(
  '/',
  auth,
  [
    body('sessionType').optional().isIn(['practice', 'competition', 'training']),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { sessionType, ends, totals, environmental, equipment, locationRange, locationCity, date } = req.body;

      const session = await Session.create({
        userId: req.user.userId,
        sessionType: sessionType || 'practice',
        ends: ends || [],
        totals: totals || {},
        environmental: environmental || {},
        equipment: equipment || {},
        locationRange,
        locationCity,
        date: date ? new Date(date) : new Date(),
      });

      res.status(201).json({ session });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to create session' });
    }
  }
);

module.exports = router;
