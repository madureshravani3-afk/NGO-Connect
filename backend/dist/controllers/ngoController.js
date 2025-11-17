"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportNGOReports = exports.getNGOReports = exports.getNGODashboard = exports.getVerificationStatus = exports.updateNGOProfile = exports.getNGOProfile = exports.registerNGO = void 0;
const NGO_1 = require("../models/NGO");
const upload_1 = require("../middleware/upload");
const emailService_1 = require("../services/emailService");
const registerNGO = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'Authentication required',
                    details: 'Please login to register as NGO'
                },
                timestamp: new Date().toISOString()
            });
        }
        if (user.role !== 'ngo') {
            return res.status(403).json({
                success: false,
                error: {
                    code: 'FORBIDDEN',
                    message: 'Access denied',
                    details: 'Only users with NGO role can register as NGO'
                },
                timestamp: new Date().toISOString()
            });
        }
        const existingNGO = await NGO_1.NGO.findOne({ userId: user._id });
        if (existingNGO) {
            return res.status(409).json({
                success: false,
                error: {
                    code: 'NGO_EXISTS',
                    message: 'NGO registration already exists',
                    details: 'You have already registered as an NGO'
                },
                timestamp: new Date().toISOString()
            });
        }
        const { organizationName, registrationNumber, categories, pickupService, serviceRadius, description, website } = req.body;
        const files = req.files;
        let documents = [];
        if (files && files.length > 0) {
            try {
                const fileIds = await (0, upload_1.uploadToGridFS)(files);
                documents = files.map((file, index) => ({
                    type: file.fieldname || 'other',
                    filename: file.originalname,
                    fileId: fileIds[index]
                }));
            }
            catch (uploadError) {
                console.error('File upload error:', uploadError);
                return res.status(500).json({
                    success: false,
                    error: {
                        code: 'UPLOAD_ERROR',
                        message: 'Failed to upload documents',
                        details: 'Please try uploading the documents again'
                    },
                    timestamp: new Date().toISOString()
                });
            }
        }
        const ngo = new NGO_1.NGO({
            userId: user._id,
            organizationName,
            registrationNumber: registrationNumber.toUpperCase(),
            categories,
            documents,
            pickupService: pickupService || false,
            serviceRadius: serviceRadius || 10,
            description,
            website,
            verificationStatus: 'pending'
        });
        await ngo.save();
        try {
            await (0, emailService_1.sendNGORegistrationEmail)(user.email, user.profile.firstName, organizationName);
        }
        catch (emailError) {
            console.error('Failed to send NGO registration email:', emailError);
        }
        return res.status(201).json({
            success: true,
            data: { ngo },
            message: 'NGO registration submitted successfully. Your application is under review.',
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('NGO registration error:', error);
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map((err) => ({
                field: err.path,
                message: err.message
            }));
            return res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Please fix the following validation errors',
                    details: validationErrors
                },
                timestamp: new Date().toISOString()
            });
        }
        if (error.code === 11000) {
            const duplicateField = Object.keys(error.keyPattern)[0];
            return res.status(409).json({
                success: false,
                error: {
                    code: 'DUPLICATE_ERROR',
                    message: `${duplicateField} already exists`,
                    details: `An NGO with this ${duplicateField} is already registered`
                },
                timestamp: new Date().toISOString()
            });
        }
        return res.status(500).json({
            success: false,
            error: {
                code: 'REGISTRATION_ERROR',
                message: 'Failed to register NGO',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            timestamp: new Date().toISOString()
        });
    }
};
exports.registerNGO = registerNGO;
const getNGOProfile = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'Authentication required',
                    details: 'Please login to access NGO profile'
                },
                timestamp: new Date().toISOString()
            });
        }
        const ngo = await NGO_1.NGO.findOne({ userId: user._id }).populate('userId', '-password');
        if (!ngo) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'NGO_NOT_FOUND',
                    message: 'NGO profile not found',
                    details: 'Please register as an NGO first'
                },
                timestamp: new Date().toISOString()
            });
        }
        return res.json({
            success: true,
            data: { ngo },
            message: 'NGO profile retrieved successfully',
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('Get NGO profile error:', error);
        return res.status(500).json({
            success: false,
            error: {
                code: 'PROFILE_ERROR',
                message: 'Failed to retrieve NGO profile',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            timestamp: new Date().toISOString()
        });
    }
};
exports.getNGOProfile = getNGOProfile;
const updateNGOProfile = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'Authentication required',
                    details: 'Please login to update NGO profile'
                },
                timestamp: new Date().toISOString()
            });
        }
        const ngo = await NGO_1.NGO.findOne({ userId: user._id });
        if (!ngo) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'NGO_NOT_FOUND',
                    message: 'NGO profile not found',
                    details: 'Please register as an NGO first'
                },
                timestamp: new Date().toISOString()
            });
        }
        const updates = { ...req.body };
        delete updates.userId;
        delete updates.verificationStatus;
        delete updates.verifiedBy;
        delete updates.verificationDate;
        delete updates.badge;
        delete updates._id;
        delete updates.createdAt;
        delete updates.updatedAt;
        if (ngo.verificationStatus === 'verified') {
            delete updates.organizationName;
            delete updates.registrationNumber;
            delete updates.documents;
        }
        const files = req.files;
        if (files && files.length > 0 && ngo.verificationStatus !== 'verified') {
            try {
                const fileIds = await (0, upload_1.uploadToGridFS)(files);
                const newDocuments = files.map((file, index) => ({
                    type: file.fieldname || 'other',
                    filename: file.originalname,
                    fileId: fileIds[index]
                }));
                updates.documents = [...(ngo.documents || []), ...newDocuments];
            }
            catch (uploadError) {
                console.error('File upload error:', uploadError);
                return res.status(500).json({
                    success: false,
                    error: {
                        code: 'UPLOAD_ERROR',
                        message: 'Failed to upload documents',
                        details: 'Please try uploading the documents again'
                    },
                    timestamp: new Date().toISOString()
                });
            }
        }
        const updatedNGO = await NGO_1.NGO.findByIdAndUpdate(ngo._id, { $set: updates }, { new: true, runValidators: true }).populate('userId', '-password');
        return res.json({
            success: true,
            data: { ngo: updatedNGO },
            message: 'NGO profile updated successfully',
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('Update NGO profile error:', error);
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map((err) => ({
                field: err.path,
                message: err.message
            }));
            return res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Please fix the following validation errors',
                    details: validationErrors
                },
                timestamp: new Date().toISOString()
            });
        }
        return res.status(500).json({
            success: false,
            error: {
                code: 'UPDATE_ERROR',
                message: 'Failed to update NGO profile',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            timestamp: new Date().toISOString()
        });
    }
};
exports.updateNGOProfile = updateNGOProfile;
const getVerificationStatus = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'Authentication required',
                    details: 'Please login to check verification status'
                },
                timestamp: new Date().toISOString()
            });
        }
        const ngo = await NGO_1.NGO.findOne({ userId: user._id })
            .select('verificationStatus verificationDate rejectionReason badge')
            .populate('verifiedBy', 'profile.firstName profile.lastName');
        if (!ngo) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'NGO_NOT_FOUND',
                    message: 'NGO profile not found',
                    details: 'Please register as an NGO first'
                },
                timestamp: new Date().toISOString()
            });
        }
        return res.json({
            success: true,
            data: {
                verificationStatus: ngo.verificationStatus,
                verificationDate: ngo.verificationDate,
                rejectionReason: ngo.rejectionReason,
                badge: ngo.badge,
                verifiedBy: ngo.verifiedBy
            },
            message: 'Verification status retrieved successfully',
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('Get verification status error:', error);
        return res.status(500).json({
            success: false,
            error: {
                code: 'STATUS_ERROR',
                message: 'Failed to retrieve verification status',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            timestamp: new Date().toISOString()
        });
    }
};
exports.getVerificationStatus = getVerificationStatus;
const getNGODashboard = async (req, res) => {
    try {
        const user = req.user;
        if (!user || user.role !== 'ngo') {
            return res.status(403).json({
                success: false,
                error: {
                    code: 'FORBIDDEN',
                    message: 'Access denied',
                    details: 'Only NGOs can access dashboard data'
                },
                timestamp: new Date().toISOString()
            });
        }
        const ngo = await NGO_1.NGO.findOne({ userId: user._id });
        if (!ngo) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'NGO_NOT_FOUND',
                    message: 'NGO profile not found'
                },
                timestamp: new Date().toISOString()
            });
        }
        const dashboardData = {
            stats: {
                totalDonationsReceived: 0,
                activeDonations: 0,
                completedDonations: 0,
                totalImpact: 0
            },
            recentDonations: [],
            upcomingPickups: [],
            notifications: []
        };
        return res.json({
            success: true,
            data: { dashboard: dashboardData },
            message: 'Dashboard data retrieved successfully',
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('Get NGO dashboard error:', error);
        return res.status(500).json({
            success: false,
            error: {
                code: 'DASHBOARD_ERROR',
                message: 'Failed to retrieve dashboard data',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            timestamp: new Date().toISOString()
        });
    }
};
exports.getNGODashboard = getNGODashboard;
const getNGOReports = async (req, res) => {
    try {
        const user = req.user;
        if (!user || user.role !== 'ngo') {
            return res.status(403).json({
                success: false,
                error: {
                    code: 'FORBIDDEN',
                    message: 'Access denied',
                    details: 'Only NGOs can access reports'
                },
                timestamp: new Date().toISOString()
            });
        }
        const reportData = {
            summary: {
                totalDonations: 0,
                totalValue: 0,
                beneficiariesServed: 0,
                impactScore: 0
            },
            monthlyData: [],
            categoryBreakdown: [],
            donorInsights: []
        };
        return res.json({
            success: true,
            data: { reports: reportData },
            message: 'Reports retrieved successfully',
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('Get NGO reports error:', error);
        return res.status(500).json({
            success: false,
            error: {
                code: 'REPORTS_ERROR',
                message: 'Failed to retrieve reports',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            timestamp: new Date().toISOString()
        });
    }
};
exports.getNGOReports = getNGOReports;
const exportNGOReports = async (req, res) => {
    try {
        const user = req.user;
        if (!user || user.role !== 'ngo') {
            return res.status(403).json({
                success: false,
                error: {
                    code: 'FORBIDDEN',
                    message: 'Access denied',
                    details: 'Only NGOs can export reports'
                },
                timestamp: new Date().toISOString()
            });
        }
        const csvData = `Report Type,Value
Total Donations,0
Total Value,0
Beneficiaries Served,0
Impact Score,0`;
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=ngo-report.csv');
        return res.send(csvData);
    }
    catch (error) {
        console.error('Export NGO reports error:', error);
        return res.status(500).json({
            success: false,
            error: {
                code: 'EXPORT_ERROR',
                message: 'Failed to export reports',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            timestamp: new Date().toISOString()
        });
    }
};
exports.exportNGOReports = exportNGOReports;
//# sourceMappingURL=ngoController.js.map