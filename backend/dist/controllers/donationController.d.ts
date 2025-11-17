import { Request, Response } from 'express';
export declare const createDonation: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getDonorDonations: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getDonationById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateDonation: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateDonationStatus: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getDonationTimeline: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getAvailableDonations: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getDonationCategories: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getNearbyDonations: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const deleteDonation: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const acceptDonation: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const rejectDonation: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=donationController.d.ts.map