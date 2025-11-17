import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User, IUser } from '../models/User';
import { generateToken } from '../middleware/auth';
import { sendPasswordResetEmail, sendWelcomeEmail } from '../services/emailService';

// Temporary storage for password reset tokens (in production, use Redis or database)
const passwordResetTokens = new Map<string, { userId: string; expires: Date }>();

// Register new user
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, role, profile } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
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

    // Create new user
    const user = new User({
      email: email.toLowerCase(),
      password,
      role,
      profile
    });

    await user.save();

    // Generate JWT token
    const token = generateToken(user);

    // Send welcome email (don't wait for it to complete)
    sendWelcomeEmail(user.email, user.profile.firstName, user.role)
      .catch(error => console.error('Failed to send welcome email:', error));

    // Return success response (password is automatically excluded by toJSON transform)
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

  } catch (error) {
    console.error('Registration error:', error);

    // Handle mongoose validation errors
    if ((error as any).name === 'ValidationError') {
      const validationErrors = Object.values((error as any).errors).map((err: any) => ({
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

    // Handle duplicate key error
    if ((error as any).code === 11000) {
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
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      timestamp: new Date().toISOString()
    });
  }
};

// Login user
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
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

    // Check if user is active
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

    // Verify password
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

    // Generate JWT token
    const token = generateToken(user);

    // Return success response (password is automatically excluded by toJSON transform)
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

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'LOGIN_ERROR',
        message: 'Failed to login',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      timestamp: new Date().toISOString()
    });
  }
};

// Get current user profile
export const getProfile = async (req: Request, res: Response) => {
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

  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'PROFILE_ERROR',
        message: 'Failed to retrieve profile',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      timestamp: new Date().toISOString()
    });
  }
};

// Update user profile
export const updateProfile = async (req: Request, res: Response) => {
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

    // Prevent updating sensitive fields
    delete updates.email;
    delete updates.password;
    delete updates.role;
    delete updates._id;
    delete updates.createdAt;
    delete updates.updatedAt;

    // Update user profile
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { $set: updates },
      { new: true, runValidators: true }
    );

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

  } catch (error) {
    console.error('Update profile error:', error);

    // Handle mongoose validation errors
    if ((error as any).name === 'ValidationError') {
      const validationErrors = Object.values((error as any).errors).map((err: any) => ({
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
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      timestamp: new Date().toISOString()
    });
  }
};

// Request password reset
export const requestPasswordReset = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Don't reveal if user exists or not for security
      return res.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent',
        timestamp: new Date().toISOString()
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Store token (in production, use Redis or database)
    passwordResetTokens.set(resetToken, {
      userId: (user._id as any).toString(),
      expires
    });

    // Send password reset email
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    try {
      await sendPasswordResetEmail(user.email, resetLink, user.profile.firstName);
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      // Continue with success response even if email fails
    }

    return res.json({
      success: true,
      message: 'Password reset link has been sent to your email',
      ...(process.env.NODE_ENV === 'development' && { resetLink }),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Password reset request error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'RESET_REQUEST_ERROR',
        message: 'Failed to process password reset request',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      timestamp: new Date().toISOString()
    });
  }
};

// Reset password with token
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;

    // Validate token
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

    // Find user
    const user = await User.findById(tokenData.userId);
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

    // Update password
    user.password = password;
    await user.save();

    // Remove used token
    passwordResetTokens.delete(token);

    return res.json({
      success: true,
      message: 'Password reset successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Password reset error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'RESET_ERROR',
        message: 'Failed to reset password',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      timestamp: new Date().toISOString()
    });
  }
};

// Logout (client-side token removal, but we can blacklist tokens if needed)
export const logout = async (req: Request, res: Response) => {
  try {
    // In a stateless JWT system, logout is typically handled client-side
    // by removing the token from storage. However, we can implement
    // token blacklisting here if needed for enhanced security.

    return res.json({
      success: true,
      message: 'Logged out successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'LOGOUT_ERROR',
        message: 'Failed to logout',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      timestamp: new Date().toISOString()
    });
  }
};

// Verify token (useful for frontend to check if token is still valid)
export const verifyToken = async (req: Request, res: Response) => {
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

  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'VERIFICATION_ERROR',
        message: 'Failed to verify token',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      timestamp: new Date().toISOString()
    });
  }
};