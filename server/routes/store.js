const express = require('express');
const { body, validationResult } = require('express-validator');
const StoreListing = require('../models/StoreListing');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

function serializeListing(l) {
  return {
    id: l.id.toString(),
    name: l.name,
    description: l.description || '',
    priceKES: l.priceKES,
    condition: l.condition,
    category: l.category || '',
    sellerName: l.sellerName,
    sellerEmail: l.sellerEmail,
    sellerPhone: l.sellerPhone || '',
    sellerId: l.sellerId === null ? 'system' : l.sellerId.toString(),
    listedAt: l.createdAt.toISOString().slice(0, 10),
    status: l.status,
    sold: l.status === 'sold',
    reservedByUserId: l.reservedByUserId ? l.reservedByUserId.toString() : null,
    reservedAt: l.reservedAt ? l.reservedAt.toISOString() : null,
    imageUrl: l.imageUrl || undefined,
    imageEmoji: l.imageEmoji || undefined,
  };
}

// Public: active + reserved listings (hide only fully sold items)
router.get('/', async (req, res) => {
  try {
    const listings = await StoreListing.findAll({
      where: { status: ['active', 'reserved'] },
      order: [['createdAt', 'DESC']],
    });
    res.json({ listings: listings.map(serializeListing) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load listings' });
  }
});

// Public: every listing regardless of status (used to resolve seller info at checkout)
router.get('/all', async (req, res) => {
  try {
    const listings = await StoreListing.findAll({ order: [['createdAt', 'DESC']] });
    res.json({ listings: listings.map(serializeListing) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load listings' });
  }
});

// Create a listing — seller identity always comes from the authenticated user, never the client body
router.post(
  '/',
  auth,
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('priceKES').isInt({ min: 1 }).withMessage('Valid price is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const seller = await User.findByPk(req.user.userId);
      if (!seller) {
        return res.status(404).json({ message: 'User not found' });
      }

      const { name, description, priceKES, condition, category, imageUrl, imageEmoji, sellerPhone } = req.body;

      const listing = await StoreListing.create({
        sellerId: seller.id,
        sellerName: seller.name,
        sellerEmail: seller.email,
        sellerPhone,
        name,
        description,
        priceKES,
        condition: condition || 'used',
        category,
        imageUrl,
        imageEmoji,
      });

      res.status(201).json({ listing: serializeListing(listing) });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to create listing' });
    }
  }
);

// Mark a listing sold. Any authenticated user can currently do this because the
// buyer (not the seller) triggers it from checkout — Phase 6 replaces this with a
// proper reserve (buyer) -> sold (seller confirms) flow with ownership checks.
router.patch('/:id/sold', auth, async (req, res) => {
  try {
    const listing = await StoreListing.findOne({ where: { id: req.params.id } });
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    await listing.update({ status: 'sold' });
    res.json({ listing: serializeListing(listing) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update listing' });
  }
});

// Remove a listing (owner only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const listing = await StoreListing.findOne({ where: { id: req.params.id, sellerId: req.user.userId } });
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    await listing.destroy();
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete listing' });
  }
});

module.exports = router;
