const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { sendEmail } = require('../utils/email');
const { JWT_SECRET } = require('../config');
const auth = require('../middleware/auth');

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';
// RENDER_EXTERNAL_URL is auto-injected by Render on every web service — used
// as a fallback so verification/reset links work without manually setting
// SERVER_URL after each deploy.
const SERVER_URL = process.env.SERVER_URL || process.env.RENDER_EXTERNAL_URL || 'http://localhost:5000';

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    club: user.club,
    category: user.category,
    leaderboardPublic: user.leaderboardPublic,
    twoFactorEnabled: user.twoFactorEnabled,
  };
}

async function sendVerificationEmail(user) {
  const verificationLink = `${SERVER_URL}/api/auth/verify-email/${user.verificationToken}`;
  await sendEmail({
    to: user.email,
    subject: 'Verify your Archery Tracker Account',
    html: `
      <h1>Welcome to Archery Tracker!</h1>
      <p>Hi ${user.name},</p>
      <p>Please verify your email address by clicking the link below:</p>
      <a href="${verificationLink}">Verify Email</a>
      <p>This link does not expire, but you won't be able to log in until you use it.</p>
    `,
  });
}

router.post('/signup', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').notEmpty().withMessage('Role is required'),
  body('club').notEmpty().withMessage('Club is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('agreeToTerms').custom((value) => value === true).withMessage('You must agree to the Privacy Policy and Terms of Service'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Extract all fields as-is (case sensitive)
    const { name, email, password, role, club, category, leaderboardOptIn } = req.body;

    // Self-serve signup can only ever create archer/coach accounts.
    // Admin accounts are granted by an existing admin or the one-time seed
    // script (server/scripts/create-admin.js) — never by client-supplied input.
    const safeRole = role === 'coach' ? 'coach' : 'archer';

    // Check for existing user (case sensitive email)
    let user = await User.findOne({ where: { email } });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const verificationToken = uuidv4();

    user = await User.create({
      name,
      email,
      password,
      role: safeRole,
      club,
      category,
      isVerified: false,
      verificationToken,
      consentAcceptedAt: new Date(),
      // Opt-in, unchecked by default — separate from the required terms checkbox.
      leaderboardPublic: leaderboardOptIn === true,
    });

    await sendVerificationEmail(user);

    // Instead of logging the user in directly, return a success message telling them to verify their email
    res.status(201).json({
      message: 'Account created. Please check your email to verify your account.'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/verify-email/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const user = await User.findOne({ where: { verificationToken: token } });

    if (!user) {
      return res.status(400).send('Invalid or expired verification token');
    }

    user.isVerified = true;
    user.verificationToken = null;
    await user.save();

    // Redirect to login page on the client
    res.redirect(`${CLIENT_URL}/login?verified=true`);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

// Re-send the verification email — covers the case where the first one never
// arrived (e.g. while email delivery wasn't configured yet, or it was lost).
router.post('/resend-verification', [
  body('email').isEmail().normalizeEmail(),
], async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    // Always respond the same way whether or not the account exists, so this
    // endpoint can't be used to enumerate registered emails.
    const genericResponse = { message: 'If an unverified account exists for that email, a new verification link has been sent.' };

    if (!user || user.isVerified) {
      return res.json(genericResponse);
    }

    if (!user.verificationToken) {
      user.verificationToken = uuidv4();
      await user.save();
    }
    await sendVerificationEmail(user);

    res.json(genericResponse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        message: 'Please verify your email before logging in. Check your inbox for the verification link, or request a new one.',
        code: 'EMAIL_NOT_VERIFIED',
      });
    }

    if (user.twoFactorEnabled) {
      const code = String(Math.floor(100000 + Math.random() * 900000));
      user.twoFactorCode = code;
      user.twoFactorCodeExpires = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();

      await sendEmail({
        to: user.email,
        subject: 'Your Archery Tracker login code',
        html: `
          <h2>Your login code</h2>
          <p>Hi ${user.name},</p>
          <p>Your one-time login code is:</p>
          <h1 style="letter-spacing:4px;">${code}</h1>
          <p>This code expires in 10 minutes. If you didn't try to log in, you can ignore this email.</p>
        `,
      });

      const pendingToken = jwt.sign(
        { userId: user.id, pending2FA: true },
        JWT_SECRET,
        { expiresIn: '10m' }
      );

      return res.json({ twoFactorRequired: true, pendingToken });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, user: publicUser(user) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Step 2 of login when 2FA is enabled: exchange the emailed code + pending
// token for a real session token.
router.post('/verify-2fa', [
  body('pendingToken').notEmpty(),
  body('code').isLength({ min: 6, max: 6 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { pendingToken, code } = req.body;

    let decoded;
    try {
      decoded = jwt.verify(pendingToken, JWT_SECRET);
    } catch {
      return res.status(401).json({ message: 'Login session expired, please log in again' });
    }
    if (!decoded.pending2FA) {
      return res.status(401).json({ message: 'Invalid session' });
    }

    const user = await User.findByPk(decoded.userId);
    if (!user || !user.twoFactorCode || !user.twoFactorCodeExpires) {
      return res.status(401).json({ message: 'No pending login code' });
    }
    if (new Date() > user.twoFactorCodeExpires) {
      return res.status(401).json({ message: 'Code expired, please log in again' });
    }
    if (user.twoFactorCode !== code) {
      return res.status(401).json({ message: 'Incorrect code' });
    }

    user.twoFactorCode = null;
    user.twoFactorCodeExpires = null;
    await user.save();

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, user: publicUser(user) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Request a password reset email
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail(),
], async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    // Same response whether or not the account exists, to avoid leaking which
    // emails are registered.
    const genericResponse = { message: 'If an account exists for that email, a password reset link has been sent.' };

    if (!user) {
      return res.json(genericResponse);
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    const resetLink = `${CLIENT_URL}/reset-password/${resetToken}`;
    await sendEmail({
      to: user.email,
      subject: 'Reset your Archery Tracker password',
      html: `
        <h2>Password reset requested</h2>
        <p>Hi ${user.name},</p>
        <p>Click the link below to choose a new password. This link expires in 1 hour.</p>
        <a href="${resetLink}">Reset Password</a>
        <p>If you didn't request this, you can safely ignore this email — your password won't change.</p>
      `,
    });

    res.json(genericResponse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Complete a password reset
router.post('/reset-password/:token', [
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      where: { resetPasswordToken: token },
    });

    if (!user || !user.resetPasswordExpires || new Date() > user.resetPasswordExpires) {
      return res.status(400).json({ message: 'Invalid or expired reset link' });
    }

    user.password = password; // re-hashed by the beforeSave hook
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.json({ message: 'Password updated. You can now log in with your new password.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findByPk(decoded.userId, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user: publicUser(user) });
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

// Update current user's own profile preferences
router.patch('/me', auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (typeof req.body.leaderboardPublic === 'boolean') {
      user.leaderboardPublic = req.body.leaderboardPublic;
    }
    if (typeof req.body.twoFactorEnabled === 'boolean') {
      user.twoFactorEnabled = req.body.twoFactorEnabled;
    }
    await user.save();

    res.json({ user: publicUser(user) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Export everything we hold about the current user, as JSON (Data Protection
// Act, 2019 right-to-access).
router.get('/me/export', auth, async (req, res) => {
  try {
    const Session = require('../models/Session');
    const Equipment = require('../models/Equipment');
    const TuningEntry = require('../models/TuningEntry');
    const StoreListing = require('../models/StoreListing');

    const user = await User.findByPk(req.user.userId, { attributes: { exclude: ['password'] } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const [sessions, equipment, tuning, listings] = await Promise.all([
      Session.findAll({ where: { userId: user.id } }),
      Equipment.findAll({ where: { userId: user.id } }),
      TuningEntry.findAll({ where: { userId: user.id } }),
      StoreListing.findAll({ where: { sellerId: user.id } }),
    ]);

    const exportData = {
      exportedAt: new Date().toISOString(),
      profile: publicUser(user),
      sessions,
      equipment,
      tuningEntries: tuning,
      storeListings: listings,
    };

    res.setHeader('Content-Disposition', `attachment; filename="archery-tracker-export-${user.id}.json"`);
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(exportData, null, 2));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Permanently delete the current user's account and everything they created
// (Data Protection Act, 2019 right-to-erasure). Requires the current password
// as confirmation, since a leaked JWT alone shouldn't be enough to wipe an
// account.
router.delete('/me', auth, [
  body('password').notEmpty().withMessage('Password is required to confirm account deletion'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const Session = require('../models/Session');
    const Equipment = require('../models/Equipment');
    const TuningEntry = require('../models/TuningEntry');
    const StoreListing = require('../models/StoreListing');

    const user = await User.findByPk(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await user.comparePassword(req.body.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    await TuningEntry.destroy({ where: { userId: user.id } });
    await Equipment.destroy({ where: { userId: user.id } });
    await Session.destroy({ where: { userId: user.id } });
    await StoreListing.destroy({ where: { sellerId: user.id } });
    // Listings this user had reserved from someone else — release the hold
    // rather than deleting another seller's listing.
    await StoreListing.update(
      { status: 'active', reservedByUserId: null, reservedAt: null },
      { where: { reservedByUserId: user.id } }
    );

    await user.destroy();

    res.json({ message: 'Account and all associated data have been permanently deleted.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
