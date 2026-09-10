require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');

const path = require('path');
const fs = require('fs');

const {
  generalLimiter,
  chatLimiter,
  loginLimiter,
  inquiryLimiter
} = require('./middleware/rateLimiter');

// In production, ensure secure JWT_SECRET
if (process.env.NODE_ENV === 'production') {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret === 'secret' || secret === 'supersecretkey_change_me_in_production') {
    console.error('FATAL SECURITY ERROR: JWT_SECRET must be set to a secure production secret key.');
    process.exit(1);
  }
}

const app = express();

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Security Headers (Helmet & CSP)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        'https://www.googletagmanager.com',
        'https://cdn.lr-ingest.com',
        'https://*.logrocket.io',
        'https://unpkg.com',
        'https://cdnjs.cloudflare.com',
        'https://cdn.jsdelivr.net'
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        'https://fonts.googleapis.com',
        'https://unpkg.com',
        'https://cdnjs.cloudflare.com'
      ],
      fontSrc: [
        "'self'",
        'https://fonts.gstatic.com',
        'data:'
      ],
      imgSrc: [
        "'self'",
        'data:',
        'https:',
        'blob:'
      ],
      mediaSrc: [
        "'self'",
        'data:',
        'https:',
        'blob:'
      ],
      connectSrc: [
        "'self'",
        'https://*.logrocket.io',
        'https://*.lr-ingest.com',
        'https://*.google-analytics.com',
        'https://*.analytics.google.com',
        'https://generativelanguage.googleapis.com'
      ],
      frameSrc: ["'self'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  },
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  xFrameOptions: { action: 'sameorigin' },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
}));
app.disable('x-powered-by');

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// NoSQL Injection Sanitization
app.use((req, res, next) => {
  if (req.body) mongoSanitize.sanitize(req.body);
  if (req.params) mongoSanitize.sanitize(req.params);
  if (req.query) {
    const cleanQuery = mongoSanitize.sanitize({ ...req.query });
    for (const key of Object.keys(cleanQuery)) {
      if (/^\$|\[\$/.test(key)) {
        delete cleanQuery[key];
      }
    }
    Object.defineProperty(req, 'query', {
      value: cleanQuery,
      writable: true,
      enumerable: true,
      configurable: true
    });
  }
  next();
});

// Rate Limiting
app.use('/api', generalLimiter);
app.use('/api/chat', chatLimiter);
app.use('/api/auth/login', loginLimiter);
app.use('/api/inquiries', inquiryLimiter);

// Static Media Delivery
app.use('/uploads', express.static(uploadsDir));

// Database Connection
const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/diamora';
mongoose.connect(mongoURI)
  .then(() => console.log(`MongoDB connected successfully to ${mongoURI}`))
  .catch(err => console.log('MongoDB connection notice:', err.message));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'Diamora Properties API',
    time: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/properties', require('./routes/properties'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/inquiries', require('./routes/inquiries'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/blog', require('./routes/blog'));
app.use('/api/chat', require('./routes/chat'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Diamora Properties API running on port ${PORT}`));
