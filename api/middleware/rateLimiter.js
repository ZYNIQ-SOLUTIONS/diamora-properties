const rateLimit = require('express-rate-limit');

const standardMessage = {
  success: false,
  message: 'Too many requests, please try again later.'
};

// General API rate limiter (200 requests per 15 min window)
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: standardMessage
});

// Strict rate limiter on /api/chat (30 requests per 15 min window)
const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: standardMessage
});

// Strict rate limiter on /api/auth/login (10 requests per 15 min window)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: standardMessage
});

// Strict rate limiter on /api/inquiries (15 requests per 15 min window)
const inquiryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: standardMessage
});

module.exports = {
  generalLimiter,
  chatLimiter,
  loginLimiter,
  inquiryLimiter
};
