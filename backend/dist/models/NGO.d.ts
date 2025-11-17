import mongoose, { Document } from 'mongoose';
export interface INGO extends Document {
    userId: mongoose.Types.ObjectId;
    organizationName: string;
    registrationNumber: string;
    categories: ('food' | 'clothing' | 'education' | 'healthcare' | 'books' | 'electronics')[];
    documents: {
        type: string;
        filename: string;
        fileId: mongoose.Types.ObjectId;
    }[];
    verificationStatus: 'pending' | 'verified' | 'rejected';
    verifiedBy?: mongoose.Types.ObjectId;
    verificationDate?: Date;
    rejectionReason?: string;
    badge?: string;
    pickupService: boolean;
    serviceRadius?: number;
    description?: string;
    website?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const NGO: mongoose.Model<INGO, {}, {}, {}, mongoose.Document<unknown, {}, INGO, {}, {}> & INGO & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=NGO.d.ts.map