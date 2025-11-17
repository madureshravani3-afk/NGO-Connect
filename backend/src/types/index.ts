export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: string;
  };
  timestamp: string;
}

export interface User {
  _id: string;
  email: string;
  role: 'donor' | 'ngo' | 'admin';
  profile: {
    firstName: string;
    lastName: string;
    phone: string;
    address: {
      street: string;
      city: string;
      state: string;
      pincode: string;
      coordinates: {
        lat: number;
        lng: number;
      };
    };
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface NGO {
  _id: string;
  userId: string;
  organizationName: string;
  registrationNumber: string;
  categories: string[];
  documents: Array<{
    type: string;
    filename: string;
    fileId: string;
  }>;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  verifiedBy?: string;
  verificationDate?: Date;
  badge?: string;
  pickupService: boolean;
  serviceRadius: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Donation {
  _id: string;
  donorId: string;
  title: string;
  description: string;
  category: 'food' | 'clothing' | 'books' | 'electronics' | 'financial';
  quantity: string;
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
  acceptedBy?: string;
  acceptedAt?: Date;
  collectedAt?: Date;
  completedAt?: Date;
  amount?: number;
  paymentId?: string;
  createdAt: Date;
  updatedAt: Date;
}