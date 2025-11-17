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
exports.NGO = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const NGOSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
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
                type: mongoose_1.Schema.Types.ObjectId,
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
        type: mongoose_1.Schema.Types.ObjectId,
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
NGOSchema.index({ userId: 1 });
NGOSchema.index({ registrationNumber: 1 });
NGOSchema.index({ verificationStatus: 1 });
NGOSchema.index({ categories: 1 });
NGOSchema.index({ 'verificationStatus': 1, 'categories': 1 });
NGOSchema.pre('save', function (next) {
    if (this.categories.length === 0) {
        next(new Error('At least one category must be selected'));
    }
    else {
        next();
    }
});
exports.NGO = mongoose_1.default.model('NGO', NGOSchema);
//# sourceMappingURL=NGO.js.map