import mongoose, { Document } from 'mongoose';
export interface IDonation extends Document {
    donorId: mongoose.Types.ObjectId;
    title: string;
    description?: string;
    category: 'food' | 'clothing' | 'books' | 'electronics' | 'financial' | 'other';
    quantity?: string;
    images: string[];
    location: {
        address: string;
        coordinates: {
            lat: number;
            lng: number;
        };
    };
    pickupOption: 'pickup' | 'dropoff' | 'both';
    foodExpiry?: Date;
    status: 'available' | 'accepted' | 'collected' | 'completed' | 'cancelled';
    acceptedBy?: mongoose.Types.ObjectId;
    acceptedAt?: Date;
    collectedAt?: Date;
    completedAt?: Date;
    cancelledAt?: Date;
    cancellationReason?: string;
    amount?: number;
    paymentId?: string;
    urgency: 'low' | 'medium' | 'high';
    createdAt: Date;
    updatedAt: Date;
}
export declare const Donation: mongoose.Model<IDonation, {}, {}, {}, mongoose.Document<unknown, {}, IDonation, {}, {}> & IDonation & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Donation.d.ts.map