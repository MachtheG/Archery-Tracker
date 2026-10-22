const express = require('express');
const { body, validationResult } = require('express-validator');
const Equipment = require('../models/Equipment');
const TuningEntry = require('../models/TuningEntry');
const auth = require('../middleware/auth');

const router = express.Router();

function serializeEquipment(eq) {
  return {
    id: eq.id.toString(),
    name: eq.name,
    bowType: eq.bowType,
    drawWeight: eq.drawWeight || '',
    braceHeight: eq.braceHeight || '',
    tiller: eq.tiller || '',
    arrowType: eq.arrowType || '',
    arrowSpine: eq.arrowSpine || '',
    arrowLength: eq.arrowLength || '',
    sightSettings: eq.sightSettings || '',
    notes: eq.notes || '',
    createdAt: eq.createdAt.toISOString().slice(0, 10),
  };
}

// List current user's equipment
router.get('/', auth, async (req, res) => {
  try {
    const equipment = await Equipment.findAll({
      where: { userId: req.user.userId },
      order: [['createdAt', 'DESC']],
    });
    res.json({ equipment: equipment.map(serializeEquipment) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load equipment' });
  }
});

// Create new equipment
router.post(
  '/',
  auth,
  [body('name').notEmpty().withMessage('Name is required')],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, bowType, drawWeight, braceHeight, tiller, arrowType, arrowSpine, arrowLength, sightSettings, notes } = req.body;

      const eq = await Equipment.create({
        userId: req.user.userId,
        name,
        bowType: bowType || 'recurve',
        drawWeight,
        braceHeight,
        tiller,
        arrowType,
        arrowSpine,
        arrowLength,
        sightSettings,
        notes,
      });

      res.status(201).json({ equipment: serializeEquipment(eq) });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to create equipment' });
    }
  }
);

// Update equipment (owner only)
router.put('/:id', auth, async (req, res) => {
  try {
    const eq = await Equipment.findOne({ where: { id: req.params.id, userId: req.user.userId } });
    if (!eq) {
      return res.status(404).json({ message: 'Equipment not found' });
    }

    const { name, bowType, drawWeight, braceHeight, tiller, arrowType, arrowSpine, arrowLength, sightSettings, notes } = req.body;
    await eq.update({ name, bowType, drawWeight, braceHeight, tiller, arrowType, arrowSpine, arrowLength, sightSettings, notes });

    res.json({ equipment: serializeEquipment(eq) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update equipment' });
  }
});

// Delete equipment (owner only) — also removes its tuning history
router.delete('/:id', auth, async (req, res) => {
  try {
    const eq = await Equipment.findOne({ where: { id: req.params.id, userId: req.user.userId } });
    if (!eq) {
      return res.status(404).json({ message: 'Equipment not found' });
    }

    await TuningEntry.destroy({ where: { equipmentId: eq.id, userId: req.user.userId } });
    await eq.destroy();

    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete equipment' });
  }
});

module.exports = router;
