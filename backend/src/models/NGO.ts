import mongoose, { Document, Schema } from 'mongoose';

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

const NGOSchema = new Schema<INGO>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    unique: true
  },
  organizationName: {
    type: String,
    required: [true, 'Organization name is required'],
    trim: true,
    maxlength: [200, 'Organization name cannot exceed 200 characters']
  },
  registrationNumber: {
    type: String,
    required: [true, 'Registration number is required'],
    unique: true,
    trim: true,
    uppercase: true,
    maxlength: [50, 'Registration number cannot exceed 50 characters']
  },
  categories: [{
    type: String,
    enum: ['food', 'clothing', 'education', 'healthcare', 'books', 'electronics'],
    required: true
  }],
  documents: [{
    type: {
      type: String,
      required: [true, 'Document type is required'],
      enum: ['registration_certificate', 'tax_exemption', 'pan_card', 'address_proof', 'other']
    },
    filename: {
      type: String,
      required: [true, 'Document filename is required']
    },
    fileId: {
      type: Schema.Types.ObjectId,
      required: [true, 'File ID is required']
    }
  }],
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending',
    required: true
  },
  verifiedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  verificationDate: {
    type: Date
  },
  rejectionReason: {
    type: String,
    maxlength: [500, 'Rejection reason cannot exceed 500 characters']
  },
  badge: {
    type: String,
    enum: ['bronze', 'silver', 'gold', 'platinum'],
    default: 'bronze'
  },
  pickupService: {
    type: Boolean,
    default: false
  },
  serviceRadius: {
    type: Number,
    min: [1, 'Service radius must be at least 1 km'],
    max: [100, 'Service radius cannot exceed 100 km'],
    default: 10
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  website: {
    type: String,
    match: [/^https?:\/\/.+/, 'Please enter a valid website URL']
  }
}, {
  timestamps: true
});

// Indexes for performance optimization
NGOSchema.index({ userId: 1 });
NGOSchema.index({ registrationNumber: 1 });
NGOSchema.index({ verificationStatus: 1 });
NGOSchema.index({ categories: 1 });
NGOSchema.index({ 'verificationStatus': 1, 'categories': 1 });

// Validation to ensure at least one category is selected
NGOSchema.pre('save', function(next) {
  if (this.categories.length === 0) {
    next(new Error('At least one category must be selected'));
  } else {
    next();
  }
});

export const NGO = mongoose.model<INGO>('NGO', NGOSchema);