import { Request, Response } from 'express';
export declare const registerNGO: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getNGOProfile: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateNGOProfile: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getVerificationStatus: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getNGODashboard: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getNGOReports: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const exportNGOReports: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=ngoController.d.ts.map