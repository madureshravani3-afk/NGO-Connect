import mongoose, { Document } from 'mongoose';
export interface ITransaction extends Document {
    donationId: mongoose.Types.ObjectId;
    donorId: mongoose.Types.ObjectId;
    ngoId: mongoose.Types.ObjectId;
    amount: number;
    currency: string;
    paymentGatewayId: string;
    paymentGateway: 'razorpay' | 'stripe' | 'paytm';
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled';
    paymentMethod: string;
    transactionFee?: number;
    netAmount: number;
    gatewayResponse?: any;
    failureReason?: string;
    refundId?: string;
    refundAmount?: number;
    refundedAt?: Date;
    processedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Transaction: mongoose.Model<ITransaction, {}, {}, {}, mongoose.Document<unknown, {}, ITransaction, {}, {}> & ITransaction & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Transaction.d.ts.map