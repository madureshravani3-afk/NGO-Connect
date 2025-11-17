import mongoose, { Document } from 'mongoose';
export interface IUser extends Document {
    email: string;
    password: string;
    role: 'donor' | 'ngo' | 'admin';
    profile: {
        firstName: string;
        lastName: string;
        phone?: string;
        address?: {
            street?: string;
            city?: string;
            state?: string;
            pincode?: string;
            coordinates?: {
                lat: number;
                lng: number;
            };
        };
    };
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
}
export declare const User: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, {}> & IUser & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=User.d.ts.map