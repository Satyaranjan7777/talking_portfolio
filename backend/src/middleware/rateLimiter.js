import rateLimit, { ipKeyGenerator } from "express-rate-limit";

// Rate limiter for authentication attempts (strict, composite IP + email key)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 failed attempts per window
  skipSuccessfulRequests: true, // Only count failed attempts against quota
  keyGenerator: (req) => {
    const email = req.body?.email ? String(req.body.email).toLowerCase().trim() : "";
    const clientIp = ipKeyGenerator(req.ip);
    return `${clientIp}_${email}`;
  },
  validate: false,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: "Too many login attempts. Please try again after 15 minutes.",
  },
});

// Rate limiter for sensitive operations (password change, 2FA verify/disable/generate)
export const sensitiveAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: "Too many sensitive requests. Please wait a few minutes before trying again.",
  },
});

// Rate limiter for heavy multipart file uploads (prevents memory exhaustion & quota drain)
export const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 uploads per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: "Upload limit reached. Please wait a few minutes before uploading more files.",
  },
});

// Rate limiter for expensive audit log searches (prevents database query flooding)
export const auditSearchLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // 30 search queries per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: "Too many audit log queries. Please slow down.",
  },
});

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 120, // 120 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: "Too many requests. Please slow down.",
  },
});

