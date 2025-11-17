import { Request, Response } from 'express';
import { Donation, IDonation } from '../models/Donation';
import { uploadToGridFS, deleteFileFromGridFS } from '../middleware/upload';
import { sendDonationStatusNotification } from '../services/notificationService';
import mongoose from 'mongoose';

// Create a new donation
export const createDonation = async (req: Request, res: Response) => {
  try {
    console.log('Received donation request body:', req.body);
    console.log('Received files:', req.files);
    
    const {
      title,
      description,
      category,
      quantity,
      location,
      pickupOption,
      foodExpiry,
      amount,
      urgency = 'medium'
    } = req.body;

    // Get donor ID from authenticated user
    const donorId = req.user!._id;

    // Handle image uploads if any
    let imageIds: string[] = [];
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      try {
        imageIds = await uploadToGridFS(req.files as Express.Multer.File[]);
      } catch (uploadError) {
        return res.status(500).json({
          success: false,
          error: {
            code: 'IMAGE_UPLOAD_FAILED',
            message: 'Failed to upload images',
            details: process.env.NODE_ENV === 'development' ? (uploadError as Error).message : undefined
          },
          timestamp: new Date().toISOString()
        });
      }
    }

    // Parse location data (it might come as JSON string from FormData)
    console.log('Location data type:', typeof location);
    console.log('Location data value:', location);
    
    let locationData;
    if (typeof location === 'string') {
      try {
        locationData = JSON.parse(location);
        console.log('Parsed location data:', locationData);
      } catch (error) {
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
    } else {
      locationData = location;
      console.log('Location data is object:', locationData);
    }

    // Validate location data
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

    // Create donation data
    const donationData: Partial<IDonation> = {
      donorId: donorId as mongoose.Types.ObjectId,
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

    // Add food expiry if it's a food donation
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
      const minExpiry = new Date(now.getTime() + (3 * 60 * 60 * 1000)); // 3 hours from now

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

    // Add amount if it's a financial donation
    if (category === 'financial' && amount) {
      donationData.amount = parseFloat(amount);
    }

    // Create and save the donation
    const donation = new Donation(donationData);
    await donation.save();

    // Populate donor information for response
    await donation.populate('donorId', 'profile.firstName profile.lastName email');

    return res.status(201).json({
      success: true,
      message: 'Donation created successfully',
      data: {
        donation
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    // Clean up uploaded images if donation creation fails
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      try {
        const imageIds = await uploadToGridFS(req.files as Express.Multer.File[]);
        await Promise.all(imageIds.map(id => deleteFileFromGridFS(id)));
      } catch (cleanupError) {
        console.error('Failed to cleanup uploaded images:', cleanupError);
      }
    }

    if (error instanceof mongoose.Error.ValidationError) {
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
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      timestamp: new Date().toISOString()
    });
  }
};

// Get donations by donor
export const getDonorDonations = async (req: Request, res: Response) => {
  try {
    const donorId = req.user!._id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;
    const category = req.query.category as string;

    // Build filter
    const filter: any = { donorId };
    
    if (status) {
      filter.status = status;
    }
    
    if (category) {
      filter.category = category;
    }

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Get donations with pagination
    const donations = await Donation.find(filter)
      .populate('donorId', 'profile.firstName profile.lastName email')
      .populate('acceptedBy', 'profile.firstName profile.lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const totalCount = await Donation.countDocuments(filter);
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

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'DONATIONS_FETCH_FAILED',
        message: 'Failed to retrieve donations',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      timestamp: new Date().toISOString()
    });
  }
};

// Get donation by ID
export const getDonationById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
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

    const donation = await Donation.findById(id)
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

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'DONATION_FETCH_FAILED',
        message: 'Failed to retrieve donation',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      timestamp: new Date().toISOString()
    });
  }
};

// Update donation
export const updateDonation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const donorId = req.user!._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
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

    // Find the donation
    const donation = await Donation.findById(id);

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

    // Check if user owns the donation
    if (donation.donorId.toString() !== (donorId as mongoose.Types.ObjectId).toString()) {
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

    // Check if donation can be updated (only available donations can be updated)
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

    // Update allowed fields
    const {
      title,
      description,
      quantity,
      location,
      pickupOption,
      foodExpiry,
      urgency
    } = req.body;

    if (title !== undefined) donation.title = title.trim();
    if (description !== undefined) donation.description = description?.trim();
    if (quantity !== undefined) donation.quantity = quantity?.trim();
    if (pickupOption !== undefined) donation.pickupOption = pickupOption;
    if (urgency !== undefined) donation.urgency = urgency;

    if (location) {
      if (location.address) donation.location.address = location.address.trim();
      if (location.coordinates) {
        donation.location.coordinates.lat = parseFloat(location.coordinates.lat);
        donation.location.coordinates.lng = parseFloat(location.coordinates.lng);
      }
    }

    // Update food expiry if it's a food donation
    if (donation.category === 'food' && foodExpiry !== undefined) {
      donation.foodExpiry = foodExpiry ? new Date(foodExpiry) : undefined;
    }

    await donation.save();

    // Populate for response
    await donation.populate('donorId', 'profile.firstName profile.lastName email');

    return res.status(200).json({
      success: true,
      message: 'Donation updated successfully',
      data: {
        donation
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
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
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      timestamp: new Date().toISOString()
    });
  }
};

// Update donation status
export const updateDonationStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, cancellationReason } = req.body;
    const userId = req.user!._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
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

    // Find the donation
    const donation = await Donation.findById(id)
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

    // Validate status transitions and permissions
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

    // Check permissions and valid status transitions
    const userRole = req.user!.role;
    const userIdStr = (userId as mongoose.Types.ObjectId).toString();
    const isDonor = donation.donorId._id.toString() === userIdStr;
    const isAcceptedNGO = donation.acceptedBy && donation.acceptedBy._id.toString() === userIdStr;

    // Status transition rules
    switch (status) {
      case 'cancelled':
        // Only donor can cancel, and only if not yet collected
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
        // Only NGOs can accept available donations
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
        // Only the NGO that accepted can mark as collected
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
        // Either donor or accepting NGO can mark as completed
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
        // Cannot revert to available once accepted
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

    // Update the donation status
    const oldStatus = donation.status;
    donation.status = status;

    // Set acceptedBy for accepted status
    if (status === 'accepted') {
      donation.acceptedBy = userId as mongoose.Types.ObjectId;
    }

    // Set cancellation reason for cancelled status
    if (status === 'cancelled' && cancellationReason) {
      donation.cancellationReason = cancellationReason.trim();
    }

    await donation.save();

    // Send notifications to relevant parties
    try {
      if (status === 'accepted') {
        // Notify donor that their donation was accepted
        await sendDonationStatusNotification({
          type: 'donation_accepted',
          recipient: donation.donorId as any,
          donation,
          actor: req.user!
        });
      } else if (status === 'cancelled') {
        // Notify accepting NGO if donation was cancelled
        if (donation.acceptedBy) {
          await sendDonationStatusNotification({
            type: 'donation_cancelled',
            recipient: donation.acceptedBy as any,
            donation,
            statusChange: {
              from: oldStatus,
              to: status,
              reason: cancellationReason
            }
          });
        }
      } else if (status === 'completed') {
        // Notify both donor and NGO about completion
        await sendDonationStatusNotification({
          type: 'donation_completed',
          recipient: donation.donorId as any,
          donation
        });
        
        if (donation.acceptedBy && donation.acceptedBy._id.toString() !== donation.donorId._id.toString()) {
          await sendDonationStatusNotification({
            type: 'donation_completed',
            recipient: donation.acceptedBy as any,
            donation
          });
        }
      } else {
        // General status change notification
        const recipientId = status === 'collected' ? donation.donorId._id : 
                           (donation.acceptedBy ? donation.acceptedBy._id : donation.donorId._id);
        
        if (recipientId.toString() !== userIdStr) {
          const recipient = status === 'collected' ? donation.donorId : 
                           (donation.acceptedBy || donation.donorId);
          
          await sendDonationStatusNotification({
            type: 'donation_status_change',
            recipient: recipient as any,
            donation,
            statusChange: {
              from: oldStatus,
              to: status
            }
          });
        }
      }
    } catch (notificationError) {
      console.error('Failed to send notification:', notificationError);
      // Don't fail the request if notification fails
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

  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
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
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      timestamp: new Date().toISOString()
    });
  }
};

// Get donation timeline/history
export const getDonationTimeline = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
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

    const donation = await Donation.findById(id)
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

    // Build timeline from donation data
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

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'TIMELINE_FETCH_FAILED',
        message: 'Failed to retrieve donation timeline',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      timestamp: new Date().toISOString()
    });
  }
};

// Get available donations with search and filtering
export const getAvailableDonations = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const category = req.query.category as string;
    const search = req.query.search as string;
    const urgency = req.query.urgency as string;
    const lat = parseFloat(req.query.lat as string);
    const lng = parseFloat(req.query.lng as string);
    const radius = parseFloat(req.query.radius as string) || 10; // Default 10km radius
    const sortBy = req.query.sortBy as string || 'createdAt';
    const sortOrder = req.query.sortOrder as string || 'desc';

    // Build filter for available donations only
    const filter: any = { 
      status: 'available'
    };

    // Category filter
    if (category) {
      const validCategories = ['food', 'clothing', 'books', 'electronics', 'financial', 'other'];
      if (validCategories.includes(category)) {
        filter.category = category;
      }
    }

    // Urgency filter
    if (urgency) {
      const validUrgencies = ['low', 'medium', 'high'];
      if (validUrgencies.includes(urgency)) {
        filter.urgency = urgency;
      }
    }

    // Text search filter
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Location-based filter
    if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      filter['location.coordinates'] = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat]
          },
          $maxDistance: radius * 1000 // Convert km to meters
        }
      };
    }

    // Food expiry filter - exclude expired food
    const now = new Date();
    filter.$or = filter.$or || [];
    filter.$or.push(
      { category: { $ne: 'food' } }, // Non-food items
      { 
        category: 'food', 
        foodExpiry: { $gt: now } // Food items that haven't expired
      }
    );

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Build sort object
    const sort: any = {};
    const validSortFields = ['createdAt', 'urgency', 'category', 'title'];
    if (validSortFields.includes(sortBy)) {
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    } else {
      sort.createdAt = -1; // Default sort
    }

    // Special handling for urgency sorting
    if (sortBy === 'urgency') {
      sort.urgency = sortOrder === 'asc' ? 1 : -1;
      sort.createdAt = -1; // Secondary sort by creation date
    }

    // Get donations with pagination
    const donations = await Donation.find(filter)
      .populate('donorId', 'profile.firstName profile.lastName email profile.phone')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const totalCount = await Donation.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / limit);

    // Add distance information if location was provided
    const donationsWithDistance = donations.map(donation => {
      const donationObj = donation.toObject() as any;
      
      if (!isNaN(lat) && !isNaN(lng)) {
        const donationLat = donation.location.coordinates.lat;
        const donationLng = donation.location.coordinates.lng;
        const distance = calculateDistance(lat, lng, donationLat, donationLng);
        donationObj.distance = Math.round(distance * 100) / 100; // Round to 2 decimal places
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

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'DONATIONS_SEARCH_FAILED',
        message: 'Failed to search donations',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      timestamp: new Date().toISOString()
    });
  }
};

// Get donation categories with counts
export const getDonationCategories = async (req: Request, res: Response) => {
  try {
    const lat = parseFloat(req.query.lat as string);
    const lng = parseFloat(req.query.lng as string);
    const radius = parseFloat(req.query.radius as string) || 10;

    // Build base filter for available donations
    const baseFilter: any = { 
      status: 'available'
    };

    // Add location filter if provided
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

    // Exclude expired food
    const now = new Date();
    baseFilter.$or = [
      { category: { $ne: 'food' } },
      { 
        category: 'food', 
        foodExpiry: { $gt: now }
      }
    ];

    // Aggregate donations by category
    const categoryStats = await Donation.aggregate([
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

    // Get total count
    const totalCount = await Donation.countDocuments(baseFilter);

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

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'CATEGORIES_FETCH_FAILED',
        message: 'Failed to retrieve donation categories',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      timestamp: new Date().toISOString()
    });
  }
};

// Get nearby donations (location-based search)
export const getNearbyDonations = async (req: Request, res: Response) => {
  try {
    const lat = parseFloat(req.query.lat as string);
    const lng = parseFloat(req.query.lng as string);
    const radius = parseFloat(req.query.radius as string) || 5; // Default 5km radius
    const limit = parseInt(req.query.limit as string) || 20;
    const category = req.query.category as string;

    // Validate coordinates
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

    // Build filter
    const filter: any = {
      status: 'available',
      'location.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat]
          },
          $maxDistance: radius * 1000 // Convert km to meters
        }
      }
    };

    // Category filter
    if (category) {
      const validCategories = ['food', 'clothing', 'books', 'electronics', 'financial', 'other'];
      if (validCategories.includes(category)) {
        filter.category = category;
      }
    }

    // Exclude expired food
    const now = new Date();
    filter.$or = [
      { category: { $ne: 'food' } },
      { 
        category: 'food', 
        foodExpiry: { $gt: now }
      }
    ];

    // Get nearby donations
    const donations = await Donation.find(filter)
      .populate('donorId', 'profile.firstName profile.lastName email')
      .limit(limit)
      .sort({ createdAt: -1 });

    // Add distance information
    const donationsWithDistance = donations.map(donation => {
      const donationObj = donation.toObject() as any;
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

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'NEARBY_SEARCH_FAILED',
        message: 'Failed to search nearby donations',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      timestamp: new Date().toISOString()
    });
  }
};

// Helper function to calculate distance between two coordinates (Haversine formula)
const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Delete donation
export const deleteDonation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const donorId = req.user!._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
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

    // Find the donation
    const donation = await Donation.findById(id);

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

    // Check if user owns the donation
    if (donation.donorId.toString() !== (donorId as mongoose.Types.ObjectId).toString()) {
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

    // Check if donation can be deleted (only available donations can be deleted)
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

    // Delete associated images from GridFS
    if (donation.images && donation.images.length > 0) {
      try {
        await Promise.all(donation.images.map(imageId => deleteFileFromGridFS(imageId)));
      } catch (imageDeleteError) {
        console.error('Failed to delete images:', imageDeleteError);
        // Continue with donation deletion even if image deletion fails
      }
    }

    // Delete the donation
    await Donation.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Donation deleted successfully',
      data: {
        deletedDonationId: id
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'DONATION_DELETE_FAILED',
        message: 'Failed to delete donation',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      timestamp: new Date().toISOString()
    });
  }
};

// Accept donation (NGO)
export const acceptDonation = async (req: Request, res: Response) => {
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

    const donation = await Donation.findById(id);
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

    // Update donation status
    donation.status = 'accepted';
    donation.acceptedBy = user._id as any;
    donation.acceptedAt = new Date();
    await donation.save();

    return res.json({
      success: true,
      data: { donation },
      message: 'Donation accepted successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Accept donation error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'ACCEPT_ERROR',
        message: 'Failed to accept donation',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      timestamp: new Date().toISOString()
    });
  }
};

// Reject donation (NGO)
export const rejectDonation = async (req: Request, res: Response) => {
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

    const donation = await Donation.findById(id);
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

    // For now, we'll just return success without changing the donation status
    // In a real implementation, you might want to track rejections
    
    return res.json({
      success: true,
      message: 'Donation rejected successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Reject donation error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'REJECT_ERROR',
        message: 'Failed to reject donation',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      timestamp: new Date().toISOString()
    });
  }
};