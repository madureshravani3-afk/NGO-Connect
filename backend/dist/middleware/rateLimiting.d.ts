import { Request, Response, NextFunction } from 'express';
export declare const createRateLimit: (windowMs: number, maxRequests: number) => (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
export declare const authRateLimit: (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
export declare const generalRateLimit: (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
export declare const passwordResetRateLimit: (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
//# sourceMappingURL=rateLimiting.d.ts.map