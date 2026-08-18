/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Request, Response, NextFunction } from 'express';
import { ApiError } from './errorHandler.ts';

/**
 * Helmet Security Headers middleware:
 * Adds secure response headers to mitigate clickjacking, MIME sniffing, and XSS.
 */
export const helmetMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (process.env.NODE_ENV !== 'production') {
    // In development/preview, we must allow embedding in the AI Studio iframe workspace.
    // Omit 'X-Frame-Options' entirely and set 'frame-ancestors *' in CSP.
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader(
      'Content-Security-Policy',
      "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:; img-src * data: blob: android-asset: referrer; frame-ancestors *;"
    );
  } else {
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob:; img-src * data: blob: android-asset: https: http:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; connect-src *;"
    );
  }
  next();
};

/**
 * Custom CORS (Cross-Origin Resource Sharing) middleware:
 * Validates incoming origins and appends required headers.
 */
export const corsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin;

  const allowedOrigins = [
    'https://metafirm.app',
    'https://www.metafirm.app',
    'https://api.metafirm.app',
    'capacitor://localhost',
    'http://localhost',
    'https://localhost',
    'http://localhost:3000',
    'http://localhost:5173',
  ];

  if (process.env.FRONTEND_URL) {
    allowedOrigins.push(process.env.FRONTEND_URL.replace(/\/$/, ''));
  }

  const isAllowed =
    !origin ||
    allowedOrigins.includes(origin) ||
    origin.startsWith('capacitor://') ||
    origin.endsWith('.vercel.app') ||
    origin.endsWith('.run.app') ||
    origin.endsWith('.onrender.com') ||
    process.env.NODE_ENV !== 'production';

  if (origin && isAllowed) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (!origin) {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
};

// In-memory sliding window rate limiter store
interface RateLimitBucket {
  count: number;
  resetTime: number;
}
const ipBuckets = new Map<string, RateLimitBucket>();

/**
 * Rate Limiting middleware:
 * Mitigates denial-of-service (DoS) and brute force attempts.
 */
export const rateLimiter = (windowMs = 15 * 60 * 1000, maxRequests = 100) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    
    let bucket = ipBuckets.get(ip);
    if (!bucket || now > bucket.resetTime) {
      bucket = {
        count: 1,
        resetTime: now + windowMs,
      };
      ipBuckets.set(ip, bucket);
    } else {
      bucket.count++;
    }

    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - bucket.count));
    res.setHeader('X-RateLimit-Reset', Math.ceil(bucket.resetTime / 1000));

    if (bucket.count > maxRequests) {
      return next(new ApiError(429, 'Too many requests. Please try again later.', 'RATE_LIMIT_EXCEEDED'));
    }

    next();
  };
};
