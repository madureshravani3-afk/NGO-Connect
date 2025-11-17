import multer from 'multer';
import { GridFSBucket } from 'mongodb';
import { Request, Response, NextFunction } from 'express';
export declare const initGridFS: () => void;
export declare const getGridFSBucket: () => GridFSBucket;
export declare const upload: multer.Multer;
export declare const uploadDocuments: multer.Multer;
export declare const uploadToGridFS: (files: Express.Multer.File[]) => Promise<string[]>;
export declare const getFileFromGridFS: (fileId: string) => Promise<{
    stream: any;
    metadata: any;
}>;
export declare const deleteFileFromGridFS: (fileId: string) => Promise<void>;
export declare const handleUploadError: (err: any, req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>>;
//# sourceMappingURL=upload.d.ts.map