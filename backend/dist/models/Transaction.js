"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transaction = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const TransactionSchema = new mongoose_1.Schema({
    donationId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Donation',
        required: [true, 'Donation ID is required']
    },
    donorId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Donor ID is required']
    },
    ngoId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'NGO ID is required']
    },
    amount: {
        type: Number,
        required: [true, 'Amount is required'],
        min: [1, 'Amount must be at least 1'],
        validate: {
            validator: function (value) {
                return Number.isInteger(value * 100);
            },
            message: 'Amount must have at most 2 decimal places'
        }
    },
    currency: {
        type: String,
        required: [true, 'Currency is required'],
        default: 'INR',
        uppercase: true,
        enum: ['INR', 'USD', 'EUR', 'GBP']
    },
    paymentGatewayId: {
        type: String,
        required: [true, 'Payment gateway ID is required'],
        trim: true
    },
    paymentGateway: {
        type: String,
        enum: ['razorpay', 'stripe', 'paytm'],
        required: [true, 'Payment gateway is required']
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'],
        default: 'pending',
        required: true
    },
    paymentMethod: {
        type: String,
        required: [true, 'Payment method is required'],
        trim: true,
        maxlength: [50, 'Payment method cannot exceed 50 characters']
    },
    transactionFee: {
        type: Number,
        min: [0, 'Transaction fee cannot be negative'],
        default: 0
    },
    netAmount: {
        type: Number,
        required: [true, 'Net amount is required'],
        min: [0, 'Net amount cannot be negative']
    },
    gatewayResponse: {
        type: mongoose_1.Schema.Types.Mixed,
        default: {}
    },
    failureReason: {
        type: String,
        trim: true,
        maxlength: [500, 'Failure reason cannot exceed 500 characters']
    },
    refundId: {
        type: String,
        trim: true
    },
    refundAmount: {
        type: Number,
        min: [0, 'Refund amount cannot be negative'],
        validate: {
            validator: function (value) {
                if (value !== undefined && value !== null) {
                    return value <= this.amount;
                }
                return true;
            },
            message: 'Refund amount cannot exceed original transaction amount'
        }
    },
    refundedAt: {
        type: Date
    },
    processedAt: {
        type: Date
    }
}, {
    timestamps: true
});
TransactionSchema.index({ donationId: 1 });
TransactionSchema.index({ donorId: 1 });
TransactionSchema.index({ ngoId: 1 });
TransactionSchema.index({ paymentGatewayId: 1 });
TransactionSchema.index({ status: 1 });
TransactionSchema.index({ createdAt: -1 });
TransactionSchema.index({ paymentGateway: 1, status: 1 });
TransactionSchema.pre('save', function (next) {
    if (this.isModified('amount') || this.isModified('transactionFee')) {
        this.netAmount = this.amount - (this.transactionFee || 0);
    }
    next();
});
TransactionSchema.pre('save', function (next) {
    if (this.isModified('status')) {
        const now = new Date();
        switch (this.status) {
            case 'completed':
            case 'failed':
                if (!this.processedAt)
                    this.processedAt = now;
                break;
            case 'refunded':
                if (!this.refundedAt)
                    this.refundedAt = now;
                break;
        }
    }
    next();
});
TransactionSchema.methods.initiateRefund = function (refundAmount, refundId) {
    this.status = 'refunded';
    this.refundAmount = refundAmount || this.amount;
    this.refundId = refundId;
    this.refundedAt = new Date();
    return this.save();
};
TransactionSchema.methods.markCompleted = function (gatewayResponse) {
    this.status = 'completed';
    this.processedAt = new Date();
    if (gatewayResponse) {
        this.gatewayResponse = gatewayResponse;
    }
    return this.save();
};
TransactionSchema.methods.markFailed = function (failureReason, gatewayResponse) {
    this.status = 'failed';
    this.failureReason = failureReason;
    this.processedAt = new Date();
    if (gatewayResponse) {
        this.gatewayResponse = gatewayResponse;
    }
    return this.save();
};
TransactionSchema.statics.getStatistics = function (ngoId, startDate, endDate) {
    const matchStage = { status: 'completed' };
    if (ngoId) {
        matchStage.ngoId = ngoId;
    }
    if (startDate || endDate) {
        matchStage.createdAt = {};
        if (startDate)
            matchStage.createdAt.$gte = startDate;
        if (endDate)
            matchStage.createdAt.$lte = endDate;
    }
    return this.aggregate([
        { $match: matchStage },
        {
            $group: {
                _id: null,
                totalAmount: { $sum: '$amount' },
                totalNetAmount: { $sum: '$netAmount' },
                totalTransactions: { $sum: 1 },
                averageAmount: { $avg: '$amount' }
            }
        }
    ]);
};
exports.Transaction = mongoose_1.default.model('Transaction', TransactionSchema);
//# sourceMappingURL=Transaction.js.map