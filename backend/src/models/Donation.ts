import mongoose, { Document, Schema } from 'mongoose';

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

const DonationSchema = new Schema<IDonation>({
  donorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Donor ID is required']
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  category: {
    type: String,
    enum: ['food', 'clothing', 'books', 'electronics', 'financial', 'other'],
    required: [true, 'Category is required']
  },
  quantity: {
    type: String,
    trim: true,
    maxlength: [100, 'Quantity description cannot exceed 100 characters']
  },
  images: [{
    type: String,
    validate: {
      validator: function(v: string) {
        return mongoose.Types.ObjectId.isValid(v);
      },
      message: 'Invalid image file ID'
    }
  }],
  location: {
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
      maxlength: [300, 'Address cannot exceed 300 characters']
    },
    coordinates: {
      lat: {
        type: Number,
        required: [true, 'Latitude is required'],
        min: [-90, 'Latitude must be between -90 and 90'],
        max: [90, 'Latitude must be between -90 and 90']
      },
      lng: {
        type: Number,
        required: [true, 'Longitude is required'],
        min: [-180, 'Longitude must be between -180 and 180'],
        max: [180, 'Longitude must be between -180 and 180']
      }
    }
  },
  pickupOption: {
    type: String,
    enum: ['pickup', 'dropoff', 'both'],
    required: [true, 'Pickup option is required'],
    default: 'both'
  },
  foodExpiry: {
    type: Date,
    validate: {
      validator: function(this: IDonation, value: Date) {
        if (this.category === 'food') {
          if (!value) return false;
          const now = new Date();
          const minExpiry = new Date(now.getTime() + (3 * 60 * 60 * 1000)); // 3 hours from now
          return value > minExpiry; // Must be MORE than 3 hours from now
        }
        return true;
      },
      message: 'Food expiry date must be more than 3 hours from now'
    }
  },
  status: {
    type: String,
    enum: ['available', 'accepted', 'collected', 'completed', 'cancelled'],
    default: 'available',
    required: true
  },
  acceptedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  acceptedAt: {
    type: Date
  },
  collectedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  cancelledAt: {
    type: Date
  },
  cancellationReason: {
    type: String,
    maxlength: [500, 'Cancellation reason cannot exceed 500 characters']
  },
  amount: {
    type: Number,
    min: [1, 'Amount must be at least 1'],
    validate: {
      validator: function(this: IDonation, value: number) {
        if (this.category === 'financial') {
          return value && value > 0;
        }
        return true;
      },
      message: 'Financial donations must have a valid amount'
    }
  },
  paymentId: {
    type: String,
    trim: true
  },
  urgency: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  }
}, {
  timestamps: true
});

// Indexes for performance optimization
DonationSchema.index({ donorId: 1 });
DonationSchema.index({ status: 1 });
DonationSchema.index({ category: 1 });
DonationSchema.index({ 'location.coordinates': '2dsphere' });
DonationSchema.index({ createdAt: -1 });
DonationSchema.index({ foodExpiry: 1 });
DonationSchema.index({ acceptedBy: 1 });
DonationSchema.index({ status: 1, category: 1 });

// Pre-save validation for food expiry
DonationSchema.pre('save', function(next) {
  if (this.category === 'food' && !this.foodExpiry) {
    next(new Error('Food donations must have an expiry date'));
  } else if (this.category === 'financial' && (!this.amount || this.amount <= 0)) {
    next(new Error('Financial donations must have a valid amount'));
  } else {
    next();
  }
});

// Pre-save middleware to set timestamps for status changes
DonationSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    const now = new Date();
    switch (this.status) {
      case 'accepted':
        if (!this.acceptedAt) this.acceptedAt = now;
        break;
      case 'collected':
        if (!this.collectedAt) this.collectedAt = now;
        break;
      case 'completed':
        if (!this.completedAt) this.completedAt = now;
        break;
      case 'cancelled':
        if (!this.cancelledAt) this.cancelledAt = now;
        break;
    }
  }
  next();
});

export const Donation = mongoose.model<IDonation>('Donation', DonationSchema);