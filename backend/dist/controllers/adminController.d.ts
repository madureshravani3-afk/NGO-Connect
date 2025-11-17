import { Request, Response } from 'express';
export declare const getPendingNGOs: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getNGODetails: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const verifyNGO: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const rejectNGO: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getVerificationStats: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateNGOBadge: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const seedDatabase: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getUsers: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const suspendUser: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const activateUser: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getAnalytics: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const exportAnalytics: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=adminController.d.ts.map