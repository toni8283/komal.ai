import rateLimit from 'express-rate-limit';

export const voiceTokenRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 30, // Limit each IP to 30 voice session requests per window
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many voice session requests. Please wait a few minutes before trying again.'
    }
  }
});

