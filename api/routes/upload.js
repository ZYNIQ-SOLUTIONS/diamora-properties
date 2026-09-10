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
  // Documents
  'application/pdf',
  // Videos
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/x-m4v',
  'video/ogg'
];

const ALLOWED_EXTENSIONS = [
  '.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg',
  '.pdf',
  '.mp4', '.webm', '.mov', '.m4v', '.ogg'
];

const PROHIBITED_EXTENSIONS = ['.html', '.htm', '.xhtml', '.php', '.jsp', '.asp', '.aspx', '.js', '.sh', '.bat'];

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

// File filter validator: both MIME and extension MUST match allowed types; reject html/htm
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (PROHIBITED_EXTENSIONS.includes(ext)) {
    return cb(new Error(`HTML and script files (${ext}) are strictly prohibited.`), false);
  }

  const isMimeAllowed = ALLOWED_MIME_TYPES.includes(file.mimetype.toLowerCase());
  const isExtAllowed = ALLOWED_EXTENSIONS.includes(ext);

  if (isMimeAllowed && isExtAllowed) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type (${file.mimetype}). Please upload an image (JPG, PNG, WEBP, SVG), PDF, or video (MP4, WEBM, MOV).`), false);
  }
};

// Inspect SVG files for embedded scripts or dangerous active content
function containsDangerousSvgContent(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const dangerousPatterns = [
      /<script[\s>]/i,
      /<\/script>/i,
      /javascript\s*:/i,
      /\bon\w+\s*=/i,
      /<foreignObject[\s>]/i,
      /<animate[\s>]/i,
      /<set[\s>]/i,
      /<use[\s>].*href\s*=\s*['"]?data:/i
    ];
    return dangerousPatterns.some(pattern => pattern.test(content));
  } catch (err) {
    return true;
  }
}

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

    const ext = path.extname(req.file.filename).toLowerCase();
    if (ext === '.svg' && containsDangerousSvgContent(req.file.path)) {
      try { fs.unlinkSync(req.file.path); } catch (e) {}
      return res.status(400).json({ message: 'SVG files containing scripts or active content are strictly prohibited.' });
    }

    const isVideo = req.file.mimetype.startsWith('video/') ||
      ['.mp4', '.webm', '.mov', '.m4v', '.ogg'].includes(ext);
    const isPdf = req.file.mimetype === 'application/pdf' || ext === '.pdf';

    const fileUrl = `/uploads/${req.file.filename}`;

    res.status(201).json({
      success: true,
      message: 'Media uploaded successfully',
      url: fileUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mediaType: isVideo ? 'video' : isPdf ? 'document' : 'image',
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

    // Validate SVGs across all uploaded files
    for (const file of req.files) {
      const fileExt = path.extname(file.filename).toLowerCase();
      if (fileExt === '.svg' && containsDangerousSvgContent(file.path)) {
        req.files.forEach(f => {
          try { fs.unlinkSync(f.path); } catch (e) {}
        });
        return res.status(400).json({ message: 'One or more SVG files contain scripts or active content and were rejected.' });
      }
    }

    const uploadedFiles = req.files.map(file => {
      const ext = path.extname(file.filename).toLowerCase();
      const isVideo = file.mimetype.startsWith('video/') ||
        ['.mp4', '.webm', '.mov', '.m4v', '.ogg'].includes(ext);
      const isPdf = file.mimetype === 'application/pdf' || ext === '.pdf';
      return {
        url: `/uploads/${file.filename}`,
        filename: file.filename,
        originalName: file.originalname,
        size: file.size,
        mediaType: isVideo ? 'video' : isPdf ? 'document' : 'image',
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
