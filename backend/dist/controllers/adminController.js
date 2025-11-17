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
exports.exportAnalytics = exports.getAnalytics = exports.activateUser = exports.suspendUser = exports.getUsers = exports.seedDatabase = exports.updateNGOBadge = exports.getVerificationStats = exports.rejectNGO = exports.verifyNGO = exports.getNGODetails = exports.getPendingNGOs = void 0;
const NGO_1 = require("../models/NGO");
const User_1 = require("../models/User");
const emailService_1 = require("../services/emailService");
const getPendingNGOs = async (req, res) => {
    try {
        const user = req.user;
        if (!user || user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: {
                    code: 'FORBIDDEN',
                    message: 'Access denied',
                    details: 'Only administrators can access this resource'
                },
                timestamp: new Date().toISOString()
            });
        }
        const { page = 1, limit = 10, status = 'pending' } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const filter = {};
        if (status && status !== 'all') {
            filter.verificationStatus = status;
        }
        const ngos = await NGO_1.NGO.find(filter)
            .populate('userId', 'email profile createdAt')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));
        const total = await NGO_1.NGO.countDocuments(filter);
        return res.json({
            success: true,
            data: {
                ngos,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total,
                    pages: Math.ceil(total / Number(limit))
                }
            },
            message: 'NGO verifications retrieved successfully',
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('Get pending NGOs error:', error);
        return res.status(500).json({
            success: false,
            error: {
                code: 'FETCH_ERROR',
                message: 'Failed to retrieve NGO verifications',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            timestamp: new Date().toISOString()
        });
    }
};
exports.getPendingNGOs = getPendingNGOs;
const getNGODetails = async (req, res) => {
    try {
        const user = req.user;
        const { ngoId } = req.params;
        if (!user || user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: {
                    code: 'FORBIDDEN',
                    message: 'Access denied',
                    details: 'Only administrators can access this resource'
                },
                timestamp: new Date().toISOString()
            });
        }
        const ngo = await NGO_1.NGO.findById(ngoId)
            .populate('userId', 'email profile createdAt')
            .populate('verifiedBy', 'profile.firstName profile.lastName');
        if (!ngo) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'NGO_NOT_FOUND',
                    message: 'NGO not found',
                    details: 'The requested NGO does not exist'
                },
                timestamp: new Date().toISOString()
            });
        }
        return res.json({
            success: true,
            data: { ngo },
            message: 'NGO details retrieved successfully',
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('Get NGO details error:', error);
        return res.status(500).json({
            success: false,
            error: {
                code: 'FETCH_ERROR',
                message: 'Failed to retrieve NGO details',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            timestamp: new Date().toISOString()
        });
    }
};
exports.getNGODetails = getNGODetails;
const verifyNGO = async (req, res) => {
    try {
        const user = req.user;
        const { ngoId } = req.params;
        const { badge = 'bronze' } = req.body;
        if (!user || user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: {
                    code: 'FORBIDDEN',
                    message: 'Access denied',
                    details: 'Only administrators can verify NGOs'
                },
                timestamp: new Date().toISOString()
            });
        }
        const ngo = await NGO_1.NGO.findById(ngoId).populate('userId', 'email profile');
        if (!ngo) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'NGO_NOT_FOUND',
                    message: 'NGO not found',
                    details: 'The requested NGO does not exist'
                },
                timestamp: new Date().toISOString()
            });
        }
        if (ngo.verificationStatus === 'verified') {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'ALREADY_VERIFIED',
                    message: 'NGO is already verified',
                    details: 'This NGO has already been verified'
                },
                timestamp: new Date().toISOString()
            });
        }
        ngo.verificationStatus = 'verified';
        ngo.verifiedBy = user._id;
        ngo.verificationDate = new Date();
        ngo.badge = badge;
        ngo.rejectionReason = undefined;
        await ngo.save();
        try {
            const ngoUser = ngo.userId;
            await (0, emailService_1.sendNGOStatusUpdateEmail)(ngoUser.email, ngoUser.profile.firstName, ngo.organizationName, 'verified');
        }
        catch (emailError) {
            console.error('Failed to send NGO verification email:', emailError);
        }
        return res.json({
            success: true,
            data: { ngo },
            message: 'NGO verified successfully',
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('Verify NGO error:', error);
        return res.status(500).json({
            success: false,
            error: {
                code: 'VERIFICATION_ERROR',
                message: 'Failed to verify NGO',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            timestamp: new Date().toISOString()
        });
    }
};
exports.verifyNGO = verifyNGO;
const rejectNGO = async (req, res) => {
    try {
        const user = req.user;
        const { ngoId } = req.params;
        const { reason } = req.body;
        if (!user || user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: {
                    code: 'FORBIDDEN',
                    message: 'Access denied',
                    details: 'Only administrators can reject NGOs'
                },
                timestamp: new Date().toISOString()
            });
        }
        if (!reason || reason.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Rejection reason is required',
                    details: 'Please provide a reason for rejecting the NGO application'
                },
                timestamp: new Date().toISOString()
            });
        }
        const ngo = await NGO_1.NGO.findById(ngoId).populate('userId', 'email profile');
        if (!ngo) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'NGO_NOT_FOUND',
                    message: 'NGO not found',
                    details: 'The requested NGO does not exist'
                },
                timestamp: new Date().toISOString()
            });
        }
        if (ngo.verificationStatus === 'verified') {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'ALREADY_VERIFIED',
                    message: 'Cannot reject verified NGO',
                    details: 'This NGO has already been verified and cannot be rejected'
                },
                timestamp: new Date().toISOString()
            });
        }
        ngo.verificationStatus = 'rejected';
        ngo.verifiedBy = user._id;
        ngo.verificationDate = new Date();
        ngo.rejectionReason = reason.trim();
        ngo.badge = undefined;
        await ngo.save();
        try {
            const ngoUser = ngo.userId;
            await (0, emailService_1.sendNGOStatusUpdateEmail)(ngoUser.email, ngoUser.profile.firstName, ngo.organizationName, 'rejected', reason);
        }
        catch (emailError) {
            console.error('Failed to send NGO rejection email:', emailError);
        }
        return res.json({
            success: true,
            data: { ngo },
            message: 'NGO rejected successfully',
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('Reject NGO error:', error);
        return res.status(500).json({
            success: false,
            error: {
                code: 'REJECTION_ERROR',
                message: 'Failed to reject NGO',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            timestamp: new Date().toISOString()
        });
    }
};
exports.rejectNGO = rejectNGO;
const getVerificationStats = async (req, res) => {
    try {
        const user = req.user;
        if (!user || user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: {
                    code: 'FORBIDDEN',
                    message: 'Access denied',
                    details: 'Only administrators can access verification statistics'
                },
                timestamp: new Date().toISOString()
            });
        }
        const stats = await NGO_1.NGO.aggregate([
            {
                $group: {
                    _id: '$verificationStatus',
                    count: { $sum: 1 }
                }
            }
        ]);
        const totalUsers = await User_1.User.countDocuments();
        const totalDonors = await User_1.User.countDocuments({ role: 'donor' });
        const totalNGOUsers = await User_1.User.countDocuments({ role: 'ngo' });
        const totalAdmins = await User_1.User.countDocuments({ role: 'admin' });
        const verificationStats = {
            pending: 0,
            verified: 0,
            rejected: 0
        };
        stats.forEach(stat => {
            if (stat._id in verificationStats) {
                verificationStats[stat._id] = stat.count;
            }
        });
        return res.json({
            success: true,
            data: {
                verification: verificationStats,
                users: {
                    total: totalUsers,
                    donors: totalDonors,
                    ngos: totalNGOUsers,
                    admins: totalAdmins
                }
            },
            message: 'Verification statistics retrieved successfully',
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('Get verification stats error:', error);
        return res.status(500).json({
            success: false,
            error: {
                code: 'STATS_ERROR',
                message: 'Failed to retrieve verification statistics',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            timestamp: new Date().toISOString()
        });
    }
};
exports.getVerificationStats = getVerificationStats;
const updateNGOBadge = async (req, res) => {
    try {
        const user = req.user;
        const { ngoId } = req.params;
        const { badge } = req.body;
        if (!user || user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: {
                    code: 'FORBIDDEN',
                    message: 'Access denied',
                    details: 'Only administrators can update NGO badges'
                },
                timestamp: new Date().toISOString()
            });
        }
        const validBadges = ['bronze', 'silver', 'gold', 'platinum'];
        if (!badge || !validBadges.includes(badge)) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Invalid badge type',
                    details: `Badge must be one of: ${validBadges.join(', ')}`
                },
                timestamp: new Date().toISOString()
            });
        }
        const ngo = await NGO_1.NGO.findById(ngoId);
        if (!ngo) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'NGO_NOT_FOUND',
                    message: 'NGO not found',
                    details: 'The requested NGO does not exist'
                },
                timestamp: new Date().toISOString()
            });
        }
        if (ngo.verificationStatus !== 'verified') {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'NOT_VERIFIED',
                    message: 'NGO is not verified',
                    details: 'Only verified NGOs can have badges updated'
                },
                timestamp: new Date().toISOString()
            });
        }
        ngo.badge = badge;
        await ngo.save();
        return res.json({
            success: true,
            data: { ngo },
            message: 'NGO badge updated successfully',
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('Update NGO badge error:', error);
        return res.status(500).json({
            success: false,
            error: {
                code: 'UPDATE_ERROR',
                message: 'Failed to update NGO badge',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            timestamp: new Date().toISOString()
        });
    }
};
exports.updateNGOBadge = updateNGOBadge;
const seedDatabase = async (req, res) => {
    try {
        if (process.env.NODE_ENV !== 'development') {
            return res.status(403).json({
                success: false,
                error: {
                    code: 'FORBIDDEN',
                    message: 'Database seeding is only allowed in development environment'
                },
                timestamp: new Date().toISOString()
            });
        }
        const { seedDatabase: seedDatabaseUtil } = await Promise.resolve().then(() => __importStar(require('../utils/seedData')));
        await seedDatabaseUtil();
        return res.json({
            success: true,
            message: 'Database seeded successfully',
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('Seed database error:', error);
        return res.status(500).json({
            success: false,
            error: {
                code: 'SEED_ERROR',
                message: 'Failed to seed database',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            timestamp: new Date().toISOString()
        });
    }
};
exports.seedDatabase = seedDatabase;
const getUsers = async (req, res) => {
    try {
        const user = req.user;
        if (!user || user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: {
                    code: 'FORBIDDEN',
                    message: 'Access denied',
                    details: 'Only administrators can access user management'
                },
                timestamp: new Date().toISOString()
            });
        }
        const { page = 1, limit = 10, role, status, search } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const filter = {};
        if (role && role !== 'all') {
            filter.role = role;
        }
        if (status === 'active') {
            filter.isActive = true;
        }
        else if (status === 'inactive') {
            filter.isActive = false;
        }
        if (search) {
            filter.$or = [
                { email: { $regex: search, $options: 'i' } },
                { 'profile.firstName': { $regex: search, $options: 'i' } },
                { 'profile.lastName': { $regex: search, $options: 'i' } }
            ];
        }
        const users = await User_1.User.find(filter)
            .select('-password')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));
        const total = await User_1.User.countDocuments(filter);
        return res.json({
            success: true,
            data: {
                users,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total,
                    pages: Math.ceil(total / Number(limit))
                }
            },
            message: 'Users retrieved successfully',
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('Get users error:', error);
        return res.status(500).json({
            success: false,
            error: {
                code: 'FETCH_ERROR',
                message: 'Failed to retrieve users',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            timestamp: new Date().toISOString()
        });
    }
};
exports.getUsers = getUsers;
const suspendUser = async (req, res) => {
    try {
        const user = req.user;
        const { userId } = req.params;
        const { reason } = req.body;
        if (!user || user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: {
                    code: 'FORBIDDEN',
                    message: 'Access denied',
                    details: 'Only administrators can suspend users'
                },
                timestamp: new Date().toISOString()
            });
        }
        const targetUser = await User_1.User.findById(userId);
        if (!targetUser) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'USER_NOT_FOUND',
                    message: 'User not found'
                },
                timestamp: new Date().toISOString()
            });
        }
        if (targetUser.role === 'admin') {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'CANNOT_SUSPEND_ADMIN',
                    message: 'Cannot suspend administrator accounts'
                },
                timestamp: new Date().toISOString()
            });
        }
        targetUser.isActive = false;
        await targetUser.save();
        return res.json({
            success: true,
            data: { user: targetUser },
            message: 'User suspended successfully',
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('Suspend user error:', error);
        return res.status(500).json({
            success: false,
            error: {
                code: 'SUSPEND_ERROR',
                message: 'Failed to suspend user',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            timestamp: new Date().toISOString()
        });
    }
};
exports.suspendUser = suspendUser;
const activateUser = async (req, res) => {
    try {
        const user = req.user;
        const { userId } = req.params;
        if (!user || user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: {
                    code: 'FORBIDDEN',
                    message: 'Access denied',
                    details: 'Only administrators can activate users'
                },
                timestamp: new Date().toISOString()
            });
        }
        const targetUser = await User_1.User.findById(userId);
        if (!targetUser) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'USER_NOT_FOUND',
                    message: 'User not found'
                },
                timestamp: new Date().toISOString()
            });
        }
        targetUser.isActive = true;
        await targetUser.save();
        return res.json({
            success: true,
            data: { user: targetUser },
            message: 'User activated successfully',
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('Activate user error:', error);
        return res.status(500).json({
            success: false,
            error: {
                code: 'ACTIVATE_ERROR',
                message: 'Failed to activate user',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            timestamp: new Date().toISOString()
        });
    }
};
exports.activateUser = activateUser;
const getAnalytics = async (req, res) => {
    try {
        const user = req.user;
        if (!user || user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: {
                    code: 'FORBIDDEN',
                    message: 'Access denied',
                    details: 'Only administrators can access analytics'
                },
                timestamp: new Date().toISOString()
            });
        }
        const totalUsers = await User_1.User.countDocuments();
        const totalDonors = await User_1.User.countDocuments({ role: 'donor' });
        const totalNGOs = await User_1.User.countDocuments({ role: 'ngo' });
        const totalAdmins = await User_1.User.countDocuments({ role: 'admin' });
        const verifiedNGOs = await NGO_1.NGO.countDocuments({ verificationStatus: 'verified' });
        const pendingNGOs = await NGO_1.NGO.countDocuments({ verificationStatus: 'pending' });
        const rejectedNGOs = await NGO_1.NGO.countDocuments({ verificationStatus: 'rejected' });
        let donationStats = {
            total: 0,
            available: 0,
            completed: 0,
            cancelled: 0
        };
        try {
            const { Donation } = await Promise.resolve().then(() => __importStar(require('../models/Donation')));
            donationStats = {
                total: await Donation.countDocuments(),
                available: await Donation.countDocuments({ status: 'available' }),
                completed: await Donation.countDocuments({ status: 'completed' }),
                cancelled: await Donation.countDocuments({ status: 'cancelled' })
            };
        }
        catch (error) {
        }
        return res.json({
            success: true,
            data: {
                users: {
                    total: totalUsers,
                    donors: totalDonors,
                    ngos: totalNGOs,
                    admins: totalAdmins
                },
                ngos: {
                    verified: verifiedNGOs,
                    pending: pendingNGOs,
                    rejected: rejectedNGOs,
                    total: verifiedNGOs + pendingNGOs + rejectedNGOs
                },
                donations: donationStats,
                growth: {
                    usersThisMonth: 0,
                    donationsThisMonth: 0,
                    ngosThisMonth: 0
                }
            },
            message: 'Analytics retrieved successfully',
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('Get analytics error:', error);
        return res.status(500).json({
            success: false,
            error: {
                code: 'ANALYTICS_ERROR',
                message: 'Failed to retrieve analytics',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            timestamp: new Date().toISOString()
        });
    }
};
exports.getAnalytics = getAnalytics;
const exportAnalytics = async (req, res) => {
    try {
        const user = req.user;
        if (!user || user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: {
                    code: 'FORBIDDEN',
                    message: 'Access denied',
                    details: 'Only administrators can export analytics'
                },
                timestamp: new Date().toISOString()
            });
        }
        const csvData = `Type,Count
Total Users,${await User_1.User.countDocuments()}
Donors,${await User_1.User.countDocuments({ role: 'donor' })}
NGOs,${await User_1.User.countDocuments({ role: 'ngo' })}
Admins,${await User_1.User.countDocuments({ role: 'admin' })}
Verified NGOs,${await NGO_1.NGO.countDocuments({ verificationStatus: 'verified' })}
Pending NGOs,${await NGO_1.NGO.countDocuments({ verificationStatus: 'pending' })}
Rejected NGOs,${await NGO_1.NGO.countDocuments({ verificationStatus: 'rejected' })}`;
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=analytics.csv');
        return res.send(csvData);
    }
    catch (error) {
        console.error('Export analytics error:', error);
        return res.status(500).json({
            success: false,
            error: {
                code: 'EXPORT_ERROR',
                message: 'Failed to export analytics',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            timestamp: new Date().toISOString()
        });
    }
};
exports.exportAnalytics = exportAnalytics;
//# sourceMappingURL=adminController.js.map