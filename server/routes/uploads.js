const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../client/public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed'));
    }
  }
});

// Route for uploading a single image
router.post('/', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded' });
    }
    
    // Absolute URL so it resolves correctly when the client and API are on
    // different origins (e.g. Vercel + Render), not just in same-origin dev.
    //
    // NOTE: this still writes to local disk, which is NOT durable on Render/most
    // PaaS hosts (ephemeral filesystem — files vanish on redeploy/restart) and
    // isn't shared with Vercel at all. This works for local/VPS-with-shared-disk
    // setups only. Before going live on Render+Vercel, swap this for an object
    // storage provider (e.g. Cloudinary, S3, Supabase Storage) — flagged to the
    // project owner, not fixed here since it requires picking a provider.
    const serverUrl = process.env.SERVER_URL || `${req.protocol}://${req.get('host')}`;
    const imageUrl = `${serverUrl}/uploads/${req.file.filename}`;
    res.status(200).json({ imageUrl });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Server error during upload' });
  }
});

module.exports = router;
