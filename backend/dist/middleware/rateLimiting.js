"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.passwordResetRateLimit = exports.generalRateLimit = exports.authRateLimit = exports.createRateLimit = void 0;
const requestCounts = new Map();
const createRateLimit = (windowMs, maxRequests) => {
    return (req, res, next) => {
        const clientId = req.ip || req.connection.remoteAddress || 'unknown';
        const now = Date.now();
        for (const [key, value] of requestCounts.entries()) {
            if (now > value.resetTime) {
                requestCounts.delete(key);
            }
        }
        const clientData = requestCounts.get(clientId);
        if (!clientData || now > clientData.resetTime) {
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
exports.createRateLimit = createRateLimit;
const isDevelopment = process.env.NODE_ENV === 'development';
exports.authRateLimit = (0, exports.createRateLimit)(isDevelopment ? 60 * 1000 : 15 * 60 * 1000, isDevelopment ? 100 : 5);
exports.generalRateLimit = (0, exports.createRateLimit)(15 * 60 * 1000, 100);
exports.passwordResetRateLimit = (0, exports.createRateLimit)(60 * 60 * 1000, 3);
//# sourceMappingURL=rateLimiting.js.map