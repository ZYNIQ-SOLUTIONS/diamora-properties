const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Allowed MIME types and extensions
const ALLOWED_MIME_TYPES = [
  // Images
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  // Videos
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/x-m4v',
  'video/ogg'
];

const ALLOWED_EXTENSIONS = [
  '.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg',
  '.mp4', '.webm', '.mov', '.m4v', '.ogg'
];

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 30);
    const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    cb(null, `diamora_${cleanName}_${uniqueSuffix}${ext}`);
  }
});

// File filter validator
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const isMimeAllowed = ALLOWED_MIME_TYPES.includes(file.mimetype.toLowerCase());
  const isExtAllowed = ALLOWED_EXTENSIONS.includes(ext);

  if (isMimeAllowed || isExtAllowed) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type (${file.mimetype}). Please upload an image (JPG, PNG, WEBP) or video (MP4, WEBM, MOV).`), false);
  }
};

// Upload handler instance (100MB max limit)
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB
  }
});

// POST /api/upload - Single file upload
router.post('/', auth, (req, res) => {
  upload.single('file')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File is too large. Maximum size allowed is 100MB.' });
      }
      return res.status(400).json({ message: `Upload error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No media file provided for upload.' });
    }

    const isVideo = req.file.mimetype.startsWith('video/') ||
      ['.mp4', '.webm', '.mov', '.m4v', '.ogg'].includes(path.extname(req.file.filename).toLowerCase());

    const fileUrl = `/uploads/${req.file.filename}`;

    res.status(201).json({
      success: true,
      message: 'Media uploaded successfully',
      url: fileUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mediaType: isVideo ? 'video' : 'image',
      mimetype: req.file.mimetype
    });
  });
});

// POST /api/upload/multiple - Multiple files upload (up to 10 files)
router.post('/multiple', auth, (req, res) => {
  upload.array('files', 10)(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'One or more files exceed the 100MB size limit.' });
      }
      return res.status(400).json({ message: `Upload error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No media files provided for upload.' });
    }

    const uploadedFiles = req.files.map(file => {
      const isVideo = file.mimetype.startsWith('video/') ||
        ['.mp4', '.webm', '.mov', '.m4v', '.ogg'].includes(path.extname(file.filename).toLowerCase());
      return {
        url: `/uploads/${file.filename}`,
        filename: file.filename,
        originalName: file.originalname,
        size: file.size,
        mediaType: isVideo ? 'video' : 'image',
        mimetype: file.mimetype
      };
    });

    res.status(201).json({
      success: true,
      message: `${uploadedFiles.length} media files uploaded successfully`,
      files: uploadedFiles
    });
  });
});

module.exports = router;
