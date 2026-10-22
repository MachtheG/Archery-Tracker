const express = require('express');
const { body, validationResult } = require('express-validator');
const TuningEntry = require('../models/TuningEntry');
const Equipment = require('../models/Equipment');
const auth = require('../middleware/auth');

const router = express.Router();

function serializeTuning(t) {
  return {
    id: t.id.toString(),
    equipmentId: t.equipmentId.toString(),
    date: typeof t.date === 'string' ? t.date : t.date.toISOString().slice(0, 10),
    change: t.change,
    impact: t.impact || '',
    notes: t.notes || '',
  };
}

// List current user's tuning entries, optionally filtered by equipmentId
router.get('/', auth, async (req, res) => {
  try {
    const where = { userId: req.user.userId };
    if (req.query.equipmentId) where.equipmentId = req.query.equipmentId;

    const entries = await TuningEntry.findAll({
      where,
      order: [['date', 'DESC'], ['createdAt', 'DESC']],
    });
    res.json({ tuning: entries.map(serializeTuning) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load tuning history' });
  }
});

// Create a tuning entry — equipment must belong to the current user
router.post(
  '/',
  auth,
  [
    body('equipmentId').notEmpty().withMessage('equipmentId is required'),
    body('change').notEmpty().withMessage('change is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { equipmentId, change, impact, notes, date } = req.body;

      const eq = await Equipment.findOne({ where: { id: equipmentId, userId: req.user.userId } });
      if (!eq) {
        return res.status(404).json({ message: 'Equipment not found' });
      }

      const entry = await TuningEntry.create({
        userId: req.user.userId,
        equipmentId,
        change,
        impact,
        notes,
        date: date || new Date(),
      });

      res.status(201).json({ tuning: serializeTuning(entry) });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to create tuning entry' });
    }
  }
);

module.exports = router;
