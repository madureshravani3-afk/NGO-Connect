"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rejectDonation = exports.acceptDonation = exports.deleteDonation = exports.getNearbyDonations = exports.getDonationCategories = exports.getAvailableDonations = exports.getDonationTimeline = exports.updateDonationStatus = exports.updateDonation = exports.getDonationById = exports.getDonorDonations = exports.createDonation = void 0;
const Donation_1 = require("../models/Donation");
const upload_1 = require("../middleware/upload");
const notificationService_1 = require("../services/notificationService");
const mongoose_1 = __importDefault(require("mongoose"));
const createDonation = async (req, res) => {
    try {
        console.log('Received donation request body:', req.body);
        console.log('Received files:', req.files);
        const { title, description, category, quantity, location, pickupOption, foodExpiry, amount, urgency = 'medium' } = req.body;
        const donorId = req.user._id;
        let imageIds = [];
        if (req.files && Array.isArray(req.files) && req.files.length > 0) {
            try {
                imageIds = await (0, upload_1.uploadToGridFS)(req.files);
            }
            catch (uploadError) {
                return res.status(500).json({
                    success: false,
                    error: {
                        code: 'IMAGE_UPLOAD_FAILED',
                        message: 'Failed to upload images',
                        details: process.env.NODE_ENV === 'development' ? uploadError.message : undefined
                    },
                    timestamp: new Date().toISOString()
                });
            }
        }
        console.log('Location data type:', typeof location);
        console.log('Location data value:', location);
        let locationData;
        if (typeof location === 'string') {
            try {
                locationData = JSON.parse(location);
                console.log('Parsed location data:', locationData);
            }
            catch (error) {
                console.log('Failed to parse location JSON:', error);
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'INVALID_LOCATION_DATA',
                        message: 'Invalid location data format',
                        details: 'Location data must be valid JSON'
                    },
                    timestamp: new Date().toISOString()
                });
            }
        }
        else {
            locationData = location;
            console.log('Location data is object:', locationData);
        }
        if (!locationData || !locationData.address || !locationData.coordinates) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Please fix the following validation errors',
                    details: [
                        { field: 'location.address', message: 'Address is required' },
                        { field: 'location.coordinates', message: 'Coordinates are required' }
                    ]
                },
                timestamp: new Date().toISOString()
            });
        }
        if (!locationData.coordinates.lat || !locationData.coordinates.lng) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Please fix the following validation errors',
                    details: [
                        { field: 'location.coordinates', message: 'Coordinates are required' }
                    ]
                },
                timestamp: new Date().toISOString()
            });
        }
        const donationData = {
            donorId: donorId,
            title: title?.trim(),
            description: description?.trim(),
            category,
            quantity: quantity?.trim(),
            images: imageIds,
            location: {
                address: locationData.address.trim(),
                coordinates: {
                    lat: parseFloat(locationData.coordinates.lat),
                    lng: parseFloat(locationData.coordinates.lng)
                }
            },
            pickupOption,
            urgency,
            status: 'available'
        };
        if (category === 'food') {
            if (!foodExpiry) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Please fix the following validation errors',
                        details: [
                            { field: 'foodExpiry', message: 'Food expiry date is required for food donations' }
                        ]
                    },
                    timestamp: new Date().toISOString()
                });
            }
            const expiryDate = new Date(foodExpiry);
            const now = new Date();
            const minExpiry = new Date(now.getTime() + (3 * 60 * 60 * 1000));
            if (expiryDate <= minExpiry) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Please fix the following validation errors',
                        details: [
                            { field: 'foodExpiry', message: 'Food expiry date must be more than 3 hours from now' }
                        ]
                    },
                    timestamp: new Date().toISOString()
                });
            }
            donationData.foodExpiry = expiryDate;
        }
        if (category === 'financial' && amount) {
            donationData.amount = parseFloat(amount);
        }
        const donation = new Donation_1.Donation(donationData);
        await donation.save();
        await donation.populate('donorId', 'profile.firstName profile.lastName email');
        return res.status(201).json({
            success: true,
            message: 'Donation created successfully',
            data: {
                donation
            },
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        if (req.files && Array.isArray(req.files) && req.files.length > 0) {
            try {
                const imageIds = await (0, upload_1.uploadToGridFS)(req.files);
                await Promise.all(imageIds.map(id => (0, upload_1.deleteFileFromGridFS)(id)));
            }
            catch (cleanupError) {
                console.error('Failed to cleanup uploaded images:', cleanupError);
            }
        }
        if (error instanceof mongoose_1.default.Error.ValidationError) {
            const validationErrors = Object.values(error.errors).map(err => ({
                field: err.path,
                message: err.message
            }));
            return res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Donation validation failed',
                    details: validationErrors
                },
                timestamp: new Date().toISOString()
            });
        }
        return res.status(500).json({
            success: false,
            error: {
                code: 'DONATION_CREATION_FAILED',
                message: 'Failed to create donation',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            timestamp: new Date().toISOString()
        });
    }
};
exports.createDonation = createDonation;
const getDonorDonations = async (req, res) => {
    try {
        const donorId = req.user._id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const status = req.query.status;
        const category = req.query.category;
        const filter = { donorId };
        if (status) {
            filter.status = status;
        }
        if (category) {
            filter.category = category;
        }
        const skip = (page - 1) * limit;
        const donations = await Donation_1.Donation.find(filter)
            .populate('donorId', 'profile.firstName profile.lastName email')
            .populate('acceptedBy', 'profile.firstName profile.lastName email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        const totalCount = await Donation_1.Donation.countDocuments(filter);
        const totalPages = Math.ceil(totalCount / limit);
        return res.status(200).json({
            success: true,
            message: 'Donations retrieved successfully',
            data: {
                donations,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalCount,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1
                }
            },
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: {
                code: 'DONATIONS_FETCH_FAILED',
                message: 'Failed to retrieve donations',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            timestamp: new Date().toISOString()
        });
    }
};
exports.getDonorDonations = getDonorDonations;
const getDonationById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_DONATION_ID',
                    message: 'Invalid donation ID format',
                    details: 'Please provide a valid donation ID'
                },
                timestamp: new Date().toISOString()
            });
        }
        const donation = await Donation_1.Donation.findById(id)
            .populate('donorId', 'profile.firstName profile.lastName email profile.phone')
            .populate('acceptedBy', 'profile.firstName profile.lastName email profile.phone');
        if (!donation) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'DONATION_NOT_FOUND',
                    message: 'Donation not found',
                    details: 'The requested donation does not exist'
                },
                timestamp: new Date().toISOString()
            });
        }
        return res.status(200).json({
            success: true,
            message: 'Donation retrieved successfully',
            data: {
                donation
            },
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: {
                code: 'DONATION_FETCH_FAILED',
                message: 'Failed to retrieve donation',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            timestamp: new Date().toISOString()
        });
    }
};
exports.getDonationById = getDonationById;
const updateDonation = async (req, res) => {
    try {
        const { id } = req.params;
        const donorId = req.user._id;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_DONATION_ID',
                    message: 'Invalid donation ID format',
                    details: 'Please provide a valid donation ID'
                },
                timestamp: new Date().toISOString()
            });
        }
        const donation = await Donation_1.Donation.findById(id);
        if (!donation) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'DONATION_NOT_FOUND',
                    message: 'Donation not found',
                    details: 'The requested donation does not exist'
                },
                timestamp: new Date().toISOString()
            });
        }
        if (donation.donorId.toString() !== donorId.toString()) {
            return res.status(403).json({
                success: false,
                error: {
                    code: 'UNAUTHORIZED_UPDATE',
                    message: 'Unauthorized to update this donation',
                    details: 'You can only update your own donations'
                },
                timestamp: new Date().toISOString()
            });
        }
        if (donation.status !== 'available') {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'DONATION_NOT_EDITABLE',
                    message: 'Donation cannot be updated',
                    details: 'Only available donations can be updated'
                },
                timestamp: new Date().toISOString()
            });
        }
        const { title, description, quantity, location, pickupOption, foodExpiry, urgency } = req.body;
        if (title !== undefined)
            donation.title = title.trim();
        if (description !== undefined)
            donation.description = description?.trim();
        if (quantity !== undefined)
            donation.quantity = quantity?.trim();
        if (pickupOption !== undefined)
            donation.pickupOption = pickupOption;
        if (urgency !== undefined)
            donation.urgency = urgency;
        if (location) {
            if (location.address)
                donation.location.address = location.address.trim();
            if (location.coordinates) {
                donation.location.coordinates.lat = parseFloat(location.coordinates.lat);
                donation.location.coordinates.lng = parseFloat(location.coordinates.lng);
            }
        }
        if (donation.category === 'food' && foodExpiry !== undefined) {
            donation.foodExpiry = foodExpiry ? new Date(foodExpiry) : undefined;
        }
        await donation.save();
        await donation.populate('donorId', 'profile.firstName profile.lastName email');
        return res.status(200).json({
            success: true,
            message: 'Donation updated successfully',
            data: {
                donation
            },
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        if (error instanceof mongoose_1.default.Error.ValidationError) {
            const validationErrors = Object.values(error.errors).map(err => ({
                field: err.path,
                message: err.message
            }));
            return res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Donation validation failed',
                    details: validationErrors
                },
                timestamp: new Date().toISOString()
            });
        }
        return res.status(500).json({
            success: false,
            error: {
                code: 'DONATION_UPDATE_FAILED',
                message: 'Failed to update donation',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            timestamp: new Date().toISOString()
        });
    }
};
exports.updateDonation = updateDonation;
const updateDonationStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, cancellationReason } = req.body;
        const userId = req.user._id;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_DONATION_ID',
                    message: 'Invalid donation ID format',
                    details: 'Please provide a valid donation ID'
                },
                timestamp: new Date().toISOString()
            });
        }
        const donation = await Donation_1.Donation.findById(id)
            .populate('donorId', 'profile.firstName profile.lastName email')
            .populate('acceptedBy', 'profile.firstName profile.lastName email');
        if (!donation) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'DONATION_NOT_FOUND',
                    message: 'Donation not found',
                    details: 'The requested donation does not exist'
                },
                timestamp: new Date().toISOString()
            });
        }
        const validStatuses = ['available', 'accepted', 'collected', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_STATUS',
                    message: 'Invalid status',
                    details: `Status must be one of: ${validStatuses.join(', ')}`
                },
                timestamp: new Date().toISOString()
            });
        }
        const userRole = req.user.role;
        const userIdStr = userId.toString();
        const isDonor = donation.donorId._id.toString() === userIdStr;
        const isAcceptedNGO = donation.acceptedBy && donation.acceptedBy._id.toString() === userIdStr;
        switch (status) {
            case 'cancelled':
                if (!isDonor) {
                    return res.status(403).json({
                        success: false,
                        error: {
                            code: 'UNAUTHORIZED_CANCELLATION',
                            message: 'Only the donor can cancel this donation',
                            details: 'You are not authorized to cancel this donation'
                        },
                        timestamp: new Date().toISOString()
                    });
                }
                if (['collected', 'completed', 'cancelled'].includes(donation.status)) {
                    return res.status(400).json({
                        success: false,
                        error: {
                            code: 'INVALID_STATUS_TRANSITION',
                            message: 'Cannot cancel donation',
                            details: 'Donation cannot be cancelled in its current status'
                        },
                        timestamp: new Date().toISOString()
                    });
                }
                if (!cancellationReason) {
                    return res.status(400).json({
                        success: false,
                        error: {
                            code: 'CANCELLATION_REASON_REQUIRED',
                            message: 'Cancellation reason is required',
                            details: 'Please provide a reason for cancelling the donation'
                        },
                        timestamp: new Date().toISOString()
                    });
                }
                break;
            case 'accepted':
                if (userRole !== 'ngo') {
                    return res.status(403).json({
                        success: false,
                        error: {
                            code: 'UNAUTHORIZED_ACCEPTANCE',
                            message: 'Only NGOs can accept donations',
                            details: 'You must be an NGO to accept donations'
                        },
                        timestamp: new Date().toISOString()
                    });
                }
                if (donation.status !== 'available') {
                    return res.status(400).json({
                        success: false,
                        error: {
                            code: 'INVALID_STATUS_TRANSITION',
                            message: 'Cannot accept donation',
                            details: 'Only available donations can be accepted'
                        },
                        timestamp: new Date().toISOString()
                    });
                }
                break;
            case 'collected':
                if (!isAcceptedNGO) {
                    return res.status(403).json({
                        success: false,
                        error: {
                            code: 'UNAUTHORIZED_COLLECTION',
                            message: 'Only the accepting NGO can mark as collected',
                            details: 'You are not authorized to update this donation status'
                        },
                        timestamp: new Date().toISOString()
                    });
                }
                if (donation.status !== 'accepted') {
                    return res.status(400).json({
                        success: false,
                        error: {
                            code: 'INVALID_STATUS_TRANSITION',
                            message: 'Cannot mark as collected',
                            details: 'Only accepted donations can be marked as collected'
                        },
                        timestamp: new Date().toISOString()
                    });
                }
                break;
            case 'completed':
                if (!isDonor && !isAcceptedNGO) {
                    return res.status(403).json({
                        success: false,
                        error: {
                            code: 'UNAUTHORIZED_COMPLETION',
                            message: 'Only donor or accepting NGO can mark as completed',
                            details: 'You are not authorized to update this donation status'
                        },
                        timestamp: new Date().toISOString()
                    });
                }
                if (donation.status !== 'collected') {
                    return res.status(400).json({
                        success: false,
                        error: {
                            code: 'INVALID_STATUS_TRANSITION',
                            message: 'Cannot mark as completed',
                            details: 'Only collected donations can be marked as completed'
                        },
                        timestamp: new Date().toISOString()
                    });
                }
                break;
            case 'available':
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'INVALID_STATUS_TRANSITION',
                        message: 'Cannot revert to available status',
                        details: 'Donations cannot be reverted to available status'
                    },
                    timestamp: new Date().toISOString()
                });
            default:
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'INVALID_STATUS',
                        message: 'Invalid status provided',
                        details: `Status must be one of: ${validStatuses.join(', ')}`
                    },
                    timestamp: new Date().toISOString()
                });
        }
        const oldStatus = donation.status;
        donation.status = status;
        if (status === 'accepted') {
            donation.acceptedBy = userId;
        }
        if (status === 'cancelled' && cancellationReason) {
            donation.cancellationReason = cancellationReason.trim();
        }
        await donation.save();
        try {
            if (status === 'accepted') {
                await (0, notificationService_1.sendDonationStatusNotification)({
                    type: 'donation_accepted',
                    recipient: donation.donorId,
                    donation,
                    actor: req.user
                });
            }
            else if (status === 'cancelled') {
                if (donation.acceptedBy) {
                    await (0, notificationService_1.sendDonationStatusNotification)({
                        type: 'donation_cancelled',
                        recipient: donation.acceptedBy,
                        donation,
                        statusChange: {
                            from: oldStatus,
                            to: status,
                            reason: cancellationReason
                        }
                    });
                }
            }
            else if (status === 'completed') {
                await (0, notificationService_1.sendDonationStatusNotification)({
                    type: 'donation_completed',
                    recipient: donation.donorId,
                    donation
                });
                if (donation.acceptedBy && donation.acceptedBy._id.toString() !== donation.donorId._id.toString()) {
                    await (0, notificationService_1.sendDonationStatusNotification)({
                        type: 'donation_completed',
                        recipient: donation.acceptedBy,
                        donation
                    });
                }
            }
            else {
                const recipientId = status === 'collected' ? donation.donorId._id :
                    (donation.acceptedBy ? donation.acceptedBy._id : donation.donorId._id);
                if (recipientId.toString() !== userIdStr) {
                    const recipient = status === 'collected' ? donation.donorId :
                        (donation.acceptedBy || donation.donorId);
                    await (0, notificationService_1.sendDonationStatusNotification)({
                        type: 'donation_status_change',
                        recipient: recipient,
                        donation,
                        statusChange: {
                            from: oldStatus,
                            to: status
                        }
                    });
                }
            }
        }
        catch (notificationError) {
            console.error('Failed to send notification:', notificationError);
        }
        return res.status(200).json({
            success: true,
            message: `Donation status updated to ${status}`,
            data: {
                donation,
                statusChange: {
                    from: oldStatus,
                    to: status,
                    updatedBy: userId,
                    updatedAt: new Date()
                }
            },
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        if (error instanceof mongoose_1.default.Error.ValidationError) {
            const validationErrors = Object.values(error.errors).map(err => ({
                field: err.path,
                message: err.message
            }));
            return res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Status update validation failed',
                    details: validationErrors
                },
                timestamp: new Date().toISOString()
            });
        }
        return res.status(500).json({
            success: false,
            error: {
                code: 'STATUS_UPDATE_FAILED',
                message: 'Failed to update donation status',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            timestamp: new Date().toISOString()
        });
    }
};
exports.updateDonationStatus = updateDonationStatus;
const getDonationTimeline = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_DONATION_ID',
                    message: 'Invalid donation ID format',
                    details: 'Please provide a valid donation ID'
                },
                timestamp: new Date().toISOString()
            });
        }
        const donation = await Donation_1.Donation.findById(id)
            .populate('donorId', 'profile.firstName profile.lastName email')
            .populate('acceptedBy', 'profile.firstName profile.lastName email');
        if (!donation) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'DONATION_NOT_FOUND',
                    message: 'Donation not found',
                    details: 'The requested donation does not exist'
                },
                timestamp: new Date().toISOString()
            });
        }
        const timeline = [
            {
                status: 'available',
                timestamp: donation.createdAt,
                actor: donation.donorId,
                description: 'Donation posted'
            }
        ];
        if (donation.acceptedAt && donation.acceptedBy) {
            timeline.push({
                status: 'accepted',
                timestamp: donation.acceptedAt,
                actor: donation.acceptedBy,
                description: 'Donation accepted by NGO'
            });
        }
        if (donation.collectedAt && donation.acceptedBy) {
            timeline.push({
                status: 'collected',
                timestamp: donation.collectedAt,
                actor: donation.acceptedBy,
                description: 'Donation collected'
            });
        }
        if (donation.completedAt) {
            timeline.push({
                status: 'completed',
                timestamp: donation.completedAt,
                actor: donation.acceptedBy || donation.donorId,
                description: 'Donation completed'
            });
        }
        if (donation.cancelledAt) {
            timeline.push({
                status: 'cancelled',
                timestamp: donation.cancelledAt,
                actor: donation.donorId,
                description: `Donation cancelled${donation.cancellationReason ? `: ${donation.cancellationReason}` : ''}`
            });
        }
        return res.status(200).json({
            success: true,
            message: 'Donation timeline retrieved successfully',
            data: {
                donation: {
                    id: donation._id,
                    title: donation.title,
                    status: donation.status,
                    category: donation.category
                },
                timeline: timeline.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
            },
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: {
                code: 'TIMELINE_FETCH_FAILED',
                message: 'Failed to retrieve donation timeline',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            timestamp: new Date().toISOString()
        });
    }
};
exports.getDonationTimeline = getDonationTimeline;
const getAvailableDonations = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const category = req.query.category;
        const search = req.query.search;
        const urgency = req.query.urgency;
        const lat = parseFloat(req.query.lat);
        const lng = parseFloat(req.query.lng);
        const radius = parseFloat(req.query.radius) || 10;
        const sortBy = req.query.sortBy || 'createdAt';
        const sortOrder = req.query.sortOrder || 'desc';
        const filter = {
            status: 'available'
        };
        if (category) {
            const validCategories = ['food', 'clothing', 'books', 'electronics', 'financial', 'other'];
            if (validCategories.includes(category)) {
                filter.category = category;
            }
        }
        if (urgency) {
            const validUrgencies = ['low', 'medium', 'high'];
            if (validUrgencies.includes(urgency)) {
                filter.urgency = urgency;
            }
        }
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
            filter['location.coordinates'] = {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [lng, lat]
                    },
                    $maxDistance: radius * 1000
                }
            };
        }
        const now = new Date();
        filter.$or = filter.$or || [];
        filter.$or.push({ category: { $ne: 'food' } }, {
            category: 'food',
            foodExpiry: { $gt: now }
        });
        const skip = (page - 1) * limit;
        const sort = {};
        const validSortFields = ['createdAt', 'urgency', 'category', 'title'];
        if (validSortFields.includes(sortBy)) {
            sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
        }
        else {
            sort.createdAt = -1;
        }
        if (sortBy === 'urgency') {
            sort.urgency = sortOrder === 'asc' ? 1 : -1;
            sort.createdAt = -1;
        }
        const donations = await Donation_1.Donation.find(filter)
            .populate('donorId', 'profile.firstName profile.lastName email profile.phone')
            .sort(sort)
            .skip(skip)
            .limit(limit);
        const totalCount = await Donation_1.Donation.countDocuments(filter);
        const totalPages = Math.ceil(totalCount / limit);
        const donationsWithDistance = donations.map(donation => {
            const donationObj = donation.toObject();
            if (!isNaN(lat) && !isNaN(lng)) {
                const donationLat = donation.location.coordinates.lat;
                const donationLng = donation.location.coordinates.lng;
                const distance = calculateDistance(lat, lng, donationLat, donationLng);
                donationObj.distance = Math.round(distance * 100) / 100;
            }
            return donationObj;
        });
        return res.status(200).json({
            success: true,
            message: 'Available donations retrieved successfully',
            data: {
                donations: donationsWithDistance,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalCount,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1
                },
                filters: {
                    category,
                    search,
                    urgency,
                    location: !isNaN(lat) && !isNaN(lng) ? { lat, lng, radius } : null,
                    sortBy,
                    sortOrder
                }
            },
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: {
                code: 'DONATIONS_SEARCH_FAILED',
                message: 'Failed to search donations',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            timestamp: new Date().toISOString()
        });
    }
};
exports.getAvailableDonations = getAvailableDonations;
const getDonationCategories = async (req, res) => {
    try {
        const lat = parseFloat(req.query.lat);
        const lng = parseFloat(req.query.lng);
        const radius = parseFloat(req.query.radius) || 10;
        const baseFilter = {
            status: 'available'
        };
        if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
            baseFilter['location.coordinates'] = {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [lng, lat]
                    },
                    $maxDistance: radius * 1000
                }
            };
        }
        const now = new Date();
        baseFilter.$or = [
            { category: { $ne: 'food' } },
            {
                category: 'food',
                foodExpiry: { $gt: now }
            }
        ];
        const categoryStats = await Donation_1.Donation.aggregate([
            { $match: baseFilter },
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 },
                    urgentCount: {
                        $sum: {
                            $cond: [{ $eq: ['$urgency', 'high'] }, 1, 0]
                        }
                    }
                }
            },
            {
                $project: {
                    category: '$_id',
                    count: 1,
                    urgentCount: 1,
                    _id: 0
                }
            },
            { $sort: { count: -1 } }
        ]);
        const totalCount = await Donation_1.Donation.countDocuments(baseFilter);
        return res.status(200).json({
            success: true,
            message: 'Donation categories retrieved successfully',
            data: {
                categories: categoryStats,
                totalCount,
                location: !isNaN(lat) && !isNaN(lng) ? { lat, lng, radius } : null
            },
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: {
                code: 'CATEGORIES_FETCH_FAILED',
                message: 'Failed to retrieve donation categories',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            timestamp: new Date().toISOString()
        });
    }
};
exports.getDonationCategories = getDonationCategories;
const getNearbyDonations = async (req, res) => {
    try {
        const lat = parseFloat(req.query.lat);
        const lng = parseFloat(req.query.lng);
        const radius = parseFloat(req.query.radius) || 5;
        const limit = parseInt(req.query.limit) || 20;
        const category = req.query.category;
        if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_COORDINATES',
                    message: 'Invalid coordinates provided',
                    details: 'Latitude must be between -90 and 90, longitude between -180 and 180'
                },
                timestamp: new Date().toISOString()
            });
        }
        const filter = {
            status: 'available',
            'location.coordinates': {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [lng, lat]
                    },
                    $maxDistance: radius * 1000
                }
            }
        };
        if (category) {
            const validCategories = ['food', 'clothing', 'books', 'electronics', 'financial', 'other'];
            if (validCategories.includes(category)) {
                filter.category = category;
            }
        }
        const now = new Date();
        filter.$or = [
            { category: { $ne: 'food' } },
            {
                category: 'food',
                foodExpiry: { $gt: now }
            }
        ];
        const donations = await Donation_1.Donation.find(filter)
            .populate('donorId', 'profile.firstName profile.lastName email')
            .limit(limit)
            .sort({ createdAt: -1 });
        const donationsWithDistance = donations.map(donation => {
            const donationObj = donation.toObject();
            const donationLat = donation.location.coordinates.lat;
            const donationLng = donation.location.coordinates.lng;
            const distance = calculateDistance(lat, lng, donationLat, donationLng);
            donationObj.distance = Math.round(distance * 100) / 100;
            return donationObj;
        });
        return res.status(200).json({
            success: true,
            message: 'Nearby donations retrieved successfully',
            data: {
                donations: donationsWithDistance,
                searchLocation: { lat, lng, radius },
                totalFound: donations.length
            },
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: {
                code: 'NEARBY_SEARCH_FAILED',
                message: 'Failed to search nearby donations',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            timestamp: new Date().toISOString()
        });
    }
};
exports.getNearbyDonations = getNearbyDonations;
const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};
const deleteDonation = async (req, res) => {
    try {
        const { id } = req.params;
        const donorId = req.user._id;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_DONATION_ID',
                    message: 'Invalid donation ID format',
                    details: 'Please provide a valid donation ID'
                },
                timestamp: new Date().toISOString()
            });
        }
        const donation = await Donation_1.Donation.findById(id);
        if (!donation) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'DONATION_NOT_FOUND',
                    message: 'Donation not found',
                    details: 'The requested donation does not exist'
                },
                timestamp: new Date().toISOString()
            });
        }
        if (donation.donorId.toString() !== donorId.toString()) {
            return res.status(403).json({
                success: false,
                error: {
                    code: 'UNAUTHORIZED_DELETE',
                    message: 'Unauthorized to delete this donation',
                    details: 'You can only delete your own donations'
                },
                timestamp: new Date().toISOString()
            });
        }
        if (donation.status !== 'available') {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'DONATION_NOT_DELETABLE',
                    message: 'Donation cannot be deleted',
                    details: 'Only available donations can be deleted'
                },
                timestamp: new Date().toISOString()
            });
        }
        if (donation.images && donation.images.length > 0) {
            try {
                await Promise.all(donation.images.map(imageId => (0, upload_1.deleteFileFromGridFS)(imageId)));
            }
            catch (imageDeleteError) {
                console.error('Failed to delete images:', imageDeleteError);
            }
        }
        await Donation_1.Donation.findByIdAndDelete(id);
        return res.status(200).json({
            success: true,
            message: 'Donation deleted successfully',
            data: {
                deletedDonationId: id
            },
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: {
                code: 'DONATION_DELETE_FAILED',
                message: 'Failed to delete donation',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            timestamp: new Date().toISOString()
        });
    }
};
exports.deleteDonation = deleteDonation;
const acceptDonation = async (req, res) => {
    try {
        const user = req.user;
        const { id } = req.params;
        if (!user || user.role !== 'ngo') {
            return res.status(403).json({
                success: false,
                error: {
                    code: 'FORBIDDEN',
                    message: 'Access denied',
                    details: 'Only NGOs can accept donations'
                },
                timestamp: new Date().toISOString()
            });
        }
        const donation = await Donation_1.Donation.findById(id);
        if (!donation) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'DONATION_NOT_FOUND',
                    message: 'Donation not found'
                },
                timestamp: new Date().toISOString()
            });
        }
        if (donation.status !== 'available') {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'DONATION_NOT_AVAILABLE',
                    message: 'Donation is not available for acceptance'
                },
                timestamp: new Date().toISOString()
            });
        }
        donation.status = 'accepted';
        donation.acceptedBy = user._id;
        donation.acceptedAt = new Date();
        await donation.save();
        return res.json({
            success: true,
            data: { donation },
            message: 'Donation accepted successfully',
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('Accept donation error:', error);
        return res.status(500).json({
            success: false,
            error: {
                code: 'ACCEPT_ERROR',
                message: 'Failed to accept donation',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            timestamp: new Date().toISOString()
        });
    }
};
exports.acceptDonation = acceptDonation;
const rejectDonation = async (req, res) => {
    try {
        const user = req.user;
        const { id } = req.params;
        const { reason } = req.body;
        if (!user || user.role !== 'ngo') {
            return res.status(403).json({
                success: false,
                error: {
                    code: 'FORBIDDEN',
                    message: 'Access denied',
                    details: 'Only NGOs can reject donations'
                },
                timestamp: new Date().toISOString()
            });
        }
        const donation = await Donation_1.Donation.findById(id);
        if (!donation) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'DONATION_NOT_FOUND',
                    message: 'Donation not found'
                },
                timestamp: new Date().toISOString()
            });
        }
        if (donation.status !== 'available') {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'DONATION_NOT_AVAILABLE',
                    message: 'Donation is not available for rejection'
                },
                timestamp: new Date().toISOString()
            });
        }
        return res.json({
            success: true,
            message: 'Donation rejected successfully',
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('Reject donation error:', error);
        return res.status(500).json({
            success: false,
            error: {
                code: 'REJECT_ERROR',
                message: 'Failed to reject donation',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            timestamp: new Date().toISOString()
        });
    }
};
exports.rejectDonation = rejectDonation;
//# sourceMappingURL=donationController.js.map