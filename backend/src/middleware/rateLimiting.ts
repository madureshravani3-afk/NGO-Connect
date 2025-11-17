import { Request, Response, NextFunction } from 'express';

// Simple in-memory rate limiting (in production, use Redis)
const requestCounts = new Map<string, { count: number; resetTime: number }>();

// Rate limiting middleware
export const createRateLimit = (windowMs: number, maxRequests: number) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const clientId = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    
    // Clean up expired entries
    for (const [key, value] of requestCounts.entries()) {
      if (now > value.resetTime) {
        requestCounts.delete(key);
      }
    }
    
    const clientData = requestCounts.get(clientId);
    
    if (!clientData || now > clientData.resetTime) {
      // First request or window expired
      requestCounts.set(clientId, {
        count: 1,
        resetTime: now + windowMs
      });
      return next();
    }
    
    if (clientData.count >= maxRequests) {
      return res.status(429).json({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests',
          details: `Maximum ${maxRequests} requests per ${windowMs / 1000} seconds allowed`
        },
        timestamp: new Date().toISOString()
      });
    }
    
    clientData.count++;
    next();
  };
};

// Specific rate limiters
// In development, use more lenient rate limits
const isDevelopment = process.env.NODE_ENV === 'development';

export const authRateLimit = createRateLimit(
  isDevelopment ? 60 * 1000 : 15 * 60 * 1000, // 1 minute in dev, 15 minutes in prod
  isDevelopment ? 100 : 5 // 100 requests in dev, 5 in prod
);

export const generalRateLimit = createRateLimit(15 * 60 * 1000, 100); // 100 requests per 15 minutes
export const passwordResetRateLimit = createRateLimit(60 * 60 * 1000, 3); // 3 requests per hour