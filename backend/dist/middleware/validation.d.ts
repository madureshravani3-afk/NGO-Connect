import { Request, Response, NextFunction } from 'express';
export declare const isValidEmail: (email: string) => boolean;
export declare const isValidPassword: (password: string) => boolean;
export declare const isValidPhone: (phone: string) => boolean;
export declare const isValidPincode: (pincode: string) => boolean;
export declare const validateRegistration: (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
export declare const validateLogin: (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
export declare const validateProfileUpdate: (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
export declare const validatePasswordReset: (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
export declare const validateNewPassword: (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
export declare const validateNGORegistration: (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
export declare const validateNGOUpdate: (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
export declare const validateDonation: (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
export declare const validateNGOVerification: (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
export declare const validateNGORejection: (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
export declare const validateBadgeUpdate: (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
//# sourceMappingURL=validation.d.ts.map