"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.logout = exports.resetPassword = exports.requestPasswordReset = exports.updateProfile = exports.getProfile = exports.login = exports.register = void 0;
const crypto_1 = __importDefault(require("crypto"));
const User_1 = require("../models/User");
const auth_1 = require("../middleware/auth");
const emailService_1 = require("../services/emailService");
const passwordResetTokens = new Map();
const register = async (req, res) => {
    try {
        const { email, password, role, profile } = req.body;
        const existingUser = await User_1.User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                error: {
                    code: 'USER_EXISTS',
                    message: 'User with this email already exists',
                    details: 'Please use a different email address or try logging in'
                },
                timestamp: new Date().toISOString()
            });
        }
        const user = new User_1.User({
            email: email.toLowerCase(),
            password,
            role,
            profile
        });
        await user.save();
        const token = (0, auth_1.generateToken)(user);
        (0, emailService_1.sendWelcomeEmail)(user.email, user.profile.firstName, user.role)
            .catch(error => console.error('Failed to send welcome email:', error));
        return res.status(201).json({
            success: true,
            data: {
                user,
                token,
                expiresIn: process.env.JWT_EXPIRES_IN || '7d'
            },
            message: 'User registered successfully',
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('Registration error:', error);
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
            return res.status(409).json({
                success: false,
                error: {
                    code: 'DUPLICATE_EMAIL',
                    message: 'Email address is already registered',
                    details: 'Please use a different email address'
                },
                timestamp: new Date().toISOString()
            });
        }
        return res.status(500).json({
            success: false,
            error: {
                code: 'REGISTRATION_ERROR',
                message: 'Failed to register user',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            timestamp: new Date().toISOString()
        });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User_1.User.findOne({ email: email.toLowerCase() }).select('+password');
        if (!user) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'INVALID_CREDENTIALS',
                    message: 'Invalid email or password',
                    details: 'Please check your credentials and try again'
                },
                timestamp: new Date().toISOString()
            });
        }
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'ACCOUNT_INACTIVE',
                    message: 'Account is inactive',
                    details: 'Please contact support to reactivate your account'
                },
                timestamp: new Date().toISOString()
            });
        }
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'INVALID_CREDENTIALS',
                    message: 'Invalid email or password',
                    details: 'Please check your credentials and try again'
                },
                timestamp: new Date().toISOString()
            });
        }
        const token = (0, auth_1.generateToken)(user);
        return res.json({
            success: true,
            data: {
                user: user.toJSON(),
                token,
                expiresIn: process.env.JWT_EXPIRES_IN || '7d'
            },
            message: 'Login successful',
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({
            success: false,
            error: {
                code: 'LOGIN_ERROR',
                message: 'Failed to login',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            timestamp: new Date().toISOString()
        });
    }
};
exports.login = login;
const getProfile = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'Authentication required',
                    details: 'Please login to access your profile'
                },
                timestamp: new Date().toISOString()
            });
        }
        return res.json({
            success: true,
            data: { user },
            message: 'Profile retrieved successfully',
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('Get profile error:', error);
        return res.status(500).json({
            success: false,
            error: {
                code: 'PROFILE_ERROR',
                message: 'Failed to retrieve profile',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            timestamp: new Date().toISOString()
        });
    }
};
exports.getProfile = getProfile;
const updateProfile = async (req, res) => {
    try {
        const user = req.user;
        const updates = req.body;
        if (!user) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'Authentication required',
                    details: 'Please login to update your profile'
                },
                timestamp: new Date().toISOString()
            });
        }
        delete updates.email;
        delete updates.password;
        delete updates.role;
        delete updates._id;
        delete updates.createdAt;
        delete updates.updatedAt;
        const updatedUser = await User_1.User.findByIdAndUpdate(user._id, { $set: updates }, { new: true, runValidators: true });
        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'USER_NOT_FOUND',
                    message: 'User not found',
                    details: 'Unable to update profile'
                },
                timestamp: new Date().toISOString()
            });
        }
        return res.json({
            success: true,
            data: { user: updatedUser },
            message: 'Profile updated successfully',
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('Update profile error:', error);
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
                message: 'Failed to update profile',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            timestamp: new Date().toISOString()
        });
    }
};
exports.updateProfile = updateProfile;
const requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User_1.User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.json({
                success: true,
                message: 'If an account with that email exists, a password reset link has been sent',
                timestamp: new Date().toISOString()
            });
        }
        const resetToken = crypto_1.default.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 15 * 60 * 1000);
        passwordResetTokens.set(resetToken, {
            userId: user._id.toString(),
            expires
        });
        const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
        try {
            await (0, emailService_1.sendPasswordResetEmail)(user.email, resetLink, user.profile.firstName);
        }
        catch (emailError) {
            console.error('Failed to send password reset email:', emailError);
        }
        return res.json({
            success: true,
            message: 'Password reset link has been sent to your email',
            ...(process.env.NODE_ENV === 'development' && { resetLink }),
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('Password reset request error:', error);
        return res.status(500).json({
            success: false,
            error: {
                code: 'RESET_REQUEST_ERROR',
                message: 'Failed to process password reset request',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            timestamp: new Date().toISOString()
        });
    }
};
exports.requestPasswordReset = requestPasswordReset;
const resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;
        const tokenData = passwordResetTokens.get(token);
        if (!tokenData || tokenData.expires < new Date()) {
            passwordResetTokens.delete(token);
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_TOKEN',
                    message: 'Invalid or expired reset token',
                    details: 'Please request a new password reset link'
                },
                timestamp: new Date().toISOString()
            });
        }
        const user = await User_1.User.findById(tokenData.userId);
        if (!user) {
            passwordResetTokens.delete(token);
            return res.status(404).json({
                success: false,
                error: {
                    code: 'USER_NOT_FOUND',
                    message: 'User not found',
                    details: 'Unable to reset password'
                },
                timestamp: new Date().toISOString()
            });
        }
        user.password = password;
        await user.save();
        passwordResetTokens.delete(token);
        return res.json({
            success: true,
            message: 'Password reset successfully',
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('Password reset error:', error);
        return res.status(500).json({
            success: false,
            error: {
                code: 'RESET_ERROR',
                message: 'Failed to reset password',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            timestamp: new Date().toISOString()
        });
    }
};
exports.resetPassword = resetPassword;
const logout = async (req, res) => {
    try {
        return res.json({
            success: true,
            message: 'Logged out successfully',
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('Logout error:', error);
        return res.status(500).json({
            success: false,
            error: {
                code: 'LOGOUT_ERROR',
                message: 'Failed to logout',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            timestamp: new Date().toISOString()
        });
    }
};
exports.logout = logout;
const verifyToken = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'INVALID_TOKEN',
                    message: 'Invalid or expired token',
                    details: 'Please login again'
                },
                timestamp: new Date().toISOString()
            });
        }
        return res.json({
            success: true,
            data: { user },
            message: 'Token is valid',
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('Token verification error:', error);
        return res.status(500).json({
            success: false,
            error: {
                code: 'VERIFICATION_ERROR',
                message: 'Failed to verify token',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            timestamp: new Date().toISOString()
        });
    }
};
exports.verifyToken = verifyToken;
//# sourceMappingURL=authController.js.map