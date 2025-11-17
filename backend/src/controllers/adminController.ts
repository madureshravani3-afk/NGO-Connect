import { Request, Response } from 'express';
import { NGO } from '../models/NGO';
import { User } from '../models/User';
import { sendNGOStatusUpdateEmail } from '../services/emailService';

// Get pending NGO verifications
export const getPendingNGOs = async (req: Request, res: Response) => {
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

    // Build filter based on status
    const filter: any = {};
    if (status && status !== 'all') {
      filter.verificationStatus = status;
    }

    const ngos = await NGO.find(filter)
      .populate('userId', 'email profile createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await NGO.countDocuments(filter);

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

  } catch (error) {
    console.error('Get pending NGOs error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to retrieve NGO verifications',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      timestamp: new Date().toISOString()
    });
  }
};

// Get NGO details for verification
export const getNGODetails = async (req: Request, res: Response) => {
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

    const ngo = await NGO.findById(ngoId)
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

  } catch (error) {
    console.error('Get NGO details error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to retrieve NGO details',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      timestamp: new Date().toISOString()
    });
  }
};

// Verify NGO (approve)
export const verifyNGO = async (req: Request, res: Response) => {
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

    const ngo = await NGO.findById(ngoId).populate('userId', 'email profile');

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

    // Update NGO verification status
    ngo.verificationStatus = 'verified';
    ngo.verifiedBy = user._id as any;
    ngo.verificationDate = new Date();
    ngo.badge = badge;
    ngo.rejectionReason = undefined; // Clear any previous rejection reason

    await ngo.save();

    // Send verification email to NGO
    try {
      const ngoUser = ngo.userId as any;
      await sendNGOStatusUpdateEmail(
        ngoUser.email,
        ngoUser.profile.firstName,
        ngo.organizationName,
        'verified'
      );
    } catch (emailError) {
      console.error('Failed to send NGO verification email:', emailError);
      // Continue with success response even if email fails
    }

    return res.json({
      success: true,
      data: { ngo },
      message: 'NGO verified successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Verify NGO error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'VERIFICATION_ERROR',
        message: 'Failed to verify NGO',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      timestamp: new Date().toISOString()
    });
  }
};

// Reject NGO
export const rejectNGO = async (req: Request, res: Response) => {
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

    const ngo = await NGO.findById(ngoId).populate('userId', 'email profile');

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

    // Update NGO verification status
    ngo.verificationStatus = 'rejected';
    ngo.verifiedBy = user._id as any;
    ngo.verificationDate = new Date();
    ngo.rejectionReason = reason.trim();
    ngo.badge = undefined; // Remove any badge

    await ngo.save();

    // Send rejection email to NGO
    try {
      const ngoUser = ngo.userId as any;
      await sendNGOStatusUpdateEmail(
        ngoUser.email,
        ngoUser.profile.firstName,
        ngo.organizationName,
        'rejected',
        reason
      );
    } catch (emailError) {
      console.error('Failed to send NGO rejection email:', emailError);
      // Continue with success response even if email fails
    }

    return res.json({
      success: true,
      data: { ngo },
      message: 'NGO rejected successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Reject NGO error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'REJECTION_ERROR',
        message: 'Failed to reject NGO',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      timestamp: new Date().toISOString()
    });
  }
};

// Get verification statistics
export const getVerificationStats = async (req: Request, res: Response) => {
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

    const stats = await NGO.aggregate([
      {
        $group: {
          _id: '$verificationStatus',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalUsers = await User.countDocuments();
    const totalDonors = await User.countDocuments({ role: 'donor' });
    const totalNGOUsers = await User.countDocuments({ role: 'ngo' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });

    // Format stats
    const verificationStats = {
      pending: 0,
      verified: 0,
      rejected: 0
    };

    stats.forEach(stat => {
      if (stat._id in verificationStats) {
        verificationStats[stat._id as keyof typeof verificationStats] = stat.count;
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

  } catch (error) {
    console.error('Get verification stats error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'STATS_ERROR',
        message: 'Failed to retrieve verification statistics',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      timestamp: new Date().toISOString()
    });
  }
};

// Update NGO badge
export const updateNGOBadge = async (req: Request, res: Response) => {
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

    const ngo = await NGO.findById(ngoId);

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

  } catch (error) {
    console.error('Update NGO badge error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_ERROR',
        message: 'Failed to update NGO badge',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      timestamp: new Date().toISOString()
    });
  }
};
// Seed database - development only
export const seedDatabase = async (req: Request, res: Response) => {
  try {
    // Only allow in development environment
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

    // Import the seeding utility
    const { seedDatabase: seedDatabaseUtil } = await import('../utils/seedData');
    
    await seedDatabaseUtil();

    return res.json({
      success: true,
      message: 'Database seeded successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Seed database error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'SEED_ERROR',
        message: 'Failed to seed database',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      timestamp: new Date().toISOString()
    });
  }
};

// Get users with filtering and pagination
export const getUsers = async (req: Request, res: Response) => {
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

    // Build filter
    const filter: any = {};
    if (role && role !== 'all') {
      filter.role = role;
    }
    if (status === 'active') {
      filter.isActive = true;
    } else if (status === 'inactive') {
      filter.isActive = false;
    }
    if (search) {
      filter.$or = [
        { email: { $regex: search, $options: 'i' } },
        { 'profile.firstName': { $regex: search, $options: 'i' } },
        { 'profile.lastName': { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await User.countDocuments(filter);

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

  } catch (error) {
    console.error('Get users error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to retrieve users',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      timestamp: new Date().toISOString()
    });
  }
};

// Suspend user
export const suspendUser = async (req: Request, res: Response) => {
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

    const targetUser = await User.findById(userId);
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

    // Don't allow suspending other admins
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

  } catch (error) {
    console.error('Suspend user error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'SUSPEND_ERROR',
        message: 'Failed to suspend user',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      timestamp: new Date().toISOString()
    });
  }
};

// Activate user
export const activateUser = async (req: Request, res: Response) => {
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

    const targetUser = await User.findById(userId);
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

  } catch (error) {
    console.error('Activate user error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'ACTIVATE_ERROR',
        message: 'Failed to activate user',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      timestamp: new Date().toISOString()
    });
  }
};

// Get analytics data
export const getAnalytics = async (req: Request, res: Response) => {
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

    // Get basic stats
    const totalUsers = await User.countDocuments();
    const totalDonors = await User.countDocuments({ role: 'donor' });
    const totalNGOs = await User.countDocuments({ role: 'ngo' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });

    // Get NGO verification stats
    const verifiedNGOs = await NGO.countDocuments({ verificationStatus: 'verified' });
    const pendingNGOs = await NGO.countDocuments({ verificationStatus: 'pending' });
    const rejectedNGOs = await NGO.countDocuments({ verificationStatus: 'rejected' });

    // Get donation stats (if Donation model exists)
    let donationStats = {
      total: 0,
      available: 0,
      completed: 0,
      cancelled: 0
    };

    try {
      const { Donation } = await import('../models/Donation');
      donationStats = {
        total: await Donation.countDocuments(),
        available: await Donation.countDocuments({ status: 'available' }),
        completed: await Donation.countDocuments({ status: 'completed' }),
        cancelled: await Donation.countDocuments({ status: 'cancelled' })
      };
    } catch (error) {
      // Donation model might not be available
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
          // This would require more complex queries for time-based data
          usersThisMonth: 0,
          donationsThisMonth: 0,
          ngosThisMonth: 0
        }
      },
      message: 'Analytics retrieved successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get analytics error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'ANALYTICS_ERROR',
        message: 'Failed to retrieve analytics',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      timestamp: new Date().toISOString()
    });
  }
};

// Export analytics data
export const exportAnalytics = async (req: Request, res: Response) => {
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

    // For now, return a simple CSV format
    const csvData = `Type,Count
Total Users,${await User.countDocuments()}
Donors,${await User.countDocuments({ role: 'donor' })}
NGOs,${await User.countDocuments({ role: 'ngo' })}
Admins,${await User.countDocuments({ role: 'admin' })}
Verified NGOs,${await NGO.countDocuments({ verificationStatus: 'verified' })}
Pending NGOs,${await NGO.countDocuments({ verificationStatus: 'pending' })}
Rejected NGOs,${await NGO.countDocuments({ verificationStatus: 'rejected' })}`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=analytics.csv');
    
    return res.send(csvData);

  } catch (error) {
    console.error('Export analytics error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'EXPORT_ERROR',
        message: 'Failed to export analytics',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      timestamp: new Date().toISOString()
    });
  }
};