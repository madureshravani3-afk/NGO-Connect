import mongoose, { Document, Schema } from 'mongoose';

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

const TransactionSchema = new Schema<ITransaction>({
  donationId: {
    type: Schema.Types.ObjectId,
    ref: 'Donation',
    required: [true, 'Donation ID is required']
  },
  donorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Donor ID is required']
  },
  ngoId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'NGO ID is required']
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [1, 'Amount must be at least 1'],
    validate: {
      validator: function(value: number) {
        return Number.isInteger(value * 100); // Ensure amount has at most 2 decimal places
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
    type: Schema.Types.Mixed,
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
      validator: function(this: ITransaction, value: number) {
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

// Indexes for performance optimization
TransactionSchema.index({ donationId: 1 });
TransactionSchema.index({ donorId: 1 });
TransactionSchema.index({ ngoId: 1 });
TransactionSchema.index({ paymentGatewayId: 1 });
TransactionSchema.index({ status: 1 });
TransactionSchema.index({ createdAt: -1 });
TransactionSchema.index({ paymentGateway: 1, status: 1 });

// Pre-save middleware to calculate net amount
TransactionSchema.pre('save', function(next) {
  if (this.isModified('amount') || this.isModified('transactionFee')) {
    this.netAmount = this.amount - (this.transactionFee || 0);
  }
  next();
});

// Pre-save middleware to set processed timestamp
TransactionSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    const now = new Date();
    switch (this.status) {
      case 'completed':
      case 'failed':
        if (!this.processedAt) this.processedAt = now;
        break;
      case 'refunded':
        if (!this.refundedAt) this.refundedAt = now;
        break;
    }
  }
  next();
});

// Method to initiate refund
TransactionSchema.methods.initiateRefund = function(refundAmount?: number, refundId?: string) {
  this.status = 'refunded';
  this.refundAmount = refundAmount || this.amount;
  this.refundId = refundId;
  this.refundedAt = new Date();
  return this.save();
};

// Method to mark as completed
TransactionSchema.methods.markCompleted = function(gatewayResponse?: any) {
  this.status = 'completed';
  this.processedAt = new Date();
  if (gatewayResponse) {
    this.gatewayResponse = gatewayResponse;
  }
  return this.save();
};

// Method to mark as failed
TransactionSchema.methods.markFailed = function(failureReason: string, gatewayResponse?: any) {
  this.status = 'failed';
  this.failureReason = failureReason;
  this.processedAt = new Date();
  if (gatewayResponse) {
    this.gatewayResponse = gatewayResponse;
  }
  return this.save();
};

// Static method to get transaction statistics
TransactionSchema.statics.getStatistics = function(ngoId?: mongoose.Types.ObjectId, startDate?: Date, endDate?: Date) {
  const matchStage: any = { status: 'completed' };
  
  if (ngoId) {
    matchStage.ngoId = ngoId;
  }
  
  if (startDate || endDate) {
    matchStage.createdAt = {};
    if (startDate) matchStage.createdAt.$gte = startDate;
    if (endDate) matchStage.createdAt.$lte = endDate;
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

export const Transaction = mongoose.model<ITransaction>('Transaction', TransactionSchema);